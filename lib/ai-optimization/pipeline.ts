import "server-only";
import { analyzePerformance } from "@/lib/ai-optimization/analyze";
import type { OptimizationAnalysis, OptimizationPipelineState } from "@/lib/ai-optimization/types";
import type { TelemetrySnapshot } from "@/lib/telemetry/types";

function stage(
  stageName: OptimizationPipelineState["stage"],
  status: OptimizationPipelineState["status"],
  message?: string,
): OptimizationPipelineState {
  return { stage: stageName, status, message };
}

export type OptimizationPipelineResult = {
  stages: OptimizationPipelineState[];
  analysis: OptimizationAnalysis;
  snapshot: TelemetrySnapshot;
};

export async function runOptimizationPipeline(
  snapshot: TelemetrySnapshot,
): Promise<OptimizationPipelineResult> {
  const stages: OptimizationPipelineState[] = [];

  stages.push(stage("telemetry", "completed", `${snapshot.totals.records} telemetry record(s) loaded.`));

  const analysis = await analyzePerformance(snapshot);
  stages.push(
    stage(
      "analysis",
      "completed",
      analysis.dataSource === "none"
        ? "No telemetry data for analysis."
        : analysis.summary.slice(0, 240),
    ),
  );

  if (analysis.aiAvailable && analysis.recommendations.some((r) => r.aiGenerated)) {
    stages.push(stage("gemini_review", "completed", "Gemini recommendations merged with rule-based analysis."));
  } else if (analysis.aiAvailable) {
    stages.push(stage("gemini_review", "completed", "Gemini available; no additional AI recommendations returned."));
  } else {
    stages.push(
      stage(
        "gemini_review",
        "blocked",
        "GEMINI_API_KEY not configured — rule-based analysis only.",
      ),
    );
  }

  stages.push(
    stage(
      "admin_review",
      "pending",
      "Review recommendations in the dashboard before applying any code changes.",
    ),
  );

  stages.push(
    stage(
      "patch",
      "pending",
      "Apply approved changes locally or via your deployment workflow. Automatic patching is disabled.",
    ),
  );

  stages.push(
    stage(
      "typecheck",
      "pending",
      'Run verification from the dashboard after patches ("Run verification pipeline").',
    ),
  );
  stages.push(stage("lint", "pending", "Included in verification pipeline."));
  stages.push(stage("build", "pending", "Included in verification pipeline."));
  stages.push(
    stage(
      "performance_comparison",
      "pending",
      "Compare Web Vitals p75 before/after using live telemetry snapshots.",
    ),
  );
  stages.push(
    stage(
      "commit",
      "blocked",
      "Automatic git commit/deploy is disabled. Commit manually after verification passes.",
    ),
  );

  return { stages, analysis, snapshot };
}

export function compareWebVitals(
  before: TelemetrySnapshot["webVitals"],
  after: TelemetrySnapshot["webVitals"],
): Array<{ metric: string; before?: number; after?: number; delta?: number }> {
  const metrics = new Set([...Object.keys(before), ...Object.keys(after)]);
  const rows: Array<{ metric: string; before?: number; after?: number; delta?: number }> = [];

  for (const metric of metrics) {
    const b = before[metric as keyof typeof before]?.p75;
    const a = after[metric as keyof typeof after]?.p75;
    if (b === undefined && a === undefined) continue;
    rows.push({
      metric,
      before: b,
      after: a,
      delta: b !== undefined && a !== undefined ? Math.round((a - b) * 100) / 100 : undefined,
    });
  }

  return rows;
}
