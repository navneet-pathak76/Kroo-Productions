"use client";

/**
 * Client-side driver for S3 multipart uploads.
 *
 * This is what replaced the old single-PUT-with-15-minute-presigned-URL
 * uploader. Large files (showreels, etc.) are split into fixed-size
 * parts; each part is signed and uploaded independently, and a failed
 * part is retried on its own instead of forcing a restart of the whole
 * upload. Progress is reported per-byte across all parts combined.
 */

const MAX_PART_RETRIES = 4;
const MAX_CONCURRENT_PARTS = 3;

export type MultipartProgress = {
  loaded: number;
  total: number;
};

export type MultipartPart = {
  partNumber: number;
  eTag: string;
};

async function withRetry<T>(fn: () => Promise<T>, maxAttempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        // Exponential backoff with jitter — avoids hammering S3/CloudFront
        // immediately after a transient network blip.
        const backoffMs = Math.min(8000, 500 * 2 ** (attempt - 1)) + Math.random() * 300;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError;
}

function uploadPartWithProgress(
  url: string,
  blob: Blob,
  onProgress: (loaded: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);

    const onAbort = () => {
      xhr.abort();
      reject(new Error("Upload cancelled"));
    };
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded);
    };
    xhr.onload = () => {
      signal?.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        // S3 returns the part's ETag in the response header. Some
        // browsers hide response headers on cross-origin PUTs unless the
        // bucket's CORS config exposes ETag via
        // Access-Control-Expose-Headers — if that's missing, this will
        // come back empty and the upload cannot be completed. That is a
        // bucket CORS configuration issue, not a client bug.
        const eTag = xhr.getResponseHeader("ETag") ?? xhr.getResponseHeader("etag");
        if (!eTag) {
          reject(
            new Error(
              "S3 did not return an ETag for this part (likely missing Access-Control-Expose-Headers: ETag in the bucket CORS configuration).",
            ),
          );
          return;
        }
        resolve(eTag);
      } else {
        reject(new Error(`Part upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Network error while uploading part"));
    };
    xhr.send(blob);
  });
}

export async function multipartUpload(input: {
  file: File;
  objectKey: string;
  contentType: string;
  onProgress?: (progress: MultipartProgress) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { file, objectKey, contentType, onProgress, signal } = input;

  const createResponse = await fetch("/api/admin/media/multipart/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey, contentType, fileName: file.name, fileSize: file.size }),
  });
  const createData = await createResponse.json();
  if (!createResponse.ok) throw new Error(createData.error ?? "Failed to initiate multipart upload");

  const { uploadId, partSize, partCount } = createData as {
    uploadId: string;
    partSize: number;
    partCount: number;
  };

  const partLoaded = new Array<number>(partCount).fill(0);
  const reportProgress = () => {
    if (!onProgress) return;
    const loaded = partLoaded.reduce((sum, value) => sum + value, 0);
    onProgress({ loaded, total: file.size });
  };

  async function uploadOnePart(partNumber: number): Promise<MultipartPart> {
    const start = (partNumber - 1) * partSize;
    const end = Math.min(start + partSize, file.size);
    const blob = file.slice(start, end);

    return withRetry(async () => {
      const signResponse = await fetch("/api/admin/media/multipart/sign-part", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectKey, uploadId, partNumber }),
      });
      const signData = await signResponse.json();
      if (!signResponse.ok) throw new Error(signData.error ?? `Failed to sign part ${partNumber}`);

      const eTag = await uploadPartWithProgress(
        signData.url,
        blob,
        (loaded) => {
          partLoaded[partNumber - 1] = loaded;
          reportProgress();
        },
        signal,
      );
      partLoaded[partNumber - 1] = blob.size;
      reportProgress();
      return { partNumber, eTag };
    }, MAX_PART_RETRIES);
  }

  // Bounded concurrency: enough parts in flight to saturate typical
  // upload bandwidth without opening hundreds of simultaneous
  // connections for a multi-GB file.
  const partNumbers = Array.from({ length: partCount }, (_, index) => index + 1);
  const completedParts: MultipartPart[] = [];
  let cursor = 0;
  let firstError: unknown = null;

  async function worker() {
    while (cursor < partNumbers.length) {
      if (signal?.aborted) throw new Error("Upload cancelled");
      const partNumber = partNumbers[cursor];
      cursor += 1;
      try {
        const part = await uploadOnePart(partNumber);
        completedParts.push(part);
      } catch (error) {
        firstError = firstError ?? error;
        throw error;
      }
    }
  }

  try {
    await Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT_PARTS, partCount) }, () => worker()),
    );
  } catch (error) {
    // Best-effort cleanup so a failed large upload doesn't leave an
    // orphaned incomplete multipart upload (and its parts) billed
    // against the bucket forever.
    await fetch("/api/admin/media/multipart/abort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectKey, uploadId }),
    }).catch(() => {});
    throw firstError ?? error;
  }

  const completeResponse = await fetch("/api/admin/media/multipart/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey, uploadId, fileSize: file.size, parts: completedParts }),
  });
  const completeData = await completeResponse.json();
  if (!completeResponse.ok) throw new Error(completeData.error ?? "Failed to complete multipart upload");
}
