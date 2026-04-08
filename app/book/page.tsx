import { TrackedLinkButton } from "@/components/tracked-link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookPage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "mailto:founders@talosly.com?subject=Readiness%20Review";

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Readiness Review</p>
        <h1 className="mt-2 font-display text-5xl">Book a 20-minute readiness review.</h1>
        <p className="mt-4 text-muted-foreground">
          Bring the questionnaire, the blocked deal, or the customer ask. We’ll map the fastest path from “not ready” to “credible answer.”
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>What we cover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>- The specific controls your buyer is likely stuck on</p>
            <p>- Whether AWS and GitHub evidence can answer the question directly</p>
            <p>- Which gaps are genuine blockers versus paperwork noise</p>
            <p>- What to remediate now versus what can wait until SOC 2</p>
          </CardContent>
        </Card>
        <Card className="grain">
          <CardHeader>
            <CardTitle>Book now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your real booking URL through `NEXT_PUBLIC_BOOKING_URL`, or use the email fallback to schedule directly.
            </p>
            <TrackedLinkButton
              href={bookingUrl}
              event="book_call_clicked"
              size="lg"
              className="w-full"
            >
              Book now
            </TrackedLinkButton>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
