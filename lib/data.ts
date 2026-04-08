import { createAdminSupabaseClient } from "@/lib/supabase";
import { demoEvidence, demoFindings } from "@/lib/demo-data";
import type { FindingRecord } from "@/lib/gapEngine";

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
