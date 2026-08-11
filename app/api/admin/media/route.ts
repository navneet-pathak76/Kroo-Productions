import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionFromRequest } from "@/lib/auth/session";
import {
  deleteMediaItem,
  getProjectOptionBySlug,
  listMediaItems,
  MediaStorageUnavailableError,
  reorderMediaItems,
  updateMediaItem,
} from "@/lib/media-optimization/content-manifest";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectSlug = searchParams.get("project") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? "newest";

  try {
    const items = await listMediaItems({
      projectSlug,
      status: status as "draft" | "published" | "archived" | undefined,
      type: type as "image" | "video" | "asset" | undefined,
      search,
      sort: sort as "newest" | "oldest" | "name" | "order" | undefined,
    });

    return NextResponse.json({ items });
  } catch (error) {
    // A configured-but-unreachable Dynamo table must NOT look like an
    // empty media library — that's the exact "upload succeeded, list
    // came back []" bug this fixes. Surface it as a real failure.
    console.error("[admin/media] list failed", error);
    const message =
      error instanceof MediaStorageUnavailableError
        ? "Media storage is configured but currently unavailable. Please try again."
        : "Failed to load media items.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const action = typeof body?.action === "string" ? body.action : "update";

    if (action === "reorder") {
      const orderedIds = Array.isArray(body?.orderedIds)
        ? (body.orderedIds as unknown[]).filter((id): id is string => typeof id === "string")
        : [];
      const projectSlug = typeof body?.projectSlug === "string" ? body.projectSlug : "";
      const items = await reorderMediaItems(projectSlug, orderedIds);
      const project = getProjectOptionBySlug(projectSlug);
      if (project?.route) revalidatePath(project.route);
      revalidatePath("/admin");
      return NextResponse.json({ items });
    }

    if (action === "delete") {
      const id = typeof body?.id === "string" ? body.id : "";
      const existing = (await listMediaItems({ sort: "order" })).find((item) => item.id === id);
      const deleted = await deleteMediaItem(id);
      if (!deleted) return NextResponse.json({ error: "Media item not found." }, { status: 404 });
      if (existing?.route) revalidatePath(existing.route);
      revalidatePath("/admin");
      return NextResponse.json({ success: true });
    }

    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Missing media id." }, { status: 400 });

    const updated = await updateMediaItem(id, {
      title: typeof body?.title === "string" ? body.title : undefined,
      description: typeof body?.description === "string" ? body.description : undefined,
      altText: typeof body?.altText === "string" ? body.altText : undefined,
      tags: Array.isArray(body?.tags) ? body.tags : undefined,
      status: body?.status && ["draft", "published", "archived"].includes(body.status) ? body.status : undefined,
      displayOrder: typeof body?.displayOrder === "number" ? body.displayOrder : undefined,
    });

    if (!updated) return NextResponse.json({ error: "Media item not found." }, { status: 404 });

    if (updated.route) revalidatePath(updated.route);
    revalidatePath("/admin");
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[admin/media] update failed", error);
    const message =
      error instanceof MediaStorageUnavailableError
        ? "Media storage is configured but currently unavailable. Please try again."
        : "Failed to update media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}