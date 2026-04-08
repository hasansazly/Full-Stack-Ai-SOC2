"use client";

import { useEffect } from "react";

import { captureEvent } from "@/lib/analytics";

export function FindingViewTracker({
  findingId,
  title,
  severity
}: {
  findingId: string;
  title: string;
  severity: string;
}) {
  useEffect(() => {
    captureEvent("finding_opened", {
      finding_id: findingId,
      title,
      severity
    });
  }, [findingId, severity, title]);

  return null;
}
