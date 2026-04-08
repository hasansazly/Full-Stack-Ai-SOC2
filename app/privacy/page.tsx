export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Privacy</p>
        <h1 className="mt-2 font-display text-5xl">Privacy policy placeholder for Talosly.</h1>
        <p className="mt-4 text-muted-foreground">
          Replace this page with your lawyer-reviewed privacy policy before launch. For now, this route exists so the company front door feels complete and procurement conversations have a place to land.
        </p>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Talosly is designed to collect the minimum evidence needed to help customers assess trust readiness and respond to enterprise buyer security reviews.</p>
        <p>Customer data should be isolated by workspace and accessed only for the services explicitly requested by the customer.</p>
        <p>Integrations should remain read-oriented by default, and remediation should never run without explicit approval.</p>
      </div>
    </main>
  );
}
