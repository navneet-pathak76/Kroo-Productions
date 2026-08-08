// TEMPORARY DEBUG ROUTE — delete after diagnosing.
// Place at: app/api/debug-s3/route.ts
// Visit: http://localhost:3000/api/debug-s3
//
// Lists the *actual* top-level folders (CommonPrefixes) under "videos/"
// in your S3 bucket, plus a sample of keys inside each, so you can see
// the real folder names/casing instead of guessing what the code expects.

import "server-only";
import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET_NAME } from "@/lib/aws/s3-client";

export async function GET() {
  try {
    // 1. Top-level folders directly under videos/
    const top = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: "videos/",
        Delimiter: "/",
      })
    );

    const topLevelFolders = (top.CommonPrefixes ?? []).map((p) => p.Prefix);

    // 2. For each folder found, grab up to 5 sample keys so we can see
    //    real filenames/extensions too.
    const folderSamples: Record<string, string[]> = {};
    for (const folderPrefix of topLevelFolders) {
      if (!folderPrefix) continue;
      const inner = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET_NAME,
          Prefix: folderPrefix,
          MaxKeys: 5,
        })
      );
      folderSamples[folderPrefix] = (inner.Contents ?? []).map(
        (o) => o.Key ?? ""
      );
    }

    // 3. Also list anything sitting loose directly under videos/ (not in
    //    a subfolder) — sometimes files get uploaded to the wrong level.
    const looseFiles = (top.Contents ?? [])
      .map((o) => o.Key)
      .filter((key) => key && key !== "videos/");

    return NextResponse.json({
      bucket: S3_BUCKET_NAME,
      topLevelFoldersFoundInS3: topLevelFolders,
      sampleFilesPerFolder: folderSamples,
      looseFilesDirectlyUnderVideos: looseFiles,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "S3 call failed",
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : undefined,
      },
      { status: 500 }
    );
  }
}