import { createAdminSupabaseClient } from "@/lib/supabase";
import { demoRemediationLog } from "@/lib/agent-demo-data";
import { demoEvidence, demoFindings } from "@/lib/demo-data";
import type { FindingRecord } from "@/lib/gapEngine";
import type { RemediationExecutionRecord } from "@/lib/remediations/types";

export type EvidenceArtifact = {
  id: string;
  client_id: string | null;
  source: string | null;
  collected_at: string;
  raw_data: unknown;
  checksum: string | null;
  artifact_type: string | null;
};

export async function getEvidenceArtifacts(clientId?: string | null) {
  const supabase = createAdminSupabaseClient();
  if (!supabase || !clientId) {
    return demoEvidence as EvidenceArtifact[];
  }

  const { data } = await supabase
    .from("evidence_artifacts")
    .select("*")
    .eq("client_id", clientId)
    .order("collected_at", { ascending: false });

  return (data?.length ? data : demoEvidence) as EvidenceArtifact[];
}

export async function getGapFindings(clientId?: string | null) {
  const supabase = createAdminSupabaseClient();
  if (!supabase || !clientId) {
    return demoFindings;
  }

  const { data } = await supabase
    .from("gap_findings")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (data as FindingRecord[] | null)?.length ? (data as FindingRecord[]) : demoFindings;
}

export async function getFindingById(id: string, clientId?: string | null) {
  const findings = await getGapFindings(clientId);
  return findings.find((finding) => finding.id === id) ?? null;
}

export async function getRemediationLogsForFinding(findingId: string) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return demoRemediationLog
      .filter((entry) => entry.gap_id === findingId)
      .map<RemediationExecutionRecord>((entry) => ({
        id: entry.id,
        action: "approved",
        actor: "Talosly demo workspace",
        at: entry.approved_at ?? new Date().toISOString(),
        status: entry.execution_result.status,
        summary: entry.execution_result.summary,
      }));
  }

  const { data } = await supabase
    .from("remediation_log")
    .select("*")
    .or(`gap_id.eq.${findingId},finding_id.eq.${findingId}`)
    .order("timestamp", { ascending: false });

  return ((data ?? []) as Array<{
    id: string;
    action_taken?: string | null;
    actor?: string | null;
    approved_at?: string | null;
    executed_at?: string | null;
    timestamp?: string | null;
    execution_result?: { status?: string; summary?: string } | null;
  }>).map<RemediationExecutionRecord>((entry) => ({
    id: entry.id,
    action: entry.action_taken ?? "updated",
    actor: entry.actor ?? "Talosly",
    at: entry.executed_at ?? entry.approved_at ?? entry.timestamp ?? new Date().toISOString(),
    status: entry.execution_result?.status ?? "approved",
    summary: entry.execution_result?.summary ?? "Remediation activity logged.",
  }));
}
