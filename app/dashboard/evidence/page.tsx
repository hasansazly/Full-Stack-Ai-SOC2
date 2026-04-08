"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type EvidenceItem = {
  id: string;
  control: string;
  source: string;
  collected_at: string;
  content_hash?: string | null;
  checksum?: string | null;
};

function shortHash(hash: string) {
  return `${hash.slice(0, 12)}...`;
}

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubOrg, setGithubOrg] = useState("");

  async function loadEvidence() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("evidence_artifacts").select("*").order("collected_at", { ascending: false });
    setItems((data as EvidenceItem[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  const rows = useMemo(() => items, [items]);

  async function collectEvidence() {
    setCollecting(true);
    setError("");
    const response = await fetch("/api/collect-evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aws_access_key: awsAccessKey,
        aws_secret_key: awsSecretKey,
        github_token: githubToken,
        github_org: githubOrg
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Failed to collect evidence.");
    } else {
      setOpen(false);
      await loadEvidence();
    }
    setCollecting(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-white">Evidence Artifacts</h1>
          <p className="mt-2 text-sm text-[#888888]">
            Tamper-evident audit trail. All items are SHA-256 hashed at collection time.
          </p>
        </div>
        <Button className="bg-[#6366f1] hover:bg-[#5558e6]" onClick={() => setOpen(true)}>
          Collect evidence
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-[#888888]">Loading evidence...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#2a2a2a]">
          <table className="min-w-full divide-y divide-[#2a2a2a] text-sm">
            <thead className="bg-[#141414] text-left text-[#888888]">
              <tr>
                <th className="px-4 py-3 font-medium">Control</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Collected At</th>
                <th className="px-4 py-3 font-medium">SHA-256 Hash</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] bg-[#141414]">
              {rows.map((item) => (
                <tr key={item.id} className="hover:bg-[#1a1a1a]">
                  <td className="px-4 py-4 text-white">{item.control}</td>
                  <td className="px-4 py-4 text-[#d4d4d8]">{item.source}</td>
                  <td className="px-4 py-4 text-[#888888]">{new Date(item.collected_at).toLocaleString()}</td>
                  <td className="px-4 py-4 font-mono text-[#d4d4d8]" title={item.content_hash || item.checksum || ""}>
                    {item.content_hash || item.checksum ? shortHash(item.content_hash || item.checksum || "") : "Unavailable"}
                  </td>
                  <td className="px-4 py-4 text-[#22c55e]">Collected</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-[#2a2a2a] bg-[#141414] text-white">
          <DialogTitle>Collect evidence</DialogTitle>
          <DialogDescription className="text-[#888888]">
            Enter credentials for this request only. Talosly never stores AWS keys or GitHub tokens.
          </DialogDescription>
          <div className="space-y-4">
            <Input placeholder="AWS Access Key ID" value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)} />
            <Input placeholder="AWS Secret Key" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)} />
            <Input placeholder="GitHub Token" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} />
            <Input placeholder="GitHub Org" value={githubOrg} onChange={(e) => setGithubOrg(e.target.value)} />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <Button className="w-full bg-[#6366f1] hover:bg-[#5558e6]" disabled={collecting} onClick={collectEvidence}>
              {collecting ? "Collecting evidence from AWS and GitHub..." : "Collect evidence"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
