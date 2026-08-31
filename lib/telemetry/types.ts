export type TelemetryKind =
  | "web-vital"
  | "client-error"
  | "unhandled-rejection"
  | "media-error"
  | "api-error"
  | "navigation-timing"
  | "admin-audit";

export type WebVitalMetric = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";

export type TelemetryCapability = {
  tier?: string;
  browser?: string;
  engine?: string;
  device?: string;
  pointer?: string;
  touch?: boolean;
  reducedMotion?: boolean;
  saveData?: boolean;
};

export type TelemetryPayload = {
  kind: TelemetryKind;
  route: string;
  metric?: string;
  value?: number;
  rating?: "good" | "needs-improvement" | "poor";
  message?: string;
  source?: string;
  capability?: TelemetryCapability;
};

export type TelemetryRecord = TelemetryPayload & {
  id: string;
  timestamp: string;
  ipHash?: string;
};

export type TelemetryHealthStatus = {
  telemetryApi: "ok";
  adminAuthConfigured: boolean;
  /** AWS_REGION/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are present. This
   *  alone does NOT mean telemetry can reach DynamoDB — the telemetry
   *  table name is checked separately below. */
  awsCredentialsConfigured: boolean;
  /** TELEMETRY_DYNAMODB_TABLE is set. AWS credentials being present does
   *  not imply this — the visitor tracker and media library each have
   *  their own table env vars that can be set independently. */
  telemetryTableConfigured: boolean;
  /** True only when both awsCredentialsConfigured AND
   *  telemetryTableConfigured are true — this is the flag that actually
   *  determines whether DynamoDB reads/writes are attempted. */
  durableStoreConfigured: boolean;
  hasRecentData: boolean;
  /** How many records the most recent DynamoDB scan returned (0 if the
   *  table isn't configured, or the scan legitimately found nothing). */
  dynamoRecordCount: number;
  /** How many records are sitting in the in-process memory buffer. On
   *  Vercel this buffer does not persist across separate invocations, so
   *  a non-zero count here does not mean data will still be there on the
   *  next request. */
  memoryRecordCount: number;
  /** Populated when the DynamoDB scan itself threw (bad table name,
   *  wrong region, missing IAM permission, throttling, etc.) instead of
   *  simply returning zero rows. Never swallowed silently. */
  dynamoReadError?: string;
};

export type TelemetrySnapshot = {
  generatedAt: string;
  health: TelemetryHealthStatus;
  retention: {
    mode: "dynamodb" | "memory";
    maxRecords: number;
    durableStoreConfigured: boolean;
    durableStoreRequired?: string;
  };
  totals: {
    records: number;
    webVitals: number;
    clientErrors: number;
    mediaErrors: number;
    apiErrors: number;
    adminAudit: number;
  };
  webVitals: {
    LCP?: { p75: number; count: number };
    INP?: { p75: number; count: number };
    CLS?: { p75: number; count: number };
    FCP?: { p75: number; count: number };
    TTFB?: { p75: number; count: number };
  };
  byRoute: Array<{ route: string; count: number; errors: number }>;
  byTier: Array<{ tier: string; count: number }>;
  byBrowser: Array<{ browser: string; count: number }>;
  byDevice: Array<{ device: string; count: number }>;
  byPointer: Array<{ pointer: string; count: number }>;
  byTouch: Array<{ touch: boolean; count: number }>;
  byReducedMotion: Array<{ reducedMotion: boolean; count: number }>;
  recent: TelemetryRecord[];
  recentErrors: TelemetryRecord[];
};

export type AdminAuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "view_dashboard"
  | "request_optimization";