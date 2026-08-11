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
  durableStoreConfigured: boolean;
  hasRecentData: boolean;
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
