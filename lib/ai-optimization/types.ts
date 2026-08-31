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

/** Why telemetry is (or isn't) feeding this analysis. */
export type TelemetryDiagnosticState =
  | "credentials_not_configured"
  | "table_not_configured"
  | "read_error"
  | "empty"
  | "ok";

/** Why Gemini was or wasn't used for this run. */
export type GeminiDiagnosticState =
  | "key_missing"
  | "skipped_no_telemetry"
  | "request_failed"
  | "succeeded";

export type OptimizationDiagnostics = {
  telemetry: { state: TelemetryDiagnosticState; message: string };
  gemini: { state: GeminiDiagnosticState; message: string };
};

export type OptimizationAnalysis = {
  generatedAt: string;
  recommendations: OptimizationRecommendation[];
  summary: string;
  /** GEMINI_API_KEY is configured on the server. Does NOT mean Gemini was
   * actually called successfully for this run — see analysisMethod. */
  aiAvailable: boolean;
  /** What actually produced this result. */
  analysisMethod: "ai" | "rule-based";
  /** Populated only when GEMINI_API_KEY was configured but the call failed. */
  aiError?: string;
  dataSource: "telemetry" | "none";
  diagnostics: OptimizationDiagnostics;
};

export type OptimizationPipelineStage =
  | "telemetry"
  | "analysis"
  | "gemini_review"
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
