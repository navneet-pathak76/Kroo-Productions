"use client";

import { useEffect } from "react";

export function useMagnetic() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".magnetic-target"),
    );

    const cleanups = elements.map((element) => {
      const strength = 0.18;
      let baseTransform = "";
      let rect: DOMRect | null = null;
      let rafId: number | null = null;
      let pendingX = 0;
      let pendingY = 0;

      const setBaseTransform = () => {
        const computed = window.getComputedStyle(element).transform;
        baseTransform = computed === "none" ? "" : computed;
        rect = element.getBoundingClientRect();
      };

      const applyTransform = () => {
        rafId = null;
        element.style.transform = `${baseTransform} translate3d(${pendingX * strength}px, ${pendingY * strength}px, 0) scale(1.025)`;
      };

      const onMove = (event: MouseEvent) => {
        if (!rect) rect = element.getBoundingClientRect();
        pendingX = event.clientX - rect.left - rect.width / 2;
        pendingY = event.clientY - rect.top - rect.height / 2;
        if (rafId === null) rafId = requestAnimationFrame(applyTransform);
      };

      const onLeave = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        element.style.transform = baseTransform;
        rect = null;
      };

      element.addEventListener("mouseenter", setBaseTransform);
      element.addEventListener("mousemove", onMove);
      element.addEventListener("mouseleave", onLeave);

      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        element.removeEventListener("mouseenter", setBaseTransform);
        element.removeEventListener("mousemove", onMove);
        element.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}