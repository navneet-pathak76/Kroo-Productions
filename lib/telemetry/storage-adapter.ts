import "server-only";
import type { TelemetryRecord } from "./types";

export type TelemetryStorageMode = "memory" | "dynamodb";

export interface TelemetryStorageAdapter {
  readonly mode: TelemetryStorageMode;
  write(record: TelemetryRecord): Promise<void>;
  readRecent(limit: number): Promise<TelemetryRecord[]>;
  isConfigured(): boolean;
}
