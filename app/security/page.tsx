import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const postureItems = [
  "Scoped, evidence-oriented integrations for AWS IAM and GitHub configuration review",
  "Read-first operating model for evidence collection and trust readiness workflows",
  "No remediation action without explicit customer approval",
  "Artifact checksums and timestamps to preserve traceability from finding to evidence",
  "Generated outputs designed to be honest, concise, and safe to share with buyer security teams"
];

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Security</p>
        <h1 className="mt-2 font-display text-5xl">Security posture for a trust infrastructure company.</h1>
        <p className="mt-4 text-muted-foreground">
          Talosly is being built to become the system of record for trust readiness, so the product has to be explicit about access, evidence integrity, and approval boundaries from day one.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {postureItems.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integration model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Read-only by default:</span> IAM users, MFA status, policy exposure, branch protection, status checks, and ownership metadata.</p>
            <p><span className="font-medium text-foreground">Action-taking later:</span> Future remediation workflows should be explicit, reviewable, and approved before any changes reach customer infrastructure.</p>
            <p><span className="font-medium text-foreground">Evidence integrity:</span> Findings should always be traceable back to artifacts with timestamps, source metadata, and checksums.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
