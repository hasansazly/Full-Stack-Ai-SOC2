import { ArrowRight, Bot, CheckCircle2, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problemPoints = [
  "The real blocker is not the questionnaire. It is the missing control behind the question.",
  "You need to know what you can answer honestly today and what needs fixing before the buyer call.",
  "Every day you spend piecing together evidence manually is a day the deal can slip."
];

const agentSteps = [
  {
    title: "Collect Evidence",
    description: "Connect AWS and GitHub. Talosly pulls the evidence needed for CC6 and CC8 first."
  },
  {
    title: "Analyze Gaps",
    description: "Agents map evidence to SOC 2 Common Criteria and surface the exact blockers."
  },
  {
    title: "Auto-Remediate",
    description: "Talosly generates the exact CLI command, API call, or policy text needed to close common gaps."
  },
  {
    title: "Generate Walkthrough",
    description: "Every fix is documented in an audit-ready trail with evidence, timestamps, and approvals."
  },
  {
    title: "CPA Signs Report",
    description: "Use the collected evidence and remediation trail to accelerate your path to a signed report."
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
  ["Flags compliance gaps", "Yes", "Yes", "Yes", "Yes"],
  ["Auto-remediates cloud and GitHub controls", "Yes", "No", "No", "No"],
  ["Generates exact CLI/API fix", "Yes", "No", "No", "Partial"],
  ["Signs report path in one platform", "Yes", "No", "No", "No"]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.24),transparent_28%),linear-gradient(180deg,#0a0a0a,#0b0b0f)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
              AI-Powered SOC 2
            </p>
            <h1 className="mt-6 font-display text-5xl leading-tight md:text-7xl">
              Close Your Enterprise Deal. SOC 2 in 6 Weeks, Guaranteed.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              The only compliance platform that doesn&apos;t just find your gaps - it fixes them automatically.
            </p>
            <p className="mt-4 max-w-2xl text-base text-slate-400">
              Talosly collects evidence, identifies SOC 2 blockers, generates exact AWS and GitHub fixes, and builds the audit trail required to move fast.
            </p>
            <div className="mt-10">
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
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Waitlist</p>
              <h2 className="mt-2 font-display text-4xl text-white">Join the first Talosly audit cohorts.</h2>
              <p className="mt-3 text-slate-300">If a live enterprise deal is blocked on trust, we want to talk.</p>
            </div>
            <Button className="bg-indigo-500 hover:bg-indigo-400">
              Join via waitlist form
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
