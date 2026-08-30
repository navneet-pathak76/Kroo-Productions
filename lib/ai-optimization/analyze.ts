import "server-only";
import { randomUUID } from "crypto";
import type { TelemetrySnapshot } from "@/lib/telemetry/types";
import type { OptimizationAnalysis, OptimizationRecommendation } from "./types";

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

/**
 * Result type replaces the old `T | null` return. Returning `null` on
 * every failure mode (missing key, non-2xx, network error, bad JSON) was
 * indistinguishable from "AI legitimately found nothing to report" —
 * that ambiguity is the root cause of "AI available: Yes" sitting next
 * to a result that was actually rule-based-only with zero visibility
 * into why. Every branch now carries a reason.
 */
type OpenAIAnalysisResult =
  | { ok: true; recommendations: OptimizationRecommendation[]; summary: string }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "request_failed"; error: string };

async function analyzeWithOpenAI(
  snapshot: TelemetrySnapshot,
  baseRecs: OptimizationRecommendation[],
): Promise<OpenAIAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[AI] OPENAI_API_KEY not configured — skipping OpenAI call");
    return { ok: false, reason: "not_configured" };
  }

  console.log("[AI] Calling OpenAI...");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 1200,
          messages: [
            {
              role: "system",
              content:
                "You are a web performance engineer. Analyze telemetry and return JSON with keys: summary (string), recommendations (array of {title, description, severity, category, suggestedActions}). Never suggest removing security controls, exposing credentials, or modifying production without review.",
            },
            {
              role: "user",
              content: JSON.stringify({
                webVitals: snapshot.webVitals,
                totals: snapshot.totals,
                byRoute: snapshot.byRoute.slice(0, 10),
                byTier: snapshot.byTier,
                existingRecommendations: baseRecs.map((r) => r.title),
              }),
            },
          ],
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // Capture the actual failure — invalid key, rate limit, wrong
      // model name, etc. — instead of discarding it. The body is
      // truncated only so a huge HTML error page can't blow up logs;
      // never truncated to hide anything security-sensitive (the key
      // itself is never in this response body).
      const bodyText = await response.text().catch(() => "");
      const error = `OpenAI request failed: ${response.status} ${response.statusText} — ${bodyText.slice(0, 500)}`;
      console.error("[AI] OpenAI call failed:", error);
      return { ok: false, reason: "request_failed", error };
    }

    console.log("[AI] OpenAI response received");

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      const error = "OpenAI response had no message content.";
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
      const error = "OpenAI returned content that was not valid JSON.";
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
        evidence: ["Derived from OpenAI analysis of live telemetry"],
        suggestedActions: r.suggestedActions ?? ["Review in admin dashboard before applying"],
        requiresReview: true,
        aiGenerated: true,
      }));

    console.log(`[AI] Recommendations generated: ${aiRecs.length}`);

    return {
      ok: true,
      recommendations: [...baseRecs, ...aiRecs],
      summary: parsed.summary ?? "AI-assisted analysis complete.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling OpenAI.";
    console.error("[AI] OpenAI call threw:", message);
    return { ok: false, reason: "request_failed", error: message };
  }
}

export async function analyzePerformance(snapshot: TelemetrySnapshot): Promise<OptimizationAnalysis> {
  console.log("[AI] Analysis started");

  const hasData = snapshot.totals.records > 0;
  console.log(`[AI] Telemetry records: ${snapshot.totals.records}`);
  console.log(`[AI] Telemetry source: ${snapshot.retention.mode} (durable store configured: ${snapshot.retention.durableStoreConfigured})`);

  if (!hasData) {
    return {
      generatedAt: new Date().toISOString(),
      recommendations: [],
      summary: "No telemetry data available for analysis.",
      aiAvailable: Boolean(process.env.OPENAI_API_KEY),
      analysisMethod: "rule-based",
      dataSource: "none",
    };
  }

  const baseRecs = [...analyzeWebVitals(snapshot), ...analyzeErrors(snapshot)];
  const aiResult = await analyzeWithOpenAI(snapshot, baseRecs);

  if (aiResult.ok) {
    return {
      generatedAt: new Date().toISOString(),
      recommendations: aiResult.recommendations,
      summary: aiResult.summary,
      aiAvailable: true,
      analysisMethod: "ai",
      dataSource: "telemetry",
    };
  }

  // aiResult.ok === false here — either OpenAI wasn't configured, or it
  // was configured and the call failed. Either way this is a rule-based
  // result, and if it failed (not just "not configured"), that failure
  // is carried through as aiError instead of being discarded — this is
  // the piece that was previously invisible.
  const summary =
    baseRecs.length > 0
      ? `${baseRecs.length} recommendation(s) from rule-based telemetry analysis.`
      : "No performance issues detected from current telemetry thresholds.";

  return {
    generatedAt: new Date().toISOString(),
    recommendations: baseRecs,
    summary,
    aiAvailable: Boolean(process.env.OPENAI_API_KEY),
    analysisMethod: "rule-based",
    aiError: aiResult.reason === "request_failed" ? aiResult.error : undefined,
    dataSource: "telemetry",
  };
}