import Link from "next/link";

import { TrackedLinkButton } from "@/components/tracked-link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Free Scan",
    price: "$0",
    bestFor: "Best for founders validating whether a live deal is blocked on buyer security review.",
    description: "Best for founders who want to see likely enterprise blockers before a real buyer review.",
    bullets: ["Sample workspace", "AWS + GitHub scan", "Core findings and evidence view", "Questionnaire answer preview"]
  },
  {
    name: "Readiness Sprint",
    price: "$1.5k-$4k",
    bestFor: "Best for teams with an active buyer, questionnaire, or security call on the calendar.",
    description: "A short engagement to identify gaps, prioritize fixes, and prep for a live buyer security review.",
    bullets: ["Hands-on readiness review", "Top blocker remediation plan", "Policy and questionnaire support", "Founder-friendly implementation guidance"]
  },
  {
    name: "Managed Remediation / Audit Prep",
    price: "Custom",
    bestFor: "Best for companies turning repeated buyer friction into a durable trust program.",
    description: "For teams that need sustained help getting from blocked deal to audit-ready operating baseline.",
    bullets: ["Managed follow-through on findings", "Security review response support", "Change-management and access-control hardening", "Prep for SOC 2 and procurement follow-ups"]
  }
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Pricing</p>
        <h1 className="mt-2 font-display text-5xl">Start free, then pay for momentum.</h1>
        <p className="mt-4 text-muted-foreground">
          Talosly is designed for teams that need to unblock revenue now, not six months from now.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className="grain">
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="mt-3 text-4xl font-semibold">{tier.price}</p>
              <p className="text-sm font-medium text-foreground">{tier.bestFor}</p>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {tier.bullets.map((bullet) => (
                <p key={bullet}>- {bullet}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <TrackedLinkButton href="/dashboard?mode=sample" event="homepage_cta_secondary_clicked" size="lg">
          Try the free scan
        </TrackedLinkButton>
        <TrackedLinkButton href="/book" event="book_call_clicked" variant="outline" size="lg">
          Talk through your deal blockers
        </TrackedLinkButton>
      </div>
      <p className="text-sm text-muted-foreground">
        Need procurement-friendly paperwork first? Start on the <Link href="/trust" className="text-primary">trust page</Link>.
      </p>
    </main>
  );
}
