export type VisitorDevice = "mobile" | "tablet" | "desktop" | "unknown";

export type VisitorGeo = {
  country?: string;
  region?: string;
  city?: string;
};

export type VisitorClient = {
  device: VisitorDevice;
  browser: string;
  os: string;
};

/** Raw event sent by the client tracker for a single page view. */
export type VisitorTrackPayload = {
  sessionId: string;
  visitorId: string;
  path: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
};

/** One page view, stored under its parent session. */
export type PageViewRecord = {
  sessionId: string;
  path: string;
  referrer?: string;
  timestamp: string;
};

/** Aggregate session record — one per anonymous visit. */
export type VisitorSessionRecord = {
  sessionId: string;
  visitorId: string;
  isNewVisitor: boolean;
  firstSeen: string;
  lastSeen: string;
  entryPage: string;
  exitPage: string;
  pageCount: number;
  durationMs: number;
  referrer?: string;
  geo: VisitorGeo;
  client: VisitorClient;
  /** Raw client IP for authorized admin analytics. */
  ip?: string;
  /** One-way IP hash retained for rate limiting/legacy analytics. */
  ipHash?: string;
};

/** Combined view used by the visitor journey admin page. */
export type VisitorJourney = {
  session: VisitorSessionRecord;
  pageViews: PageViewRecord[];
};

export type VisitorListItem = VisitorSessionRecord;

export type VisitorListResult = {
  items: VisitorListItem[];
  nextCursor?: string;
};
