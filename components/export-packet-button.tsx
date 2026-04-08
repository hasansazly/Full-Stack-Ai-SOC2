"use client";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function ExportPacketButton({ label = "Export readiness packet" }: { label?: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        captureEvent("export_packet_clicked", { source: "readiness_packet" });
      }}
    >
      {label}
    </Button>
  );
}
