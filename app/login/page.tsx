import { LoginForm } from "@/components/login-form";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { TrackedLinkButton } from "@/components/tracked-link-button";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_440px] lg:items-start">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Get Started</p>
          <h1 className="mt-4 font-display text-5xl">Create a workspace and see your first blockers fast.</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Start with a sample workspace if you want a guided walkthrough, or sign in and connect GitHub and AWS when you are ready for a real scan.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <TrackedLinkButton href="/dashboard?mode=sample" event="sample_workspace_opened" size="lg">
              Open sample workspace
            </TrackedLinkButton>
            <TrackedLinkButton href="/book" event="book_call_clicked" variant="outline" size="lg">
              Book a readiness review
            </TrackedLinkButton>
          </div>
          <div className="mt-10">
            <LeadCaptureForm />
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
