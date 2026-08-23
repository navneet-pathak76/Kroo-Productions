import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionFromRequest } from "@/lib/auth/session";
import { PROJECT_OPTIONS } from "@/lib/media-optimization/media-manifest-types";
import {
  applySavedOrder,
  buildMediaEntries,
  locatePopulatedPrefix,
  readOrderManifest,
  resolveMediaPrefixes,
  writeOrderManifest,
} from "@/lib/aws/get-folder-media";

// GET /api/admin/gallery-order?project=<slug>
//
// Lists the real, live S3 media for a portfolio page — the exact same
// S3 location and filtering the public page itself reads from — already
// arranged in its current effective display order (saved order.json
// entries first, then anything unlisted in its existing relative order).
export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectSlug = searchParams.get("project") ?? "";
  const project = PROJECT_OPTIONS.find((option) => option.slug === projectSlug);
  if (!project) return NextResponse.json({ error: "Unknown portfolio page." }, { status: 400 });

  try {
    const { prefixes, projectFolder } = resolveMediaPrefixes(project.folder);
    const located = await locatePopulatedPrefix(prefixes);

    if (!located || located.objects.length === 0) {
      return NextResponse.json({ items: [], prefix: prefixes[0] ?? null });
    }

    const entries = buildMediaEntries(located.objects, located.prefix, projectFolder);
    const orderList = await readOrderManifest(located.prefix);
    const ordered = applySavedOrder(entries, orderList);

    return NextResponse.json({
      items: ordered.map((entry) => ({
        filename: entry.filename,
        title: entry.title,
        mediaType: entry.mediaType,
        url: entry.url,
      })),
      prefix: located.prefix,
    });
  } catch (error) {
    console.error("[admin/gallery-order] list failed", error);
    return NextResponse.json({ error: "Failed to load media from S3." }, { status: 500 });
  }
}

// POST /api/admin/gallery-order
// Body: { project: string; order: string[] }  (order = filenames, in
// the admin's chosen display order)
//
// Persists the order to `<prefix>order.json` in S3. Never touches,
// renames, moves, or deletes the underlying media objects. Filenames
// that no longer exist under the resolved prefix (e.g. deleted directly
// from S3 mid-edit) are dropped before saving.
export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const projectSlug = typeof body?.project === "string" ? body.project : "";
    const order = Array.isArray(body?.order)
      ? (body.order as unknown[]).filter((item): item is string => typeof item === "string")
      : null;

    const project = PROJECT_OPTIONS.find((option) => option.slug === projectSlug);
    if (!project) return NextResponse.json({ error: "Unknown portfolio page." }, { status: 400 });
    if (!order) return NextResponse.json({ error: "Missing order list." }, { status: 400 });

    const { prefixes, projectFolder } = resolveMediaPrefixes(project.folder);
    const located = await locatePopulatedPrefix(prefixes);
    const prefix = located?.prefix ?? prefixes[0];
    if (!prefix) return NextResponse.json({ error: "Could not resolve a folder for this project." }, { status: 400 });

    const validFilenames = located
      ? new Set(buildMediaEntries(located.objects, located.prefix, projectFolder).map((entry) => entry.filename))
      : new Set<string>();
    const safeOrder = order.filter((filename) => validFilenames.has(filename));

    await writeOrderManifest(prefix, safeOrder);

    if (project.route) revalidatePath(project.route);
    revalidatePath("/admin");

    return NextResponse.json({ success: true, order: safeOrder });
  } catch (error) {
    console.error("[admin/gallery-order] save failed", error);
    return NextResponse.json({ error: "Failed to save media order." }, { status: 500 });
  }
}