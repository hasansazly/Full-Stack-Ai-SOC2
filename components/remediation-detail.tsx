"use client";

import { useMemo, useState } from "react";

import type { RemediationDefinition, RemediationExecutionRecord } from "@/lib/remediations/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RemediationLogResponse = {
  id: string;
  action: string;
  actor: string;
  at: string;
  status: string;
  summary: string;
  executionResult?: Record<string, unknown> | null;
  afterEvidence?: Array<{ label: string; detail: string; status: string }>;
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusVariant(status: string) {
  if (status === "executed" || status === "remediated") return "low";
  if (status === "approved" || status === "prepared") return "medium";
  if (status === "open") return "neutral";
  return "high";
}

export function RemediationDetail({
  findingId,
  remediation,
  initialTimeline,
}: {
  findingId: string;
  remediation: RemediationDefinition | null;
  initialTimeline: RemediationExecutionRecord[];
}) {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState("");
  const [executionStatus, setExecutionStatus] = useState<string>("not_started");
  const [afterEvidence, setAfterEvidence] = useState(remediation?.afterEvidence ?? []);
  const [executionResult, setExecutionResult] = useState<Record<string, unknown> | null>(null);

  const requiredFields = remediation?.executionFields ?? [];

  const latestStatus = useMemo(() => {
    return timeline[0]?.status ?? executionStatus;
  }, [executionStatus, timeline]);

  if (!remediation) {
    return (
      <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5 text-sm text-[#888888]">
        Talosly does not have a deterministic remediation template for this finding yet. The issue can still be reviewed
        manually, but it is not eligible for safe one-click remediation in v1.
      </div>
    );
  }

  async function handleApprove() {
    setApprovalLoading(true);
    setError("");

    try {
      const response = await fetch("/api/remediations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findingId }),
      });
      const payload = (await response.json()) as { error?: string; log?: RemediationLogResponse };

      if (!response.ok || !payload.log) {
        setError(payload.error || "Unable to approve remediation.");
        return;
      }

      setTimeline((current) => [payload.log!, ...current]);
      setExecutionStatus(payload.log.status);
    } catch {
      setError("Unable to approve remediation.");
    } finally {
      setApprovalLoading(false);
    }
  }

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplyLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const executionInput = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/remediations/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findingId, executionInput }),
      });
      const payload = (await response.json()) as {
        error?: string;
        log?: RemediationLogResponse;
      };

      if (!response.ok || !payload.log) {
        setError(payload.error || "Unable to apply remediation.");
        return;
      }

      setTimeline((current) => [payload.log!, ...current]);
      setExecutionStatus(payload.log.status);
      setExecutionResult(payload.log.executionResult ?? null);
      if (payload.log.afterEvidence) {
        setAfterEvidence(payload.log.afterEvidence.map((item) => ({ ...item, status: item.status as "captured" | "pending" | "expected" })));
      }
    } catch {
      setError("Unable to apply remediation.");
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">Suggested fix</p>
            <h3 className="mt-2 text-lg font-medium text-white">{remediation.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(latestStatus) as "critical" | "high" | "medium" | "low" | "neutral"}>
              {latestStatus.replaceAll("_", " ")}
            </Badge>
            <Badge variant="neutral">{remediation.executionMode}</Badge>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#cfcfcf]">{remediation.issueSummary}</p>
        <p className="mt-3 text-sm text-[#888888]">{remediation.whyItMatters}</p>
      </div>

      <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-5 text-sm text-indigo-100">
        <p className="font-medium text-white">Approval required</p>
        <p className="mt-2">{remediation.approvalWarning}</p>
      </div>

      <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">{remediation.suggestedFixLabel}</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#2a2a2a] bg-black/40 p-4 text-xs leading-6 text-[#d4d4d8]">
          {remediation.payload.content}
        </pre>
        {remediation.payload.secondaryContent ? (
          <>
            <p className="mt-5 text-xs uppercase tracking-[0.22em] text-[#888888]">{remediation.payload.secondaryTitle}</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#2a2a2a] bg-black/40 p-4 text-xs leading-6 text-[#d4d4d8]">
              {remediation.payload.secondaryContent}
            </pre>
          </>
        ) : null}
      </div>

      <form onSubmit={handleApply} className="space-y-5 rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleApprove} disabled={approvalLoading}>
            {approvalLoading ? "Approving..." : remediation.approvalLabel}
          </Button>
          <Button type="submit" variant="secondary" disabled={applyLoading}>
            {applyLoading ? "Applying..." : remediation.applyLabel}
          </Button>
        </div>

        {requiredFields.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {requiredFields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="text-sm text-[#cfcfcf]" htmlFor={field.name}>
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="mt-2 min-h-[120px] w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    className="mt-2 w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                )}
                {field.helperText ? <p className="mt-2 text-xs text-[#888888]">{field.helperText}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {remediation.manualSteps?.length ? (
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">Manual follow-up</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#cfcfcf]">
              {remediation.manualSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {error ? <p className="text-sm text-[#ef4444]">{error}</p> : null}
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">Before evidence</p>
          <div className="mt-4 space-y-3">
            {remediation.beforeEvidence.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <Badge variant={item.status === "captured" ? "low" : "neutral"}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-[#888888]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">{remediation.evidenceLabel}</p>
          <div className="mt-4 space-y-3">
            {afterEvidence.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <Badge variant={item.status === "captured" ? "low" : item.status === "expected" ? "neutral" : "medium"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-[#888888]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {executionResult ? (
        <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">Execution status</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#2a2a2a] bg-black/40 p-4 text-xs leading-6 text-[#d4d4d8]">
            {JSON.stringify(executionResult, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="rounded-3xl border border-[#2a2a2a] bg-[#111111] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#888888]">Audit log timeline</p>
        <div className="mt-4 space-y-4">
          {timeline.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-[#2a2a2a] bg-[#151515] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium capitalize text-white">{entry.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-[#888888]">{entry.summary}</p>
                </div>
                <Badge variant={statusVariant(entry.status) as "critical" | "high" | "medium" | "low" | "neutral"}>
                  {entry.status}
                </Badge>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#666666]">
                {entry.actor} · {formatTimestamp(entry.at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
