"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Load Google Analytics only after the browser load event and an idle period.
 * Page-view tracking remains enabled for Next.js client-side route changes.
 */
export function LazyGoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !pathname || typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
    });
  }, [pathname, ready]);

  return (
    <Script
      id="kroo-google-analytics"
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      strategy="lazyOnload"
      onReady={() => {
        if (typeof window.gtag !== "function") return;
        window.gtag("js", new Date());
        window.gtag("config", gaId, { send_page_view: false });
        setReady(true);
      }}
    />
  );
}
