import { ArrowRight, Bot, CheckCircle2, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { TrackedLinkButton } from "@/components/tracked-link-button";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problemPoints = [
  "The blocker is usually a real control gap, not the paperwork itself.",
  "You need to know what you can answer honestly now and what needs to be fixed before the buyer call.",
  "Every day spent gathering evidence manually increases the odds that the deal slips."
];

const agentSteps = [
  {
    title: "Collect Evidence",
    description: "Connect AWS and GitHub. Talosly pulls the highest-signal evidence first."
  },
  {
    title: "Analyze Gaps",
    description: "Map evidence to SOC 2 criteria and identify the controls that will stall the deal."
  },
  {
    title: "Auto-Remediate",
    description: "Generate the exact CLI, API call, or patch needed to close common gaps."
  },
  {
    title: "Generate Walkthrough",
    description: "Document each fix with timestamps, approvals, and before/after evidence."
  },
  {
    title: "CPA Signs Report",
    description: "Use the evidence trail to accelerate audit readiness and a signed report path."
  }
];

const pricing = [
  {
    tier: "Readiness SaaS",
    price: "$500/mo",
    includes: "Dashboard, gap reports, policy templates"
  },
  {
    tier: "Managed Compliance",
    price: "$5,000/mo",
    includes: "Auto-Remediator + agent monitoring"
  },
  {
    tier: "Guaranteed Audit",
    price: "$30,000 flat",
    includes: "Full agentic audit + CPA-signed SOC 2"
  }
];

const competitorRows = [
  ["Identifies compliance gaps", "Yes", "Yes", "Yes", "Yes"],
  ["Auto-remediates cloud and GitHub controls", "Yes", "No", "No", "No"],
  ["Generates exact CLI/API fix", "Yes", "No", "No", "Partial"],
  ["Signs report path in one platform", "Yes", "No", "No", "No"]
];

const socialProofStats = [
  {
    label: "Blocked deal focus",
    value: "$200k+",
    detail: "Typical enterprise deal size where security review friction starts to matter."
  },
  {
    label: "First control wedge",
    value: "CC6 + CC8",
    detail: "Logical access and change management controls buyers ask about first."
  },
  {
    label: "Proof model",
    value: "Evidence + fixes",
    detail: "Findings tied to exact remediation payloads and an approval-based audit trail."
  }
];

const partnerLogos = ["Design Partner A", "Design Partner B", "Founder-Led SaaS", "Enterprise Pilot Team"];

const trustLinks = [
  { href: "/trust", label: "Trust" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.24),transparent_28%),linear-gradient(180deg,#0a0a0a,#0b0b0f)]">
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
                Talosly
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Trust readiness for blocked enterprise deals</span>
            </div>
            <nav className="flex flex-wrap items-center gap-4">
              {trustLinks.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
              AI-Powered SOC 2
            </p>
            <h1 className="mt-6 font-display text-5xl leading-tight md:text-7xl">
              Close Your Enterprise Deal. SOC 2 in 6 Weeks, Guaranteed.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Talosly finds the security controls blocking enterprise deals, generates the exact fixes, and gives you an audit-ready trail to move faster.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-slate-400">
              For startups selling into enterprise on AWS and GitHub.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <TrackedLinkButton href="/book" event="book_call_clicked" size="lg" className="bg-indigo-500 hover:bg-indigo-400">
                Book a readiness review
              </TrackedLinkButton>
              <TrackedLinkButton
                href="mailto:founders@talosly.com?subject=Blocked%20Deal%20Review"
                event="book_call_clicked"
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
              >
                Talk to us about a blocked deal
              </TrackedLinkButton>
            </div>
            <div className="mt-5 max-w-2xl rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
              “Guaranteed” means Talosly commits to a six-week readiness plan when the client completes onboarding, grants required evidence access, and executes approved remediation work on schedule.
            </div>
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Not ready to talk yet?</p>
              <WaitlistForm />
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-400" /> AWS + GitHub evidence collection</p>
              <p className="flex items-center gap-2"><Bot className="h-4 w-4 text-indigo-400" /> AI-generated remediation</p>
              <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-400" /> Audit-ready evidence trail</p>
            </div>
          </div>

          <Card className="border-white/10 bg-[#141414]">
            <CardHeader>
              <CardTitle className="text-white">One platform. Not a dashboard.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="font-medium text-white">$200k enterprise deal at risk</p>
                <p className="mt-2 text-slate-300">
                  Procurement is blocked until your team can show logical access evidence, branch protections, and audit-ready policies.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">Agent output</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 font-mono text-xs text-slate-200">
aws iam create-policy --policy-name RequireMFA --policy-document file://require-mfa-policy.json
gh api repos/ORG/REPO/branches/main/protection --method PUT --input branch-protection.json
                </pre>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">Questionnaire-ready answer</p>
                <p className="mt-2 text-slate-300">
                  We identified gaps in privileged access enforcement and branch protection controls. Talosly generated remediation workflows, captured the evidence trail, and queued the approvals needed to bring those controls into compliance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-[#141414]">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              {socialProofStats.map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-medium text-white">{item.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader>
              <CardTitle className="text-white">Design partner placeholder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>
                “Talosly helped us separate real control gaps from questionnaire noise and gave us a concrete remediation path for the buyer.”
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Founder / CTO, early-stage B2B SaaS</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {partnerLogos.map((logo) => (
                  <span
                    key={logo}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">The Problem</p>
          <h2 className="mt-2 font-display text-4xl">Your $200k deal is being held hostage by a security questionnaire.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {problemPoints.map((point, index) => (
            <Card key={point} className="border-white/10 bg-[#141414]">
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-300">
                  {index === 0 ? <TriangleAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">Problem {index + 1}</span>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{point}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">How It Works</p>
          <h2 className="mt-2 font-display text-4xl">Five agents from raw evidence to signed report.</h2>
          <p className="mt-3 text-sm text-slate-400">
            A narrow, buyer-focused workflow: collect evidence, identify blockers, generate the fix, and document every step.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          {agentSteps.map((step, index) => (
            <Card key={step.title} className="border-white/10 bg-[#141414]">
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Step {index + 1}</p>
                <CardTitle className="text-white">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{step.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Pricing</p>
            <h2 className="mt-2 font-display text-4xl">Choose your path to compliant revenue.</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-400">
              The guaranteed audit tier assumes a completed onboarding, timely evidence collection, and execution of approved remediation work within the shared plan.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#2a2a2a]">
          <table className="min-w-full divide-y divide-[#2a2a2a] text-sm">
            <thead className="bg-[#141414] text-left text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Tier</th>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Price</th>
                <th className="px-4 py-4 font-medium">What&apos;s Included</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] bg-[#101010]">
              {pricing.map((tier, index) => (
                <tr key={tier.tier}>
                  <td className="px-4 py-4 text-slate-300">{index + 1}</td>
                  <td className="px-4 py-4 font-medium text-white">{tier.tier}</td>
                  <td className="px-4 py-4 text-slate-300">{tier.price}</td>
                  <td className="px-4 py-4 text-slate-300">{tier.includes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader>
              <CardTitle className="text-white">Trust and permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>AWS and GitHub connections are used to collect evidence and prepare deterministic fixes for known control gaps.</p>
              <p>No remediation runs without explicit approval.</p>
              <p>Every approval, payload, and evidence snapshot is recorded with timestamps for audit trail integrity.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                {trustLinks.map((item) => (
                  <Button key={item.href} asChild variant="outline" size="sm" className="border-white/10 bg-transparent text-white hover:bg-white/5">
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader>
              <CardTitle className="text-white">Why teams switch before SOC 2</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Most teams do not lose enterprise deals because they lack a dashboard. They lose because they cannot show the exact control, the exact fix, and the exact evidence a buyer asked for.</p>
              <p>Talosly is designed for that moment: real blocker, real payload, real audit trail.</p>
              <div className="pt-2">
                <TrackedLinkButton href="/book" event="book_call_clicked" variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">
                  Book a readiness review
                </TrackedLinkButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-2">
        <Card className="border-white/10 bg-[#141414]">
          <CardHeader>
            <CardTitle className="text-white">Revenue Math</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>The audit fee is visible. The hidden cost of doing it alone is not.</p>
            <p><span className="font-semibold text-white">$25k fee</span> vs <span className="font-semibold text-white">$160k hidden cost</span> from lost engineering time, deal delay, and manual remediation.</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#141414]">
          <CardHeader>
            <CardTitle className="text-white">Competitor Reality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>Vanta, Drata, and Comp.ai can tell you there is a problem. Talosly generates the exact fix and captures the evidence trail around it.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Competitive Comparison</p>
          <h2 className="mt-2 font-display text-4xl">Talosly vs Vanta vs Drata vs Comp.ai</h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#2a2a2a]">
          <table className="min-w-full divide-y divide-[#2a2a2a] text-sm">
            <thead className="bg-[#141414] text-left text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Capability</th>
                <th className="px-4 py-4 font-medium">Talosly</th>
                <th className="px-4 py-4 font-medium">Vanta</th>
                <th className="px-4 py-4 font-medium">Drata</th>
                <th className="px-4 py-4 font-medium">Comp.ai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] bg-[#101010]">
              {competitorRows.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-4 text-white">{row[0]}</td>
                  <td className="px-4 py-4 text-slate-300">{row[1]}</td>
                  <td className="px-4 py-4 text-slate-300">{row[2]}</td>
                  <td className="px-4 py-4 text-slate-300">{row[3]}</td>
                  <td className="px-4 py-4 text-slate-300">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Card className="border-indigo-500/30 bg-indigo-500/10">
          <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Ready to move?</p>
              <h2 className="mt-2 font-display text-4xl text-white">Bring us the blocked deal, the buyer question, or the trust gap.</h2>
              <p className="mt-3 text-slate-300">Talk to Talosly now, or join the waitlist if the timing is not right yet.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <TrackedLinkButton href="/book" event="book_call_clicked" className="bg-indigo-500 hover:bg-indigo-400">
                Book a readiness review
              </TrackedLinkButton>
              <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/5">
                <Link href="https://tally.so/r/PdYMqB" target="_blank" rel="noreferrer">
                  Join waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
