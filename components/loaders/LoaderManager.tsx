"use client";

import React from "react";
import LoaderV1 from "./LoaderV1";
import LoaderV2 from "./LoaderV2";

// Change this constant to switch between versions
export const LOADER_VERSION: "v1" | "v2" = "v2";

export default function LoaderManager() {
  if (LOADER_VERSION === "v1") {
    return <LoaderV1 />;
  }
  return <LoaderV2 />;
}
