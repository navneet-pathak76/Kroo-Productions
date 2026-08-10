export type TelemetryKind =
  | "web-vital"
  | "client-error"
  | "unhandled-rejection"
  | "media-error";

export type TelemetryPayload = {
  kind: TelemetryKind;
  route: string;
  metric?: string;
  value?: number;
  rating?: "good" | "needs-improvement" | "poor";
  message?: string;
  source?: string;
  capability?: {
    tier?: string;
    browser?: string;
    engine?: string;
    device?: string;
    pointer?: string;
    reducedMotion?: boolean;
    saveData?: boolean;
  };
};

export type TelemetryRecord = TelemetryPayload & {
  id: string;
  timestamp: string;
  ipHash?: string;
};

export type TelemetrySnapshot = {
  generatedAt: string;
  retention: {
    mode: "memory";
    maxRecords: number;
    durableStoreConfigured: false;
    durableStoreRequired: string;
  };
  totals: {
    records: number;
    webVitals: number;
    clientErrors: number;
    mediaErrors: number;
  };
  byRoute: Array<{ route: string; count: number }>;
  byTier: Array<{ tier: string; count: number }>;
  byBrowser: Array<{ browser: string; count: number }>;
  recent: TelemetryRecord[];
};
