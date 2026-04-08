import { JsonModalButton } from "@/components/json-modal-button";
import { getEvidenceArtifacts } from "@/lib/data";
import { formatDate, shortChecksum } from "@/lib/utils";

export default async function EvidencePage() {
  const artifacts = await getEvidenceArtifacts();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Evidence Artifacts</p>
        <h1 className="mt-2 font-display text-5xl">Trace every finding back to collected evidence.</h1>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Collected At</th>
              <th className="px-4 py-3 font-medium">Artifact Type</th>
              <th className="px-4 py-3 font-medium">Checksum</th>
              <th className="px-4 py-3 font-medium">Raw Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {artifacts.map((artifact) => (
              <tr key={artifact.id}>
                <td className="px-4 py-3">{artifact.source === "aws_iam" ? "AWS IAM Report" : "GitHub Branch Rules"}</td>
                <td className="px-4 py-3">{formatDate(artifact.collected_at)}</td>
                <td className="px-4 py-3">{artifact.artifact_type}</td>
                <td className="px-4 py-3 font-mono">{shortChecksum(artifact.checksum ?? "")}</td>
                <td className="px-4 py-3">
                  <JsonModalButton title={artifact.artifact_type ?? "Artifact"} data={artifact.raw_data} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
