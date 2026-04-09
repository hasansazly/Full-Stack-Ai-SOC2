"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type EvidenceArtifact = {
  id: string;
  client_id: string | null;
  control: string | null;
  source: string | null;
  collected_at: string;
  content_hash: string | null;
  raw_content: string | null;
};

type ClientRow = {
  id: string;
};

const sourceLabels: Record<string, string> = {
  AWS_CREDENTIAL_REPORT: "AWS Credential Report",
  AWS_IAM_USERS: "AWS IAM Users",
  AWS_PASSWORD_POLICY: "AWS Password Policy",
  AWS_ROOT_ACCOUNT: "AWS Root Account",
  AWS_IAM_GROUPS: "AWS IAM Groups",
  GITHUB_BRANCH_PROTECTION: "GitHub Branch Protection",
  GITHUB_PULL_REQUESTS: "GitHub Pull Requests",
  GITHUB_CODEOWNERS: "GitHub CODEOWNERS",
  GITHUB_ORG_MEMBERS: "GitHub Org Members",
};

function countItems(rawContent: string | null) {
  if (!rawContent) return "0";
  try {
    const parsed = JSON.parse(rawContent) as unknown;
    if (Array.isArray(parsed)) {
      return `${parsed.length}`;
    }
    return "1 record";
  } catch {
    return "0";
  }
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#888888]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#6366f1]" />
      <span>{label}</span>
    </div>
  );
}

export default function EvidencePage() {
  const supabase = createClient();
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<EvidenceArtifact[]>([]);
  const [loading, setLoading] = useState(true);

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
      const typedClient = client as ClientRow | null;
      if (!typedClient?.id) {
        setArtifacts([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("evidence_artifacts")
        .select("id, client_id, control, source, collected_at, content_hash, raw_content")
        .eq("client_id", typedClient.id)
        .order("collected_at", { ascending: false });

      setArtifacts((data ?? []) as EvidenceArtifact[]);
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  const rows = useMemo(() => artifacts, [artifacts]);

  if (loading) {
    return <Spinner label="Loading evidence artifacts..." />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#111111] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#141414] text-[#888888]">
          ?
        </div>
        <h1 className="mt-5 text-xl font-medium text-white">No evidence collected yet</h1>
        <p className="mt-2 text-sm text-[#888888]">Run your first scan from the Gaps page</p>
        <Link
          href="/dashboard/gaps"
          className="mt-6 inline-flex rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5558e6]"
        >
          Go to Gaps
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-white">Evidence Artifacts</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a2a2a]">
        <table className="min-w-full divide-y divide-[#2a2a2a] text-sm">
          <thead className="bg-[#141414] text-left text-[#888888]">
            <tr>
              <th className="px-4 py-3 font-medium">Control</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Collected</th>
              <th className="px-4 py-3 font-medium">Hash</th>
              <th className="px-4 py-3 font-medium">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a] bg-[#141414]">
            {rows.map((artifact) => (
              <tr key={artifact.id} className="hover:bg-[#1a1a1a]">
                <td className="px-4 py-4">
                  <span className="rounded-full border border-[#2a2a2a] bg-[#101010] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                    {artifact.control}
                  </span>
                </td>
                <td className="px-4 py-4 text-[#d4d4d8]">{sourceLabels[artifact.source || ""] || artifact.source}</td>
                <td className="px-4 py-4 text-[#888888]">
                  {new Date(artifact.collected_at).toLocaleDateString()} {new Date(artifact.collected_at).toLocaleTimeString()}
                </td>
                <td className="px-4 py-4 font-mono text-[#d4d4d8]" title={artifact.content_hash || ""}>
                  {artifact.content_hash ? `${artifact.content_hash.slice(0, 8)}...` : "Unavailable"}
                </td>
                <td className="px-4 py-4 text-[#d4d4d8]">{countItems(artifact.raw_content)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
