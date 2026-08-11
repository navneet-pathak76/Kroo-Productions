"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload, RefreshCw, Eye, Trash2, CheckCircle2, AlertCircle, Search, Filter, ImageIcon, VideoIcon, FileArchive } from "lucide-react";
import type { MediaItemRecord, MediaKind, MediaStatus } from "@/lib/media-optimization/media-manifest-types";
import { getProjectOptions } from "@/lib/media-optimization/media-manifest-types";
import { multipartUpload } from "@/lib/upload/multipart-uploader";

const projectOptions = getProjectOptions();

type MediaManagerItem = MediaItemRecord;

type UploadState = {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "success" | "error";
  message?: string;
  file?: File;
  projectSlug?: string;
};

const VIDEO_EXTENSIONS = new Set(["mp4", "m4v", "mov", "webm", "mkv"]);

function inferMediaKind(file: File): MediaKind {
  if (file.type.startsWith("video")) return "video";
  if (file.type.startsWith("image")) return "image";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.has(extension) ? "video" : "image";
}

export function MediaManager() {
  const [items, setItems] = useState<MediaManagerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [project, setProject] = useState("all");
  const [status, setStatus] = useState<MediaStatus | "all">("all");
  const [type, setType] = useState<MediaKind | "all">("all");
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaManagerItem | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (project !== "all") params.set("project", project);
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("type", type);
      if (search) params.set("search", search);
      const response = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await response.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [project, status, type, search]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function startUpload(file: File, projectSlugOverride: string, existingId?: string) {
    const uploadId = existingId ?? `${Date.now()}-${file.name}`;
    setUploads((current) => {
      const existing = current.find((entry) => entry.id === uploadId);
      if (existing) {
        return current.map((entry) => entry.id === uploadId ? { ...entry, progress: 5, status: "uploading", message: "Retrying upload…" } : entry);
      }
      return [{ id: uploadId, fileName: file.name, progress: 5, status: "uploading", file, projectSlug: projectSlugOverride }, ...current];
    });

    try {
      const request = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          projectSlug: projectSlugOverride,
          title: file.name,
          mediaKind: inferMediaKind(file),
        }),
      });
      const data = await request.json();

      if (!request.ok) throw new Error(data.error ?? "Upload preparation failed");

      const finalize = async () => {
        setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, progress: 100, status: "processing", message: "Processing upload…" } : entry));
        const completeResponse = await fetch("/api/admin/media/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectKey: data.objectKey, metadata: { ...data.metadata, fileName: file.name } }),
        });
        const completeData = await completeResponse.json();
        if (!completeResponse.ok) throw new Error(completeData.error ?? "Metadata save failed");
        setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, progress: 100, status: "success", message: "Uploaded and saved" } : entry));
        await loadItems();
      };

      if (data.uploadMode === "multipart") {
        // Large file — S3 multipart upload, chunked with per-part retry
        // (see lib/upload/multipart-uploader.ts). This is what replaced
        // the old single 15-minute presigned PUT that large showreels
        // routinely failed on.
        try {
          await multipartUpload({
            file,
            objectKey: data.objectKey,
            contentType: data.metadata.mimeType,
            onProgress: ({ loaded, total }) => {
              const progress = total > 0 ? Math.min(95, Math.round((loaded / total) * 100)) : 5;
              setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, progress } : entry));
            },
          });
          await finalize();
        } catch (error) {
          setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, status: "error", message: error instanceof Error ? error.message : "Upload failed" } : entry));
        }
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", data.uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.min(95, Math.round((progressEvent.loaded / progressEvent.total) * 100));
          setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, progress } : entry));
        }
      };
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            await finalize();
          } catch (error) {
            setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, status: "error", message: error instanceof Error ? error.message : "Metadata save failed" } : entry));
          }
        } else {
          const errorMessage = getUploadErrorMessage(xhr);
          setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, status: "error", message: errorMessage } : entry));
        }
      };
      xhr.onerror = () => {
        setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, status: "error", message: getUploadErrorMessage(xhr) } : entry));
      };
      xhr.send(file);
    } catch (error) {
      setUploads((current) => current.map((entry) => entry.id === uploadId ? { ...entry, status: "error", message: error instanceof Error ? error.message : "Upload failed" } : entry));
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const projectSlugOverride = project === "all" ? "gym" : project;
    await startUpload(file, projectSlugOverride);
    event.target.value = "";
  }

  async function retryUpload(upload: UploadState) {
    if (!upload.file) return;
    await startUpload(upload.file, upload.projectSlug ?? "gym", upload.id);
  }

  function removeUpload(uploadId: string) {
    setUploads((current) => current.filter((entry) => entry.id !== uploadId));
  }

  function getUploadErrorMessage(xhr: XMLHttpRequest): string {
    const rawText = xhr.responseText?.trim();
    if (rawText) {
      if (rawText.includes("AccessDenied")) return "Upload failed: S3 AccessDenied";
      if (rawText.includes("CORS")) return "Upload failed: S3 CORS policy denied the browser upload";
      if (rawText.includes("<Error") || rawText.includes("<Code")) return "Upload failed: S3 rejected the direct upload";
      try {
        const parsed = JSON.parse(rawText);
        if (typeof parsed?.error === "string" && parsed.error) return parsed.error;
      } catch {
        // fall back to the raw text below
      }
      return rawText.slice(0, 180);
    }

    if (xhr.status === 0) return "Upload failed: network or CORS issue while contacting S3";
    if (xhr.status >= 400) return `Upload failed (${xhr.status})`;
    return "Upload failed";
  }

  async function updateStatus(item: MediaManagerItem, statusValue: MediaStatus) {
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: statusValue }),
    });
    if (response.ok) {
      await loadItems();
    }
  }

  async function deleteItem(item: MediaManagerItem) {
    if (!window.confirm("Delete this media item?")) return;
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: item.id }),
    });
    if (response.ok) {
      await loadItems();
    }
  }

  const filteredItems = useMemo(() => items, [items]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Media Library</h2>
          <p className="mt-1 text-sm text-white/55">Upload, preview, publish, and reorder media for the portfolio without editing code.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm hover:bg-primary/20">
          <Upload size={16} />
          Upload media
          <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime,.m4v,.mov,.mkv" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search size={16} className="text-white/45" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media" className="w-full bg-transparent text-sm outline-none" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={project} onChange={(event) => setProject(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <option value="all">All projects</option>
                {projectOptions.map((option) => <option key={option.slug} value={option.slug}>{option.title}</option>)}
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value as MediaStatus | "all")} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select value={type} onChange={(event) => setType(event.target.value as MediaKind | "all")} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <option value="all">All types</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="asset">Asset</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Uploads</h3>
            <button type="button" onClick={() => void loadItems()} className="rounded-lg border border-white/10 px-2 py-1 text-sm">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {uploads.length === 0 ? <p className="text-sm text-white/45">No active uploads.</p> : uploads.map((upload) => (
              <div key={upload.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{upload.fileName}</span>
                  {upload.status === "success" ? <CheckCircle2 size={16} className="text-emerald-400" /> : upload.status === "error" ? <AlertCircle size={16} className="text-red-400" /> : <RefreshCw size={16} className="animate-spin" />}
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${upload.progress}%` }} />
                </div>
                {upload.message ? <p className="mt-2 text-xs text-white/45">{upload.message}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {upload.status === "error" ? <button type="button" onClick={() => void retryUpload(upload)} className="rounded-lg border border-primary/30 px-2 py-1 text-xs">Retry</button> : null}
                  <button type="button" onClick={() => removeUpload(upload.id)} className="rounded-lg border border-white/10 px-2 py-1 text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {loading ? <p className="text-sm text-white/45">Loading media…</p> : filteredItems.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/45">No media available yet.</p> : filteredItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    {item.mediaKind === "video" ? <VideoIcon size={16} /> : item.mediaKind === "asset" ? <FileArchive size={16} /> : <ImageIcon size={16} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase">{item.status}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">{item.projectTitle}</span>
                    </div>
                    <p className="mt-1 text-sm text-white/55">{item.fileName}</p>
                    <p className="mt-2 text-xs text-white/40">{item.cdnUrl}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg border border-white/10 px-3 py-2 text-sm" onClick={() => setSelectedItem(item)}><Eye size={14} /></button>
                  <button type="button" className="rounded-lg border border-white/10 px-3 py-2 text-sm" onClick={() => void deleteItem(item)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => void updateStatus(item, "published")} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">Publish</button>
                <button type="button" onClick={() => void updateStatus(item, "draft")} className="rounded-lg border border-white/10 px-3 py-2 text-sm">Draft</button>
                <button type="button" onClick={() => void updateStatus(item, "archived")} className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm">Archive</button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/45" />
            <h3 className="text-sm font-semibold">Preview & metadata</h3>
          </div>
          {selectedItem ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Title</p>
                <p className="mt-1 font-medium">{selectedItem.title}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Description</p>
                <p className="mt-1 text-white/70">{selectedItem.description ?? "No description"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Media</p>
                <a href={selectedItem.cdnUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-primary">Open asset</a>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Order / status</p>
                <p className="mt-1">Order {selectedItem.displayOrder} · {selectedItem.status}</p>
              </div>
            </div>
          ) : <p className="mt-4 text-sm text-white/45">Select an item to preview.</p>}
        </div>
      </div>
    </section>
  );
}
