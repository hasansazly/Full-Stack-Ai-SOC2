export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Terms</p>
        <h1 className="mt-2 font-display text-5xl">Terms of service placeholder for Talosly.</h1>
        <p className="mt-4 text-muted-foreground">
          Replace this page with your formal terms before production use. This placeholder keeps the public company surface complete while you wire the legal documents.
        </p>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Talosly provides trust-readiness software and related guidance to help customers prepare for enterprise buyer security reviews.</p>
        <p>Customers remain responsible for the accuracy of connected system data, approval of remediation actions, and final responses sent to buyers.</p>
        <p>Any future action-taking integrations should be explicitly authorized and clearly scoped before use.</p>
      </div>
    </main>
  );
}
