import { NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/aws/s3-client";
import { PROJECT_OPTIONS } from "@/lib/media-optimization/media-manifest-types";
import { checkRateLimit } from "@/lib/telemetry/rate-limit";

const ALLOWED_TOP_LEVEL = new Set(["media", "videos", "thumbnails"]);
const ALLOWED_FOLDERS = new Set(PROJECT_OPTIONS.map((project) => project.folder));

function isKeySafe(key: string): boolean {
  if (!key || key.length > 512) return false;
  if (key.includes("..")) return false;
  if (key.startsWith("/") || key.includes("\\")) return false;

  const segments = key.split("/").filter(Boolean);
  if (segments.length < 2) return false;

  const [top, folder] = segments;
  if (!ALLOWED_TOP_LEVEL.has(top)) return false;
  if (!ALLOWED_FOLDERS.has(folder)) return false;

  return true;
}

export async function POST(request: Request) {
  const rateKey = request.headers.get("x-forwarded-for") ?? "anonymous";
  const rate = checkRateLimit(`media-signed-url:${rateKey}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: rate.retryAfterMs ? { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } : undefined },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const key = typeof (body as { key?: unknown })?.key === "string" ? (body as { key: string }).key : "";

  if (!isKeySafe(key)) {
    return NextResponse.json({ error: "Unrecognized media key." }, { status: 400 });
  }

  try {
    const url = await getPresignedDownloadUrl(key, 300);
    if (!url) {
      return NextResponse.json({ error: "Signed URLs are not configured for this environment." }, { status: 503 });
    }
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[media/signed-url] failed to sign", error);
    return NextResponse.json({ error: "Failed to generate signed URL." }, { status: 500 });
  }
}