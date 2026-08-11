import "server-only";
import type { TelemetryRecord } from "@/lib/telemetry/types";
import type { TelemetryStorageAdapter } from "@/lib/telemetry/storage-adapter";

const MAX_RECORDS = 5_000;
const records: TelemetryRecord[] = [];

export class MemoryTelemetryAdapter implements TelemetryStorageAdapter {
  readonly mode = "memory" as const;

  isConfigured(): boolean {
    return true;
  }

  async write(record: TelemetryRecord): Promise<void> {
    records.unshift(record);
    if (records.length > MAX_RECORDS) {
      records.length = MAX_RECORDS;
    }
  }

  async readRecent(limit: number): Promise<TelemetryRecord[]> {
    return records.slice(0, limit);
  }
}

export function getMemoryTelemetryRecords(): TelemetryRecord[] {
  return records;
}

export const MEMORY_TELEMETRY_MAX = MAX_RECORDS;
