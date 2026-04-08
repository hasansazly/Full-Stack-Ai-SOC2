export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Terms</p>
        <h1 className="mt-2 font-display text-5xl">Talosly Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">
          Effective date: April 7, 2026. These terms govern access to and use of Talosly’s trust-readiness software and related services.
        </p>
      </div>
      <div className="space-y-6 text-sm text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Service scope</h2>
          <p>Talosly provides software and related guidance to help customers prepare for enterprise buyer security reviews, assess likely control gaps, and generate related readiness outputs.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Customer responsibilities</h2>
          <p>Customers are responsible for the accuracy of connected system data, the use of generated outputs, and the approval of any remediation actions taken in their own environments.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">No automatic remediation</h2>
          <p>Talosly does not silently modify customer environments. Any future action-taking workflow should be explicitly authorized and clearly scoped before use.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Availability and changes</h2>
          <p>We may update, improve, or modify the service over time. Early-stage features may change as we work with design partners and early customers.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>Questions about these terms can be sent to <a className="text-primary" href="mailto:founders@talosly.com">founders@talosly.com</a>.</p>
        </section>
      </div>
    </main>
  );
}
