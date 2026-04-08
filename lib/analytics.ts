"use client";

import { useCallback } from "react";
import posthog from "posthog-js";

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}

export function useAnalytics() {
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    captureEvent(event, properties);
  }, []);

  return { track };
}
