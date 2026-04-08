import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const principles = [
  {
    title: "Read-only discovery by default",
    description:
      "GitHub and AWS integrations are meant to inspect existing configuration and collect evidence. They do not silently modify controls."
  },
  {
    title: "No remediation without approval",
    description:
      "Talosly surfaces what should change and why. Any remediation action should be approved by your team before anything is updated."
  },
  {
    title: "Evidence handling with minimal scope",
    description:
      "We only need enough access to identify buyer-relevant blockers, generate evidence-backed findings, and support questionnaire responses."
  }
];

export default function TrustPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Trust</p>
        <h1 className="mt-2 font-display text-5xl">Built for skeptical founders and skeptical buyers.</h1>
        <p className="mt-4 text-muted-foreground">
          Talosly is designed to help you answer enterprise security teams with real evidence while keeping access narrow and explicit.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {principles.map((principle) => (
          <Card key={principle.title}>
            <CardHeader>
              <CardTitle>{principle.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{principle.description}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Integration permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">AWS:</span> Read IAM users, policies, groups, MFA devices, and credential-report data needed to evaluate logical-access controls.</p>
            <p><span className="font-medium text-foreground">GitHub:</span> Read repositories, branch protection settings, status-check requirements, and CODEOWNERS presence.</p>
            <p><span className="font-medium text-foreground">Writes:</span> None by default in this MVP. Future remediation actions should be explicit, reviewable, and opt-in.</p>
            <p><span className="font-medium text-foreground">Approval model:</span> Customer approval is required before any action-taking remediation workflow should run against a live environment.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Use the least access needed to collect evidence.</p>
            <p>Make findings traceable back to specific evidence artifacts.</p>
            <p>Keep customer workspaces isolated so each company sees only its own data and findings.</p>
            <p>Keep generated outputs honest, concise, and safe to share with buyer security teams.</p>
            <p>Prefer explicit user approval before any environment-changing action.</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data handling model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Stored:</span> evidence artifacts, findings, generated drafts, and workspace metadata needed to support trust-readiness workflows.</p>
            <p><span className="font-medium text-foreground">Not the goal:</span> broad ingestion of unnecessary customer data outside the narrow evidence needed for AWS and GitHub review readiness.</p>
            <p><span className="font-medium text-foreground">Traceability:</span> artifacts should remain linked to timestamps, checksums, and source system context.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer isolation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Each customer workspace should be isolated so users only see their own findings, evidence, and remediation history.</p>
            <p>Row-level access control and scoped credentials are the default operating model for multi-tenant trust data.</p>
            <p>Any future action-taking workflows should inherit the same approval, auditability, and isolation boundaries.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
