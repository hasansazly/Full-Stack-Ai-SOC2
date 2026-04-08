import Link from "next/link";

import { DashboardControls } from "@/components/dashboard-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvidenceArtifacts } from "@/lib/data";
import { formatDate, shortChecksum } from "@/lib/utils";

export default async function DashboardPage() {
  const evidenceArtifacts = await getEvidenceArtifacts();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Dashboard</p>
          <h1 className="mt-2 font-display text-5xl">Security review blockers at a glance.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Connect your environments, run both collectors, and convert evidence into prioritized findings you can actually close.
          </p>
        </div>
        <Link href="/findings" className="text-sm font-semibold text-primary">
          Go to Findings
        </Link>
      </div>

      <DashboardControls clientId={null} />

      <Card>
        <CardHeader>
          <CardTitle>Recent evidence artifacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Collected At</th>
                  <th className="px-4 py-3 font-medium">Artifact Type</th>
                  <th className="px-4 py-3 font-medium">Checksum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {evidenceArtifacts.map((artifact) => (
                  <tr key={artifact.id}>
                    <td className="px-4 py-3 capitalize">{artifact.source?.replace("_", " ")}</td>
                    <td className="px-4 py-3">{formatDate(artifact.collected_at)}</td>
                    <td className="px-4 py-3">{artifact.artifact_type}</td>
                    <td className="px-4 py-3 font-mono">{shortChecksum(artifact.checksum ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
