export type OptimizationSeverity = "critical" | "high" | "medium" | "low";

export type OptimizationRecommendation = {
  id: string;
  title: string;
  description: string;
  severity: OptimizationSeverity;
  category: "performance" | "media" | "accessibility" | "security" | "telemetry";
  affectedRoutes: string[];
  evidence: string[];
  suggestedActions: string[];
  requiresReview: true;
  aiGenerated: boolean;
};

/** Why telemetry is (or isn't) feeding this analysis. Computed from
 *  TelemetrySnapshot.health so the admin never has to guess between
 *  "table missing", "table empty", and "read failed". */
export type TelemetryDiagnosticState =
  | "credentials_not_configured" // D (partial) — no AWS creds at all
  | "table_not_configured" // D — TELEMETRY_DYNAMODB_TABLE unset
  | "read_error" // errors surfaced, not swallowed
  | "empty" // E — table reachable, 0 records
  | "ok"; // records loaded

/** Why OpenAI was or wasn't used for this run. */
export type OpenAiDiagnosticState =
  | "key_missing" // C
  | "skipped_no_telemetry" // no data to send, OpenAI never called
  | "request_failed" // B
  | "succeeded"; // A / G

export type OptimizationDiagnostics = {
  telemetry: { state: TelemetryDiagnosticState; message: string };
  openai: { state: OpenAiDiagnosticState; message: string };
};

export type OptimizationAnalysis = {
  generatedAt: string;
  recommendations: OptimizationRecommendation[];
  summary: string;
  /** OPENAI_API_KEY is configured on the server. Does NOT mean OpenAI was
   *  actually called successfully for this run — see analysisMethod. */
  aiAvailable: boolean;
  /** What actually produced this result. This is the field the UI must
   *  use to tell the admin whether they're looking at a real OpenAI
   *  analysis or the rule-based threshold fallback — aiAvailable alone
   *  was being misread as "AI was used," which was often false. */
  analysisMethod: "ai" | "rule-based";
  /** Populated only when OPENAI_API_KEY was configured but the call
   *  failed, so the failure is visible instead of silently swallowed. */
  aiError?: string;
  dataSource: "telemetry" | "none";
  /** Precise, non-secret machine-readable reason for the telemetry and
   *  OpenAI outcomes on this run — powers the diagnostic panel in the UI. */
  diagnostics: OptimizationDiagnostics;
};

export type OptimizationPipelineStage =
  | "telemetry"
  | "analysis"
  | "openai_review"
  | "admin_review"
  | "patch"
  | "typecheck"
  | "lint"
  | "build"
  | "performance_comparison"
  | "commit";

export type OptimizationPipelineState = {
  stage: OptimizationPipelineStage;
  status: "pending" | "in_progress" | "completed" | "blocked" | "failed";
  message?: string;
};