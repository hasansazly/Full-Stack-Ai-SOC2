import Link from "next/link";

import { TrackedLinkButton } from "@/components/tracked-link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Free Scan",
    price: "$0",
    label: "Start here",
    description: "For founders who want to see their actual blockers before a buyer call. No commitment.",
    bullets: [
      "AWS + GitHub evidence collection",
      "Core gap findings for CC6 and CC8",
      "Questionnaire-ready findings summary",
      "Sample remediation payloads"
    ],
    cta: "Run free scan",
    href: "/demo"
  },
  {
    name: "Readiness Sprint",
    price: "$2,500",
    label: "Most common",
    description: "For teams with a live deal, an active questionnaire, or a security call on the calendar.",
    bullets: [
      "Everything in Free Scan",
      "Full gap analysis across all CC criteria",
      "Exact remediation code for every auto-fixable gap",
      "AI-generated policies (CC1, CC6, CC8)",
      "Questionnaire response drafts",
      "One 60-minute remediation walkthrough call"
    ],
    cta: "Book a sprint",
    href: "/book"
  },
  {
    name: "Managed Audit Prep",
    price: "$8,000/mo",
    label: "For growing teams",
    description: "For companies turning repeated buyer friction into a durable compliance program.",
    bullets: [
      "Everything in Readiness Sprint",
      "Continuous evidence monitoring",
      "Full SOC 2 evidence package",
      "CPA-ready report pathway",
      "Slack access to founder"
    ],
    cta: "Talk to us",
    href: "/book"
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
              <p className="text-sm font-medium text-primary">{tier.label}</p>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {tier.bullets.map((bullet) => (
                <p key={bullet}>- {bullet}</p>
              ))}
              <div className="pt-2">
                <TrackedLinkButton href={tier.href} event={tier.href === "/demo" ? "homepage_cta_secondary_clicked" : "book_call_clicked"} size="sm">
                  {tier.cta}
                </TrackedLinkButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <TrackedLinkButton href="/demo" event="homepage_cta_secondary_clicked" size="lg">
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
