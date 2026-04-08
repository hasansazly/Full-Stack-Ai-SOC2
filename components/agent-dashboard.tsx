"use client";

import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { getRemediationForFinding } from "@/lib/agents/autoRemediator";
import { sampleFindingOwners } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ControlStatus = "Passing" | "Gap Found" | "Remediated" | "Not Collected";

type DashboardGap = {
  id: string;
  control: string;
  severity: "critical" | "high" | "medium" | "low";
  finding: string;
  auto_remediable: boolean;
  remediation_type: "cli" | "api" | "policy" | "manual";
  status: "open" | "approved" | "remediated";
};

type EvidenceArtifact = {
  id: string;
  control: string;
  source: string;
  collected_at: string;
  content_hash: string;
};

type RemediationEntry = {
  id: string;
  gap_id: string;
  remediation_code: string;
  approved_at: string | null;
  executed_at: string | null;
  execution_result: { status: string; summary: string };
};

const controlRows: Array<{ control: string; status: ControlStatus }> = [
  { control: "CC1.1 Control Environment", status: "Passing" },
  { control: "CC2.1 Communication", status: "Passing" },
  { control: "CC3.2 Risk Assessment", status: "Gap Found" },
  { control: "CC4.1 Monitoring", status: "Not Collected" },
  { control: "CC5.2 Change Governance", status: "Gap Found" },
  { control: "CC6.1 Logical Access", status: "Gap Found" },
  { control: "CC6.2 Privileged Access", status: "Gap Found" },
  { control: "CC7.2 Change Detection", status: "Passing" },
  { control: "CC8.1 Change Management", status: "Gap Found" }
];

function statusBadgeVariant(status: ControlStatus) {
  if (status === "Passing") return "low";
  if (status === "Gap Found") return "critical";
  if (status === "Remediated") return "medium";
  return "neutral";
}

function shortHash(hash: string) {
  return hash.slice(0, 12);
}

export function AgentDashboard({
  gaps,
  artifacts,
  remediationLog
}: {
  gaps: DashboardGap[];
  artifacts: EvidenceArtifact[];
  remediationLog: RemediationEntry[];
}) {
  const [selectedRemediation, setSelectedRemediation] = useState<RemediationEntry | null>(remediationLog[0] ?? null);
  const [gapState, setGapState] = useState(gaps);
  const [logState, setLogState] = useState(remediationLog);

  async function approve(gap: DashboardGap) {
    const response = await fetch("/api/remediations/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gapId: gap.id, finding: gap.finding })
    });
    const payload = await response.json();

    if (response.ok) {
      setGapState((current) => current.map((item) => (item.id === gap.id ? { ...item, status: "approved" } : item)));
      const entry = {
        id: `preview-${gap.id}`,
        gap_id: gap.id,
        remediation_code: payload.remediation.code,
        approved_at: new Date().toISOString(),
        executed_at: null,
        execution_result: {
          status: "preview_generated",
          summary: payload.remediation.summary
        }
      };
      setLogState((current) => [entry, ...current]);
      setSelectedRemediation(entry);
      captureEvent("questionnaire_answer_generated", { source: "agent_dashboard" });
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Control Matrix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {controlRows.map((row) => (
              <div key={row.control} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-sm text-slate-200">{row.control}</p>
                <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Auto-Remediator Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">
              Talosly agents generate the exact CLI, API, or policy change required to close common SOC 2 blockers.
            </p>
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <p className="text-sm font-medium text-white">
                {selectedRemediation?.execution_result.summary || "Approve a remediable gap to preview the exact fix."}
              </p>
              <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-xs text-slate-200">
                {selectedRemediation?.remediation_code ||
                  getRemediationForFinding("AWS user missing MFA")?.code}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Gap Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gapState.map((gap) => {
            const meta = sampleFindingOwners[(gap.id as keyof typeof sampleFindingOwners) ?? "demo-finding-1"];
            return (
              <div key={gap.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{gap.control}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{gap.finding}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={gap.severity}>{gap.severity}</Badge>
                    <Badge variant={gap.status === "remediated" ? "medium" : gap.status === "approved" ? "low" : "neutral"}>
                      {gap.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</p>
                    <p className="mt-1 text-sm text-slate-200">{meta?.owner || "Compliance lead"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Remediation</p>
                    <p className="mt-1 text-sm text-slate-200">{gap.remediation_type}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Auto-remediable</p>
                    <p className="mt-1 text-sm text-slate-200">{gap.auto_remediable ? "Yes" : "Manual review"}</p>
                  </div>
                </div>
                {gap.auto_remediable && gap.status === "open" ? (
                  <div className="mt-4">
                    <Button className="bg-indigo-500 hover:bg-indigo-400" onClick={() => approve(gap)}>
                      Approve Fix
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Evidence Artifacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {artifacts.map((artifact) => (
              <div key={artifact.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{artifact.source}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{artifact.control}</p>
                  </div>
                  <p className="font-mono text-xs text-slate-300">{shortHash(artifact.content_hash)}</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">{artifact.collected_at}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Remediation Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logState.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedRemediation(entry)}
                className="block w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left"
              >
                <p className="text-sm font-medium text-white">{entry.execution_result.summary}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{entry.execution_result.status}</p>
                <p className="mt-2 text-sm text-slate-400">{entry.approved_at || "Awaiting approval"}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
