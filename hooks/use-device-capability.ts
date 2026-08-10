"use client";

import { useEffect, useState } from "react";
import {
  getDeviceCapability,
  SAFE_DEFAULT_CAPABILITY,
  type DeviceCapability,
} from "@/lib/device-capability";

/**
 * Detects once on mount, then only re-detects on events that can actually
 * change a capability value: viewport resize (crosses breakpoints,
 * relevant to `viewportWidth`/`dpr` on zoom), orientation change, and the
 * `prefers-reduced-motion` media query flipping. Never re-runs on every
 * animation frame or every pixel of movement.
 *
 * Server-rendered output always starts from `SAFE_DEFAULT_CAPABILITY` to
 * avoid a hydration mismatch — the real snapshot replaces it on mount.
 */
export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>(SAFE_DEFAULT_CAPABILITY);

  useEffect(() => {
    setCapability(getDeviceCapability());

    let raf = 0;
    const connection = (
      navigator as unknown as {
        connection?: EventTarget;
      }
    ).connection;
    const recompute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCapability(getDeviceCapability()));
    };

    window.addEventListener("resize", recompute, { passive: true });
    window.addEventListener("orientationchange", recompute, { passive: true });
    window.visualViewport?.addEventListener("resize", recompute, { passive: true });
    connection?.addEventListener("change", recompute);

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionQuery.addEventListener("change", recompute);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recompute);
      window.removeEventListener("orientationchange", recompute);
      window.visualViewport?.removeEventListener("resize", recompute);
      connection?.removeEventListener("change", recompute);
      reducedMotionQuery.removeEventListener("change", recompute);
    };
  }, []);

  return capability;
}
