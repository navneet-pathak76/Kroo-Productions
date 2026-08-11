"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaKeyFromUrl } from "@/lib/media-config";

const signedUrlCache = new Map<string, Promise<string | null>>();

export async function requestSignedFallbackUrl(cdnSrc: string): Promise<string | null> {
  const key = mediaKeyFromUrl(cdnSrc);
  if (!key) return null;

  const cached = signedUrlCache.get(key);
  if (cached) return cached;

  const request = fetch("/api/media/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as { url?: string };
      return data.url ?? null;
    })
    .catch(() => null);

  signedUrlCache.set(key, request);
  return request;
}

export function useResilientMediaSrc(originalSrc: string | undefined) {
  const [effectiveSrc, setEffectiveSrc] = useState(originalSrc);
  const attemptedRef = useRef(false);

  useEffect(() => {
    setEffectiveSrc(originalSrc);
    attemptedRef.current = false;
  }, [originalSrc]);

  const tryFallback = useCallback(async (): Promise<boolean> => {
    if (!originalSrc || attemptedRef.current) return false;
    attemptedRef.current = true;
    const signedUrl = await requestSignedFallbackUrl(originalSrc);
    if (!signedUrl) return false;
    setEffectiveSrc(signedUrl);
    return true;
  }, [originalSrc]);

  return { effectiveSrc, tryFallback } as const;
}