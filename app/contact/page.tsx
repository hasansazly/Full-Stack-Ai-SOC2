import Link from "next/link";

import { LeadCaptureForm } from "@/components/lead-capture-form";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Contact</p>
        <h1 className="mt-2 font-display text-5xl">Talk through your next buyer security review.</h1>
        <p className="mt-4 text-muted-foreground">
          If an enterprise deal is blocked on a questionnaire, remediation plan, or readiness story, this is the fastest way to start the conversation.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Best next steps</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p>Book a readiness review if a live deal is already waiting on security answers.</p>
            <p>Try sample mode if you want to understand the workflow before connecting credentials.</p>
            <p>Send notes about your stack, buyer requests, or current blockers to <a href="mailto:founders@talosly.com" className="text-primary">founders@talosly.com</a>.</p>
          </div>
          <div className="mt-6">
            <Link href="/book" className="font-semibold text-primary">
              Go to booking page
            </Link>
          </div>
        </div>
        <LeadCaptureForm />
      </div>
    </main>
  );
}
