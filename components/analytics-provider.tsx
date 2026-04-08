"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!key || posthog.__loaded) {
      return;
    }

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      autocapture: true
    });
  }, []);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const query = searchParams?.toString();
    posthog.capture("$pageview", {
      $current_url: query ? `${pathname}?${query}` : pathname
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
