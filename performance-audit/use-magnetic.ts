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

      const setBaseTransform = () => {
        const computed = window.getComputedStyle(element).transform;
        baseTransform = computed === "none" ? "" : computed;
      };

      const onMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `${baseTransform} translate3d(${x * strength}px, ${y * strength}px, 0) scale(1.025)`;
      };

      const onLeave = () => {
        element.style.transform = baseTransform;
      };

      element.addEventListener("mouseenter", setBaseTransform);
      element.addEventListener("mousemove", onMove);
      element.addEventListener("mouseleave", onLeave);

      return () => {
        element.removeEventListener("mouseenter", setBaseTransform);
        element.removeEventListener("mousemove", onMove);
        element.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}
