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
    title: "Generate Approved Fixes",
    description: "Generate the exact CLI, API call, or patch for the supported controls you approve."
  },
  {
    title: "Capture Evidence",
    description: "Record approvals, timestamps, and before/after evidence for each remediation step."
  },
  {
    title: "CPA-Ready Report Path",
    description: "Use the resulting evidence trail to accelerate readiness and a signed report process."
  }
];

const pricing = [
  {
    tier: "Free Scan",
    price: "$0",
    label: "Start here",
    description: "For founders who want to see their actual blockers before a buyer call. No commitment.",
    includes: [
      "AWS + GitHub evidence collection",
      "Core gap findings for CC6 and CC8",
      "Questionnaire-ready findings summary",
      "Sample remediation payloads"
    ]
  },
  {
    tier: "Readiness Sprint",
    price: "$2,500",
    label: "Most common",
    description: "For teams with a live deal, an active questionnaire, or a security call on the calendar.",
    includes: [
      "Everything in Free Scan",
      "Full gap analysis across all CC criteria",
      "Exact remediation code for every auto-fixable gap",
      "AI-generated policies (CC1, CC6, CC8)",
      "Questionnaire response drafts",
      "One 60-minute remediation walkthrough call"
    ]
  },
  {
    tier: "Managed Audit Prep",
    price: "$8,000/mo",
    label: "For growing teams",
    description: "For companies turning repeated buyer friction into a durable compliance program.",
    includes: [
      "Everything in Readiness Sprint",
      "Continuous evidence monitoring",
      "Full SOC 2 evidence package",
      "CPA-ready report pathway",
      "Slack access to founder"
    ]
  }
];

const competitorRows = [
  ["Identifies compliance gaps", "Yes", "Yes", "Yes", "Yes"],
  ["Auto-remediates cloud and GitHub controls", "Yes", "No", "No", "No"],
  ["Generates exact CLI/API fix", "Yes", "No", "No", "Partial"],
  ["Provides a CPA-ready signed report path", "Yes", "No", "No", "No"]
];

const trustLinks = [
  { href: "/demo", label: "Demo" },
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
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500">SOC 2 that fixes gaps — not just flags them</span>
            </div>
            <nav className="flex flex-wrap items-center gap-4">
              <Link
                href="/demo"
                className="flex items-center gap-1 text-sm font-medium text-indigo-300 transition hover:text-white"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Demo
              </Link>
              {trustLinks.slice(1).map((item) => (
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
              Talosly connects to your AWS and GitHub, flags the exact controls blocking your enterprise deal, and generates the remediation code to fix them. The only platform that goes from evidence to signed audit trail in one workflow.
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
              <Link
                href="/demo"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-indigo-300 transition hover:text-white"
              >
                See a live demo →
              </Link>
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
              <p className="flex items-center gap-2"><Bot className="h-4 w-4 text-indigo-400" /> Approval-based fixes</p>
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
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <p className="font-medium text-white">Live product proof</p>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <p>Failing controls: `Privileged user without MFA`, `No peer review required`</p>
                  <p>Suggested fix: exact GitHub API request or AWS CLI payload</p>
                  <p>Evidence captured: before state, approval timestamp, after state</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        style={{
          margin: "80px 0",
          padding: "0 24px",
          maxWidth: "860px",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#6366f1",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "40px",
            textAlign: "center"
          }}
        >
          Early design partners
        </p>

        <div
          style={{
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "14px",
            padding: "32px",
            marginBottom: "16px",
            position: "relative"
          }}
        >
          <div
            style={{
              fontSize: "36px",
              color: "#6366f1",
              lineHeight: 1,
              marginBottom: "16px",
              opacity: 0.6
            }}
          >
            "
          </div>
          <p
            style={{
              fontSize: "17px",
              color: "#ffffff",
              lineHeight: 1.7,
              marginBottom: "24px",
              fontStyle: "italic",
              maxWidth: "640px"
            }}
          >
            We had a $180k deal stalled for three weeks on a vendor security questionnaire. Talosly identified the two actual blockers in 20 minutes — branch protection and a missing MFA policy — and generated the exact fixes. We answered the questionnaire that afternoon.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#1a1a2d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6366f1"
              }}
            >
              SC
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#ffffff",
                  margin: 0
                }}
              >
                S.C., CTO
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#555",
                  margin: 0
                }}
              >
                B2B SaaS startup — $180k deal unblocked
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            padding: "28px",
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            borderRadius: "10px",
            marginBottom: "16px",
            flexWrap: "wrap"
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#333",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginRight: "8px"
            }}
          >
            Design partners
          </span>
          {[
            "Stealth SaaS A",
            "Stealth SaaS B",
            "Stealth SaaS C"
          ].map((name) => (
            <span
              key={name}
              style={{
                fontSize: "13px",
                color: "#444",
                fontWeight: 500,
                padding: "4px 14px",
                border: "1px solid #1a1a1a",
                borderRadius: "6px"
              }}
            >
              {name}
            </span>
          ))}
        </div>

        <div
          style={{
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "10px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px"
          }}
        >
          <span
            style={{
              fontSize: "20px",
              flexShrink: 0,
              marginTop: "2px"
            }}
          >
            📋
          </span>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#ffffff",
                marginBottom: "4px"
              }}
            >
              Deal unblocked in 72 hours
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: 1.6,
                margin: 0
              }}
            >
              Enterprise buyer required branch protection evidence and a privileged access report. Talosly collected the evidence, flagged 4 gaps, generated remediation payloads for 3 of them, and produced a questionnaire-ready summary in one session.
            </p>
          </div>
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
          <h2 className="mt-2 font-display text-4xl">From blocked deal to buyer-ready evidence.</h2>
          <p className="mt-3 text-sm text-slate-400">
            A narrow workflow: collect evidence, identify blockers, generate the fix, and document every approved step.
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
                  <td className="px-4 py-4 text-slate-300">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">{tier.label}</p>
                    <p className="mt-2">{tier.description}</p>
                    <ul className="mt-3 space-y-2 text-xs text-slate-400">
                      {tier.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedLinkButton href="/demo" event="homepage_cta_secondary_clicked">
            Try free scan
          </TrackedLinkButton>
          <TrackedLinkButton href="/book" event="book_call_clicked" variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">
            Book a sprint
          </TrackedLinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader>
              <CardTitle className="text-white">Trust and permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>AWS and GitHub connections are used to collect evidence and prepare deterministic fixes for a narrow set of supported control gaps.</p>
              <p>No remediation runs without explicit approval, and unsupported controls remain manual.</p>
              <p>Every approval, payload, and evidence snapshot is recorded with timestamps so the audit trail is defensible.</p>
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
            <div className="mx-auto max-w-[600px] text-center">
              <p className="mb-4 text-[15px] leading-7 text-[#666]">
                Vanta, Drata, and Comp.ai can tell you there is a problem. Talosly generates the exact fix and captures the evidence trail around it.
              </p>
              <p className="text-sm leading-7 text-[#444]">
                Adding auto-remediation to a monitoring dashboard requires taking liability for live customer infrastructure changes — something a late-stage, compliance-certified company will not ship. Talosly is built from day one with the human-in-the-loop approval model and tamper-evident evidence spine that makes this defensible. That is not a feature gap. That is a structural difference.
              </p>
            </div>
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
