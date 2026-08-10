"use client";

import { useEffect } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";

export function CapabilityRoot() {
  const capability = useDeviceCapability();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.performanceTier = capability.performanceTier.toLowerCase();
    root.dataset.pointer = capability.pointer;
    root.dataset.browserEngine = capability.engine;
    root.dataset.reducedMotion = String(capability.reducedMotion);
    root.dataset.saveData = String(capability.saveData);
    root.dataset.touch = String(capability.touch);

    return () => {
      delete root.dataset.performanceTier;
      delete root.dataset.pointer;
      delete root.dataset.browserEngine;
      delete root.dataset.reducedMotion;
      delete root.dataset.saveData;
      delete root.dataset.touch;
    };
  }, [
    capability.engine,
    capability.performanceTier,
    capability.pointer,
    capability.reducedMotion,
    capability.saveData,
    capability.touch,
  ]);

  return null;
}
