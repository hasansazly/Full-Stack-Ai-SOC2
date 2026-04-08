"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

type Gap = {
  id: string;
  control: string;
  severity: "critical" | "high" | "medium" | "low";
  finding: string;
  remediation_code: string | null;
  auto_remediable: boolean | null;
  remediation_type: string | null;
  status: string;
};

type GapsPageClientProps = {
  initialControlFilter?: string;
};

const severityBorder: Record<string, string> = {
  critical: "border-l-[#ef4444]",
  high: "border-l-[#f97316]",
  medium: "border-l-yellow-500",
  low: "border-l-[#22c55e]",
};

export function GapsPageClient({ initialControlFilter }: GapsPageClientProps) {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [controlFilter, setControlFilter] = useState(initialControlFilter || "All");
  const [selectedGap, setSelectedGap] = useState<Gap | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("gap_findings").select("*").order("created_at", { ascending: false });
      setGaps((data as Gap[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return gaps.filter((gap) => {
      const severityMatch =
        filter === "All" ||
        (filter === "Remediated" ? gap.status === "approved" || gap.status === "closed" : gap.severity === filter.toLowerCase());
      const controlMatch = controlFilter === "All" || gap.control === controlFilter;
      return severityMatch && controlMatch;
    });
  }, [gaps, filter, controlFilter]);

  async function approveGap(gapId: string) {
    const response = await fetch("/api/approve-remediation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gap_id: gapId }),
    });

    if (response.ok) {
      setGaps((current) => current.map((gap) => (gap.id === gapId ? { ...gap, status: "approved" } : gap)));
      setToast("Remediation approved and logged as audit evidence");
      setTimeout(() => setToast(""), 3000);
    }
  }

  async function markResolved(gapId: string) {
    const supabase = createClient();
    await supabase.from("gap_findings").update({ status: "closed" }).eq("id", gapId);
    setGaps((current) => current.map((gap) => (gap.id === gapId ? { ...gap, status: "closed" } : gap)));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-white">Gap Findings</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {["All", "Critical", "High", "Medium", "Remediated"].map((item) => (
          <Button
            key={item}
            variant="outline"
            className={`border-[#2a2a2a] bg-transparent ${filter === item ? "bg-[#1a1a1a] text-white" : "text-[#888888]"}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
        <select
          className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-sm text-white"
          value={controlFilter}
          onChange={(e) => setControlFilter(e.target.value)}
        >
          <option>All</option>
          {["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {toast ? <p className="text-sm text-[#22c55e]">{toast}</p> : null}

      {loading ? (
        <p className="text-sm text-[#888888]">Loading gaps...</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((gap) => (
            <Card key={gap.id} className={`border-[#2a2a2a] bg-[#141414] border-l-4 ${severityBorder[gap.severity]}`}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="neutral">{gap.control}</Badge>
                  <Badge variant={gap.severity}>{gap.severity}</Badge>
                  {gap.auto_remediable ? <Badge variant="medium">Auto-fix available</Badge> : null}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">{gap.finding}</h2>
                  <p className="mt-2 text-sm text-[#888888]">
                    {gap.remediation_type
                      ? `Remediation type: ${gap.remediation_type}. Status: ${gap.status}.`
                      : `Status: ${gap.status}.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-[#6366f1] hover:bg-[#5558e6]" onClick={() => setSelectedGap(gap)}>
                    View fix
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2a2a2a] bg-transparent text-[#d4d4d8] hover:bg-[#1a1a1a]"
                    onClick={() => markResolved(gap.id)}
                  >
                    Mark resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedGap} onOpenChange={(open) => !open && setSelectedGap(null)}>
        <DialogContent className="border-[#2a2a2a] bg-[#141414] text-white">
          <DialogTitle>Auto-Remediation: {selectedGap?.finding}</DialogTitle>
          <DialogDescription className="text-[#888888]">
            Review the generated remediation and approve it to log the action.
          </DialogDescription>
          <pre className="overflow-auto rounded-xl bg-black/40 p-4 font-mono text-[13px] text-slate-200">
            {selectedGap?.remediation_code || "No remediation code available."}
          </pre>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-[#2a2a2a] bg-transparent text-[#d4d4d8] hover:bg-[#1a1a1a]"
              onClick={async () => {
                if (selectedGap?.remediation_code) {
                  await navigator.clipboard.writeText(selectedGap.remediation_code);
                }
              }}
            >
              Copy to clipboard
            </Button>
            <Button className="bg-[#6366f1] hover:bg-[#5558e6]" onClick={() => selectedGap && approveGap(selectedGap.id)}>
              Mark as approved
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
