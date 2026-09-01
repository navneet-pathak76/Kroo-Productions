import "server-only";
import { randomUUID } from "crypto";
import type { TelemetrySnapshot } from "@/lib/telemetry/types";
import type {
  GeminiDiagnosticState,
  OptimizationAnalysis,
  OptimizationDiagnostics,
  OptimizationRecommendation,
} from "./types";

function diagnoseTelemetry(snapshot: TelemetrySnapshot): OptimizationDiagnostics["telemetry"] {
  const health = snapshot.health;

  if (!health.awsCredentialsConfigured) {
    return {
      state: "credentials_not_configured",
      message:
        "AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set — telemetry is only using in-process memory, which does not persist across serverless invocations.",
    };
  }

  if (!health.telemetryTableConfigured) {
    return {
      state: "table_not_configured",
      message:
        "TELEMETRY_DYNAMODB_TABLE is not set. AWS credentials are present, so telemetry is falling back to the visitor table when available.",
    };
  }

  if (health.dynamoReadError) {
    return {
      state: "read_error",
      message: `DynamoDB telemetry query failed: ${health.dynamoReadError}`,
    };
  }

  if (snapshot.totals.records === 0) {
    return {
      state: "empty",
      message: `Telemetry DynamoDB query succeeded, but returned 0 records (in-memory buffer also had ${health.memoryRecordCount}). The public site may not have generated events yet, or may be writing to a different table/region.`,
    };
  }

  return {
    state: "ok",
    message: `${snapshot.totals.records} telemetry record(s) loaded (${health.dynamoRecordCount} from DynamoDB, ${health.memoryRecordCount} from in-memory buffer, deduplicated).`,
  };
}

function analyzeWebVitals(snapshot: TelemetrySnapshot): OptimizationRecommendation[] {
  const recs: OptimizationRecommendation[] = [];
  const { webVitals } = snapshot;

  if (webVitals.LCP && webVitals.LCP.p75 > 2500) {
    recs.push({
      id: randomUUID(),
      title: "LCP exceeds recommended threshold",
      description: `75th percentile LCP is ${webVitals.LCP.p75}ms (target ≤ 2500ms). Review hero media priority, font loading, and above-fold render path.`,
      severity: webVitals.LCP.p75 > 4000 ? "critical" : "high",
      category: "performance",
      affectedRoutes: snapshot.byRoute.slice(0, 3).map((r) => r.route),
      evidence: [`LCP p75: ${webVitals.LCP.p75}ms (${webVitals.LCP.count} samples)`],
      suggestedActions: [
        "Audit priority images on affected routes",
        "Verify hero video poster and preload strategy",
        "Check capability-tier fallbacks for LOW devices",
      ],
      requiresReview: true,
      aiGenerated: false,
    });
  }

  if (webVitals.INP && webVitals.INP.p75 > 200) {
    recs.push({
      id: randomUUID(),
      title: "INP indicates interaction latency",
      description: `75th percentile INP is ${webVitals.INP.p75}ms (target ≤ 200ms). Review main-thread work during interactions.`,
      severity: webVitals.INP.p75 > 500 ? "critical" : "high",
      category: "performance",
      affectedRoutes: snapshot.byRoute.slice(0, 3).map((r) => r.route),
      evidence: [`INP p75: ${webVitals.INP.p75}ms (${webVitals.INP.count} samples)`],
      suggestedActions: [
        "Audit mousemove/pointer listeners on touch devices",
        "Verify RAF batching on magnetic and parallax effects",
        "Check for layout reads inside scroll handlers",
      ],
      requiresReview: true,
      aiGenerated: false,
    });
  }

  if (webVitals.CLS && webVitals.CLS.p75 > 0.1) {
    recs.push({
      id: randomUUID(),
      title: "Layout shift detected",
      description: `75th percentile CLS is ${webVitals.CLS.p75} (target ≤ 0.1). Review image/video dimensions and dynamic content insertion.`,
      severity: "medium",
      category: "performance",
      affectedRoutes: snapshot.byRoute.slice(0, 3).map((r) => r.route),
      evidence: [`CLS p75: ${webVitals.CLS.p75} (${webVitals.CLS.count} samples)`],
      suggestedActions: [
        "Ensure next/image width/height or aspect-ratio on all media",
        "Reserve space for lazy-loaded content",
      ],
      requiresReview: true,
      aiGenerated: false,
    });
  }

  return recs;
}

function analyzeErrors(snapshot: TelemetrySnapshot): OptimizationRecommendation[] {
  const recs: OptimizationRecommendation[] = [];

  if (snapshot.totals.clientErrors > 0) {
    const topError = snapshot.recentErrors[0];
    recs.push({
      id: randomUUID(),
      title: "Client-side errors detected",
      description: `${snapshot.totals.clientErrors} client error(s) recorded. Most recent: ${topError?.message?.slice(0, 120) ?? "unknown"}`,
      severity: snapshot.totals.clientErrors > 10 ? "critical" : "high",
      category: "telemetry",
      affectedRoutes: [...new Set(snapshot.recentErrors.map((e) => e.route))].slice(0, 5),
      evidence: snapshot.recentErrors.slice(0, 3).map((e) => `${e.route}: ${e.message?.slice(0, 80)}`),
      suggestedActions: [
        "Reproduce error in browser devtools",
        "Fix root cause before deploying optimizations",
      ],
      requiresReview: true,
      aiGenerated: false,
    });
  }

  if (snapshot.totals.mediaErrors > 0) {
    recs.push({
      id: randomUUID(),
      title: "Media loading failures",
      description: `${snapshot.totals.mediaErrors} media error(s) detected. Verify CDN URLs and optimized variants.`,
      severity: "high",
      category: "media",
      affectedRoutes: [...new Set(snapshot.recentErrors.filter((e) => e.kind === "media-error").map((e) => e.route))],
      evidence: snapshot.recentErrors
        .filter((e) => e.kind === "media-error")
        .slice(0, 3)
        .map((e) => e.message ?? "unknown"),
      suggestedActions: [
        "Verify CloudFront/S3 paths in media-config",
        "Check video poster and fallback sources",
        "Ensure optimized variants exist before switching URLs",
      ],
      requiresReview: true,
      aiGenerated: false,
    });
  }

  return recs;
}

type GeminiAnalysisResult =
  | { ok: true; recommendations: OptimizationRecommendation[]; summary: string }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "request_failed"; error: string };

function resolveGeminiModel(): string {
  const configured = process.env.GEMINI_MODEL?.trim();

  // Keep compatibility with an old Vercel env value while using the current working model.
  if (!configured || configured === "gemini-2.5-flash-lite") {
    return "gemini-3.5-flash-lite";
  }

  return configured;
}

async function analyzeWithGemini(
  snapshot: TelemetrySnapshot,
  baseRecs: OptimizationRecommendation[],
): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[AI] GEMINI_API_KEY not configured — skipping Gemini call");
    return { ok: false, reason: "not_configured" };
  }

  const model = resolveGeminiModel();
  console.log(`[AI] Calling Gemini (${model})...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "You are a web performance engineer. Analyze telemetry and return ONLY valid JSON with keys: summary (string), recommendations (array of {title, description, severity, category, suggestedActions}). severity must be critical, high, medium, or low. category must be performance, media, accessibility, security, or telemetry. Never suggest removing security controls, exposing credentials, or modifying production without review.",
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: JSON.stringify({
                      webVitals: snapshot.webVitals,
                      totals: snapshot.totals,
                      byRoute: snapshot.byRoute.slice(0, 10),
                      byTier: snapshot.byTier,
                      existingRecommendations: baseRecs.map((r) => r.title),
                    }),
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 1200,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      const error = `Gemini request failed: ${response.status} ${response.statusText} — ${bodyText.slice(0, 500)}`;
      console.error("[AI] Gemini call failed:", error);
      return { ok: false, reason: "request_failed", error };
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const content = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!content) {
      const error = "Gemini response had no text content.";
      console.error("[AI]", error);
      return { ok: false, reason: "request_failed", error };
    }

    let parsed: {
      summary?: string;
      recommendations?: Array<{
        title?: string;
        description?: string;
        severity?: string;
        category?: string;
        suggestedActions?: string[];
      }>;
    };

    try {
      parsed = JSON.parse(content);
    } catch {
      const error = "Gemini returned content that was not valid JSON.";
      console.error("[AI]", error);
      return { ok: false, reason: "request_failed", error };
    }

    const aiRecs: OptimizationRecommendation[] = (parsed.recommendations ?? [])
      .filter((r) => r.title && r.description)
      .map((r) => ({
        id: randomUUID(),
        title: r.title!,
        description: r.description!,
        severity: (["critical", "high", "medium", "low"].includes(r.severity ?? "")
          ? r.severity
          : "medium") as OptimizationRecommendation["severity"],
        category: (["performance", "media", "accessibility", "security", "telemetry"].includes(r.category ?? "")
          ? r.category
          : "performance") as OptimizationRecommendation["category"],
        affectedRoutes: snapshot.byRoute.slice(0, 3).map((route) => route.route),
        evidence: ["Derived from Gemini analysis of live telemetry"],
        suggestedActions: r.suggestedActions ?? ["Review in admin dashboard before applying"],
        requiresReview: true,
        aiGenerated: true,
      }));

    console.log(`[AI] Gemini recommendations generated: ${aiRecs.length}`);

    return {
      ok: true,
      recommendations: [...baseRecs, ...aiRecs],
      summary: parsed.summary ?? "AI-assisted analysis complete.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling Gemini.";
    console.error("[AI] Gemini call threw:", message);
    return { ok: false, reason: "request_failed", error: message };
  }
}

export async function analyzePerformance(snapshot: TelemetrySnapshot): Promise<OptimizationAnalysis> {
  console.log("[AI] Analysis started");

  const telemetryDiag = diagnoseTelemetry(snapshot);
  const hasData = snapshot.totals.records > 0;
  console.log(`[AI] Telemetry records: ${snapshot.totals.records}`);
  console.log(`[AI] Telemetry source: ${snapshot.retention.mode} (durable store configured: ${snapshot.retention.durableStoreConfigured})`);
  console.log(`[AI] Telemetry diagnostic: ${telemetryDiag.state} — ${telemetryDiag.message}`);

  if (!hasData) {
    const geminiDiag: OptimizationDiagnostics["gemini"] = {
      state: "skipped_no_telemetry",
      message: "Gemini was not called — there is no telemetry data yet to analyze.",
    };
    return {
      generatedAt: new Date().toISOString(),
      recommendations: [],
      summary: "No telemetry data available for analysis.",
      aiAvailable: Boolean(process.env.GEMINI_API_KEY),
      analysisMethod: "rule-based",
      dataSource: "none",
      diagnostics: { telemetry: telemetryDiag, gemini: geminiDiag },
    };
  }

  const baseRecs = [...analyzeWebVitals(snapshot), ...analyzeErrors(snapshot)];
  const aiResult = await analyzeWithGemini(snapshot, baseRecs);

  const geminiDiagState: GeminiDiagnosticState = aiResult.ok
    ? "succeeded"
    : aiResult.reason === "not_configured"
      ? "key_missing"
      : "request_failed";

  const geminiDiag: OptimizationDiagnostics["gemini"] = {
    state: geminiDiagState,
    message: aiResult.ok
      ? `Gemini returned ${aiResult.recommendations.filter((r) => r.aiGenerated).length} recommendation(s).`
      : aiResult.reason === "not_configured"
        ? "GEMINI_API_KEY is not set on the server."
        : aiResult.error,
  };

  if (aiResult.ok) {
    return {
      generatedAt: new Date().toISOString(),
      recommendations: aiResult.recommendations,
      summary: aiResult.summary,
      aiAvailable: true,
      analysisMethod: "ai",
      dataSource: "telemetry",
      diagnostics: { telemetry: telemetryDiag, gemini: geminiDiag },
    };
  }

  const summary =
    baseRecs.length > 0
      ? `${baseRecs.length} recommendation(s) from rule-based telemetry analysis.`
      : "No performance issues detected from current telemetry thresholds.";

  return {
    generatedAt: new Date().toISOString(),
    recommendations: baseRecs,
    summary,
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    analysisMethod: "rule-based",
    aiError: aiResult.reason === "request_failed" ? aiResult.error : undefined,
    dataSource: "telemetry",
    diagnostics: { telemetry: telemetryDiag, gemini: geminiDiag },
  };
}
