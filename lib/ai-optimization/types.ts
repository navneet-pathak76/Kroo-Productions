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

export type OptimizationAnalysis = {
  generatedAt: string;
  recommendations: OptimizationRecommendation[];
  summary: string;
  aiAvailable: boolean;
  dataSource: "telemetry" | "none";
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
