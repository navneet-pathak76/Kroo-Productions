"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, GripVertical, ImageIcon, RefreshCw, VideoIcon } from "lucide-react";
import { getProjectOptions } from "@/lib/media-optimization/media-manifest-types";

const projectOptions = getProjectOptions();

type GalleryItem = {
  filename: string;
  title: string;
  mediaType: "image" | "video";
  url: string;
};

export function GalleryReorder() {
  const [projectSlug, setProjectSlug] = useState(projectOptions[0]?.slug ?? "");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [savedOrder, setSavedOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const loadItems = useCallback(async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`/api/admin/gallery-order?project=${encodeURIComponent(slug)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to load media.");
      const loaded: GalleryItem[] = data.items ?? [];
      setItems(loaded);
      setSavedOrder(loaded.map((item) => item.filename));
    } catch (err) {
      setItems([]);
      setSavedOrder([]);
      setError(err instanceof Error ? err.message : "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems(projectSlug);
  }, [projectSlug, loadItems]);

  const isDirty =
    items.length !== savedOrder.length ||
    items.some((item, index) => item.filename !== savedOrder[index]);

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setSuccess(false);
  }

  function handleDrop(index: number) {
    if (dragIndex === null) return;
    moveItem(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/admin/gallery-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectSlug, order: items.map((item) => item.filename) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to save order.");
      setSavedOrder((data.order as string[] | undefined) ?? items.map((item) => item.filename));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">Reorder gallery</h3>
          <p className="mt-1 text-xs text-white/50">
            Drag videos into the order you want them shown in. S3 files are never renamed or moved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={projectSlug}
            onChange={(event) => setProjectSlug(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
          >
            {projectOptions.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void loadItems(projectSlug)}
            disabled={loading}
            className="rounded-lg border border-white/10 px-2 py-2 text-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : undefined} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-sm text-red-300">
          <AlertCircle size={14} />
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-white/45">Loading media…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">
          No media found in S3 for this page yet.
        </p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.filename}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`flex items-center gap-3 rounded-xl border bg-black/20 p-2 pr-3 transition-colors ${
                overIndex === index ? "border-primary/60 bg-primary/[0.06]" : "border-white/10"
              }`}
            >
              <span className="cursor-grab text-white/35 active:cursor-grabbing" title="Drag to reorder">
                <GripVertical size={16} />
              </span>
              <span className="w-7 shrink-0 text-center text-xs tabular-nums text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/30">
                {item.mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video src={item.url} muted preload="metadata" playsInline className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.title}</p>
                <p className="truncate text-xs text-white/40">{item.filename}</p>
              </div>
              <span className="text-white/30">
                {item.mediaType === "image" ? <ImageIcon size={14} /> : <VideoIcon size={14} />}
              </span>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  className="rounded border border-white/10 px-1.5 py-0.5 text-xs disabled:opacity-30"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="rounded border border-white/10 px-1.5 py-0.5 text-xs disabled:opacity-30"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!isDirty || saving || items.length === 0}
          className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save Order"}
        </button>
        {success ? (
          <span className="flex items-center gap-1 text-sm text-emerald-400">
            <CheckCircle2 size={14} /> Order saved
          </span>
        ) : null}
      </div>
    </section>
  );
}