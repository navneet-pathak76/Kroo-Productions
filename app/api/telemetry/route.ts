import { NextResponse } from "next/server";
import { hashIpAddress, extractClientIp } from "@/lib/telemetry/ip";
import { checkRateLimit } from "@/lib/telemetry/rate-limit";
import { recordTelemetry } from "@/lib/telemetry/store";
import { validatePayloadSize, validateTelemetryBatch } from "@/lib/telemetry/validate";
import type { TelemetryPayload } from "@/lib/telemetry/types";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 16_384) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    const ip = extractClientIp(request);
    const rateKey = hashIpAddress(ip) ?? "anonymous";
    const rate = checkRateLimit(rateKey);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded." },
        {
          status: 429,
          headers: rate.retryAfterMs
            ? { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) }
            : undefined,
        },
      );
    }

    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText)) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    let raw: unknown;
    try {
      raw = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const validations = validateTelemetryBatch(raw);

    const payloads: TelemetryPayload[] = [];
    for (const result of validations) {
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      payloads.push(result.payload);
    }

    const ipHash = hashIpAddress(ip);
    const records = await Promise.all(
      payloads.map((payload) => recordTelemetry(payload, ipHash)),
    );

    return NextResponse.json({
      success: true,
      count: records.length,
    });
  } catch (error) {
    console.error("[telemetry] POST failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
