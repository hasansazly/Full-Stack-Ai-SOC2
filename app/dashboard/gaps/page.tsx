"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type GapRow = {
  id: string;
  control: string | null;
  severity: "critical" | "high" | "medium" | "low" | null;
  finding: string | null;
  auto_remediable: boolean | null;
  remediation_code: string | null;
  status: string | null;
  evidence_id?: string | null;
};

type EvidenceRow = {
  id: string;
  source: string | null;
};

type ClientRow = {
  id: string;
};

const filters = ["All", "Critical", "High", "Medium", "Low", "Remediated"] as const;

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#888888]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#6366f1]" />
      <span>{label}</span>
    </div>
  );
}

function severityColor(severity: string | null, status: string | null) {
  if (status === "remediated") return "#22c55e";
  if (severity === "critical") return "#ef4444";
  if (severity === "high") return "#f97316";
  if (severity === "medium") return "#eab308";
  return "#6366f1";
}

function badgeClass(severity: string) {
  if (severity === "critical") return "border-red-500/20 bg-red-500/10 text-red-300";
  if (severity === "high") return "border-orange-500/20 bg-orange-500/10 text-orange-300";
  if (severity === "medium") return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  if (severity === "low") return "border-indigo-500/20 bg-indigo-500/10 text-indigo-300";
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
}

function splitFinding(finding: string | null) {
  if (!finding) return { title: "Untitled finding", body: "" };
  const separatorIndex = finding.indexOf(": ");
  if (separatorIndex === -1) return { title: finding, body: "" };
  return {
    title: finding.slice(0, separatorIndex),
    body: finding.slice(separatorIndex + 2),
  };
}

export default function GapsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [gaps, setGaps] = useState<GapRow[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedGap, setSelectedGap] = useState<GapRow | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [runningScan, setRunningScan] = useState(false);
  const [loggingApproval, setLoggingApproval] = useState(false);
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubOrg, setGithubOrg] = useState("");
  const [githubRepo, setGithubRepo] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
      const resolvedClient = client as ClientRow | null;
      if (!resolvedClient?.id) {
        setClientId(null);
        setGaps([]);
        setLoading(false);
        return;
      }

      setClientId(resolvedClient.id);

      const { data: gapData } = await supabase
        .from("gap_findings")
        .select("id, control, severity, finding, auto_remediable, remediation_code, status, evidence_id")
        .eq("client_id", resolvedClient.id)
        .order("created_at", { ascending: false });

      const typedGaps = (gapData ?? []) as GapRow[];
      setGaps(typedGaps);

      const evidenceIds = typedGaps.map((gap) => gap.evidence_id).filter((value): value is string => Boolean(value));
      if (evidenceIds.length > 0) {
        const { data: evidenceRows } = await supabase
          .from("evidence_artifacts")
          .select("id, source")
          .in("id", evidenceIds);
        const map = ((evidenceRows ?? []) as EvidenceRow[]).reduce<Record<string, string>>((accumulator, row) => {
          accumulator[row.id] = row.source ?? "Unknown";
          return accumulator;
        }, {});
        setEvidenceMap(map);
      } else {
        setEvidenceMap({});
      }

      setLoading(false);
    }

    load();
  }, [router, supabase]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const summary = useMemo(() => {
    return {
      critical: gaps.filter((gap) => gap.severity === "critical" && gap.status !== "remediated").length,
      high: gaps.filter((gap) => gap.severity === "high" && gap.status !== "remediated").length,
      medium: gaps.filter((gap) => gap.severity === "medium" && gap.status !== "remediated").length,
      remediated: gaps.filter((gap) => gap.status === "remediated").length,
    };
  }, [gaps]);

  const filteredGaps = useMemo(() => {
    return gaps.filter((gap) => {
      if (filter === "All") return true;
      if (filter === "Remediated") return gap.status === "remediated";
      return gap.severity === filter.toLowerCase();
    });
  }, [filter, gaps]);

  async function markResolved(gapId: string) {
    const previous = gaps;
    setGaps((current) => current.map((gap) => (gap.id === gapId ? { ...gap, status: "remediated" } : gap)));
    const { error: updateError } = await supabase.from("gap_findings").update({ status: "remediated" }).eq("id", gapId);
    if (updateError) {
      setGaps(previous);
      setError(updateError.message);
      return;
    }
    setToast("Gap marked as remediated");
  }

  async function logAsApproved() {
    if (!selectedGap) return;
    setLoggingApproval(true);
    setError("");
    const response = await fetch("/api/approve-remediation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gap_id: selectedGap.id }),
    });
    const payload = (await response.json()) as { error?: string };
    setLoggingApproval(false);
    if (!response.ok) {
      setError(payload.error || "Unable to log approval.");
      return;
    }
    setToast("Logged as audit evidence with timestamp");
    setSelectedGap(null);
  }

  async function runScan() {
    if (!clientId) return;
    setRunningScan(true);
    setError("");
    const response = await fetch("/api/collect-evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aws_access_key_id: awsAccessKeyId,
        aws_secret_access_key: awsSecretAccessKey,
        github_token: githubToken,
        github_org: githubOrg,
        github_repo: githubRepo,
        client_id: clientId,
      }),
    });

    const payload = (await response.json()) as { error?: string; gaps_found?: number };
    setRunningScan(false);
    if (!response.ok) {
      setError(payload.error || "Unable to run scan.");
      return;
    }

    setShowScanModal(false);
    setAwsAccessKeyId("");
    setAwsSecretAccessKey("");
    setGithubToken("");
    setGithubOrg("");
    setGithubRepo("");
    setToast(`${payload.gaps_found ?? 0} gaps found`);
    router.refresh();
    window.location.reload();
  }

  return (
    <div className="relative space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-white">Gap Findings</h1>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5558e6]"
          onClick={() => setShowScanModal(true)}
        >
          Run new scan
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Critical: {summary.critical}
        </div>
        <div className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
          High: {summary.high}
        </div>
        <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
          Medium: {summary.medium}
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          Remediated: {summary.remediated}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              filter === tab
                ? "border-[#6366f1] bg-[#6366f1]/15 text-white"
                : "border-[#2a2a2a] bg-[#141414] text-[#888888] hover:bg-[#1a1a1a]"
            }`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {toast ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{toast}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      {loading ? (
        <Spinner label="Loading gap findings..." />
      ) : filteredGaps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#111111] p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-[#2a2a2a] bg-[#141414]" />
          <p className="text-base font-medium text-white">No gaps found yet</p>
          <p className="mt-2 text-sm text-[#888888]">Run your first scan to identify control blockers in AWS and GitHub.</p>
        </div>
      ) : (
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {filteredGaps.map((gap) => {
            const split = splitFinding(gap.finding);
            return (
              <article
                key={gap.id}
                className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5"
                style={{ borderLeftWidth: 4, borderLeftColor: severityColor(gap.severity, gap.status) }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#2a2a2a] bg-[#101010] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#cfcfcf]">
                    {gap.control || "Unknown"}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${badgeClass(gap.status === "remediated" ? "remediated" : gap.severity || "low")}`}>
                    {gap.status === "remediated" ? "remediated" : gap.severity || "unknown"}
                  </span>
                  {gap.auto_remediable ? (
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-indigo-300">
                      auto-fix
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-[15px] font-semibold text-white">{split.title}</h2>
                <p className="mt-2 text-[13px] leading-6 text-[#888888]">{split.body || gap.finding}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[11px] text-[#666666]">{evidenceMap[gap.evidence_id || ""] || "Unknown evidence source"}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5558e6]"
                      onClick={() => setSelectedGap(gap)}
                    >
                      View fix
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#2a2a2a] bg-transparent px-4 py-2 text-sm font-medium text-[#d4d4d8] transition hover:bg-[#1a1a1a]"
                      onClick={() => markResolved(gap.id)}
                    >
                      Mark resolved
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(selectedGap || showScanModal) && (
        <div className="absolute inset-0 z-30 bg-black/60">
          <div className="flex min-h-full items-start justify-center p-4 pt-16">
            {selectedGap ? (
              <div className="relative w-full max-w-[560px] rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl">
                <button
                  type="button"
                  className="absolute right-4 top-4 text-xl text-[#888888] hover:text-white"
                  onClick={() => setSelectedGap(null)}
                >
                  ×
                </button>
                <h2 className="text-xl font-medium text-white">Auto-Remediation</h2>
                <p className="mt-2 text-sm text-[#888888]">{splitFinding(selectedGap.finding).title}</p>
                <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                  Review this fix before running. Talosly generates the exact command — you approve and run it. This is
                  logged as audit evidence.
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-[#0a0a0a] p-4 font-mono text-[12px] text-white">
                  {selectedGap.remediation_code || "No remediation code available."}
                </pre>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-[#2a2a2a] bg-transparent px-4 py-2 text-sm font-medium text-[#d4d4d8] transition hover:bg-[#1a1a1a]"
                    onClick={async () => {
                      if (selectedGap.remediation_code) {
                        await navigator.clipboard.writeText(selectedGap.remediation_code);
                        setToast("Copied remediation code");
                      }
                    }}
                  >
                    Copy to clipboard
                  </button>
                  <button
                    type="button"
                    disabled={loggingApproval}
                    className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5558e6] disabled:opacity-60"
                    onClick={logAsApproved}
                  >
                    {loggingApproval ? "Logging approval..." : "Log as approved"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-[560px] rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl">
                <button
                  type="button"
                  className="absolute right-4 top-4 text-xl text-[#888888] hover:text-white"
                  onClick={() => setShowScanModal(false)}
                >
                  ×
                </button>
                <h2 className="text-xl font-medium text-white">Run new scan</h2>
                <div className="mt-4 space-y-4">
                  <input
                    value={awsAccessKeyId}
                    onChange={(event) => setAwsAccessKeyId(event.target.value)}
                    placeholder="AWS Access Key ID"
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                  <input
                    type="password"
                    value={awsSecretAccessKey}
                    onChange={(event) => setAwsSecretAccessKey(event.target.value)}
                    placeholder="AWS Secret Access Key"
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(event) => setGithubToken(event.target.value)}
                    placeholder="GitHub Token"
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                  <input
                    value={githubOrg}
                    onChange={(event) => setGithubOrg(event.target.value)}
                    placeholder="GitHub Org"
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                  <input
                    value={githubRepo}
                    onChange={(event) => setGithubRepo(event.target.value)}
                    placeholder="GitHub Repo"
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1]"
                  />
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                    Credentials are used once for this scan only and are never stored by Talosly.
                  </div>
                  <button
                    type="button"
                    disabled={runningScan}
                    className="inline-flex items-center gap-3 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5558e6] disabled:opacity-60"
                    onClick={runScan}
                  >
                    {runningScan ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Collecting evidence from AWS and GitHub...
                      </>
                    ) : (
                      "Run scan"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
