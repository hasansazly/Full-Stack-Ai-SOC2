export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Privacy</p>
        <h1 className="mt-2 font-display text-5xl">Talosly Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          Effective date: April 7, 2026. This policy describes how Talosly collects, uses, and protects information in connection with trust-readiness workflows and enterprise security review support.
        </p>
      </div>
      <div className="space-y-6 text-sm text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Information we collect</h2>
          <p>Talosly collects the account, workspace, and integration information needed to evaluate trust readiness and generate findings, evidence records, questionnaire drafts, and policy outputs.</p>
          <p>This may include user-provided contact information, AWS IAM metadata, GitHub repository and branch protection metadata, and generated artifacts tied to your workspace.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">How we use information</h2>
          <p>We use collected information to operate the product, identify likely buyer security-review blockers, generate remediation guidance, support questionnaire-answer drafting, and improve the product.</p>
          <p>We do not use customer data to perform environment-changing remediation actions unless those actions are explicitly approved and introduced as part of a future product workflow.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Data minimization and isolation</h2>
          <p>Talosly is designed to collect the minimum evidence needed to support trust-readiness workflows. Customer workspaces should remain isolated so users only see their own findings, evidence, and related artifacts.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Security and retention</h2>
          <p>We apply least-privilege principles to integrations, store evidence with timestamps and checksums where relevant, and aim to retain data only as long as needed to provide the service and support customer requirements.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>For privacy questions or requests, contact <a className="text-primary" href="mailto:founders@talosly.com">founders@talosly.com</a>.</p>
        </section>
      </div>
    </main>
  );
}
