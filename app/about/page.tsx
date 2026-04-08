export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">About</p>
        <h1 className="mt-2 font-display text-5xl">A product for the week an enterprise deal gets real.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Talosly exists for founders and CTOs who suddenly realize that their next big customer is not blocked by product value, but by a security questionnaire they are not ready to answer.
        </p>
      </div>
      <div className="space-y-5 text-muted-foreground">
        <p>
          Most early-stage teams do not need heavyweight compliance theater. They need a fast, credible way to identify the cloud and engineering gaps buyers will ask about, fix the highest-risk issues first, and respond with evidence instead of hand-waving.
        </p>
        <p>
          Talosly focuses on the operational controls that commonly stall B2B SaaS deals: privileged access, MFA coverage, branch protections, review discipline, ownership, and policy maturity.
        </p>
        <p>
          The product is intentionally founder-friendly: quick to try, explicit about risk, and designed to produce useful outputs before you have a full security team.
        </p>
      </div>
    </main>
  );
}
