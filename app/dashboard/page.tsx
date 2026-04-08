import Link from "next/link";

import { ExportPacketButton } from "@/components/export-packet-button";
import { DashboardControls } from "@/components/dashboard-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvidenceArtifacts } from "@/lib/data";
import { sampleReadinessPacket, sampleScanHistory, sampleWorkspaceSummary } from "@/lib/demo-data";
import { formatDate, shortChecksum } from "@/lib/utils";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { mode?: string };
}) {
  const evidenceArtifacts = await getEvidenceArtifacts();
  const initialMode = searchParams?.mode === "sample" ? "sample" : undefined;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Dashboard</p>
          <h1 className="mt-2 font-display text-5xl">Turn a blank workspace into a buyer-ready story.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            This first-run view is designed to keep founders moving: pick sample mode or real mode, connect what you need, run one scan, and get to the blockers that matter.
          </p>
        </div>
        <Link href="/findings" className="text-sm font-semibold text-primary">
          Go to Findings
        </Link>
      </div>

      <DashboardControls clientId={null} initialMode={initialMode ?? null} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="grain">
          <CardHeader>
            <CardTitle>Trust Mission Control</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm text-muted-foreground">Readiness score</p>
              <p className="mt-2 text-3xl font-semibold">{sampleWorkspaceSummary.readinessScore}</p>
              <p className="mt-2 text-sm text-muted-foreground">Buyer-facing posture is improving, but critical blockers remain.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm text-muted-foreground">Open blockers</p>
              <p className="mt-2 text-3xl font-semibold">{sampleWorkspaceSummary.blockersOpen}</p>
              <p className="mt-2 text-sm text-muted-foreground">Most urgent: privileged access and peer-review enforcement.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm text-muted-foreground">Buyer deadline</p>
              <p className="mt-2 text-3xl font-semibold">Apr 18</p>
              <p className="mt-2 text-sm text-muted-foreground">Use the remediation roadmap to close the highest-risk gaps first.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness packet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{sampleReadinessPacket.title}</p>
            <p>Last updated {formatDate(sampleReadinessPacket.updatedAt)}</p>
            <div className="space-y-2">
              {sampleReadinessPacket.sections.map((section) => (
                <p key={section}>- {section}</p>
              ))}
            </div>
            <ExportPacketButton />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Scan history</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-3xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Sources</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Blockers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {sampleScanHistory.map((scan) => (
                  <tr key={scan.id}>
                    <td className="px-4 py-3">{formatDate(scan.startedAt)}</td>
                    <td className="px-4 py-3">{scan.sources.join(" + ")}</td>
                    <td className="px-4 py-3 capitalize">{scan.status}</td>
                    <td className="px-4 py-3">{scan.blockersFound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trust model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Evidence first:</span> every blocker should tie back to specific AWS or GitHub evidence.</p>
            <p><span className="font-medium text-foreground">Approval required:</span> no remediation action should be taken without customer sign-off.</p>
            <p><span className="font-medium text-foreground">System of record:</span> the long-term product direction is a machine-readable trust layer, not a pile of disconnected audit tasks.</p>
            <Link href="/security" className="font-semibold text-primary">
              Review security model
            </Link>
          </CardContent>
        </Card>
      </div>

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
