import { NextResponse } from "next/server";
import { hashIpAddress, extractClientIp } from "@/lib/telemetry/ip";
import { checkRateLimit } from "@/lib/telemetry/rate-limit";
import { trackVisitorPageView } from "@/lib/visitors/track";
import { validatePayloadSize, validateVisitorTrackPayload } from "@/lib/visitors/validate";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 4_096) {
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

    const validation = validateVisitorTrackPayload(raw);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Fire-and-forget from the caller's perspective — the client uses
    // fetch(..., { keepalive: true }) and never awaits the body, so we
    // still await here (needed to actually run in serverless/edge
    // runtimes) but keep the work itself minimal and non-blocking for
    // the *visitor's* page.
    await trackVisitorPageView(validation.payload, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[visitors] track POST failed:", error instanceof Error ? error.message : "unknown");
    // Never surface tracking failures to the visitor as a hard error.
    return NextResponse.json({ success: false });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
