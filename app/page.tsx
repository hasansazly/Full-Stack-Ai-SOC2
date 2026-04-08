import { ArrowRight, Bot, CheckCheck, FileText, ShieldCheck, TimerReset, TriangleAlert } from "lucide-react";

import { WaitlistForm } from "@/components/waitlist-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const problemCards = [
  {
    title: "The blocker is real, not paperwork theater",
    body: "Your buyer is asking whether privileged access is protected, whether production changes are reviewed, and whether your controls actually exist."
  },
  {
    title: "You need language you can say honestly",
    body: "If the answer is 'not yet,' Talosly tells you exactly what is missing, what can be remediated now, and what compensating control language is defensible."
  },
  {
    title: "Every day costs you the deal",
    body: "A $200k contract can disappear while your team is still trying to figure out AWS IAM, GitHub branch protection, and policy evidence."
  }
];

const howItWorks = [
  "Collect Evidence",
  "Analyze Gaps",
  "Auto-Remediate",
  "Generate Walkthrough",
  "CPA Signs Report"
];

const pricing = [
  {
    tier: "Tier 1",
    name: "Readiness SaaS",
    price: "$500/mo",
    includes: "Dashboard, gap reports, policy templates"
  },
  {
    tier: "Tier 2",
    name: "Managed Compliance",
    price: "$5,000/mo",
    includes: "Auto-Remediator, agent monitoring, evidence workflows"
  },
  {
    tier: "Tier 3",
    name: "Guaranteed Audit",
    price: "$30,000 flat",
    includes: "Full agentic audit, remediation execution, CPA-signed SOC 2"
  }
];

const comparison = [
  ["Finds gaps", "Yes", "Yes", "Yes", "Yes"],
  ["Auto-remediates AWS + GitHub controls", "Yes", "No", "No", "No"],
  ["Generates exact CLI / API fixes", "Yes", "No", "No", "Partial"],
  ["Produces audit walkthrough and signed report path", "Yes", "No", "No", "No"]
];

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(79,70,229,0.15),transparent_25%),linear-gradient(180deg,#09090b,#0a0a0a)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
              Agentic SOC 2 Platform
            </p>
            <h1 className="max-w-4xl font-display text-5xl leading-tight text-foreground md:text-7xl">
              Close Your Enterprise Deal. SOC 2 in 6 Weeks, Guaranteed.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              The only compliance platform that doesn't just find your gaps - it fixes them automatically.
            </p>
            <p className="mt-4 max-w-2xl text-base font-medium text-slate-100">
              Talosly agents collect evidence, analyze Trust Services Criteria gaps, generate exact AWS CLI and GitHub API fixes, and move you toward a CPA-signed SOC 2 report in one system.
            </p>
            <div className="mt-10">
              <WaitlistForm />
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-400" /> Evidence collected automatically</p>
              <p className="flex items-center gap-2"><Bot className="h-4 w-4 text-indigo-400" /> Agents generate exact fixes</p>
              <p className="flex items-center gap-2"><TimerReset className="h-4 w-4 text-indigo-400" /> 6-week audit path</p>
            </div>
          </div>

          <div className="mt-12 lg:mt-0">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-5">
                <p className="text-sm text-indigo-200">Enterprise deal at risk</p>
                <p className="mt-2 text-3xl font-semibold text-white">$200k ARR blocked</p>
                <p className="mt-2 text-sm text-indigo-100/80">
                  Buyer security review requires proof of CC6.1, CC6.2, and CC8.1 controls before procurement will sign.
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Critical gaps found</p>
                  <p className="mt-1 text-2xl font-semibold text-white">5</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Auto-remediable</p>
                  <p className="mt-1 text-2xl font-semibold text-white">2</p>
                </div>
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Agent remediation preview</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/40 p-4 text-xs text-slate-300">
aws iam create-policy --policy-name RequireMFA --policy-document file://require-mfa-policy.json
aws iam attach-group-policy --group-name Admins --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA
                </pre>
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Questionnaire draft generated</p>
                <p className="mt-3 text-sm text-slate-300">
                  We identified privileged cloud accounts without MFA and default-branch controls that were not consistently enforced. These gaps are now being remediated through MFA enforcement and branch protection policies, with evidence collection and validation tracked in Talosly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 text-sm text-slate-400">
          <span>Backed by design partners with live enterprise deals on the line</span>
          <span>Founder-led B2B SaaS</span>
          <span>Security questionnaire bottlenecks</span>
          <span>Audit path in weeks, not quarters</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">The Problem</p>
          <h2 className="mt-2 font-display text-4xl text-white">Your $200k deal is being held hostage by a security questionnaire.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {problemCards.map((card) => (
            <Card key={card.title} className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{card.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">How It Works</p>
          <h2 className="mt-2 font-display text-4xl text-white">Five agents from raw evidence to signed report.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          {howItWorks.map((step, index) => (
            <Card key={step} className="border-white/10 bg-white/5">
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Step {index + 1}</p>
                <CardTitle className="text-white">{step}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Pricing</p>
          <h2 className="mt-2 font-display text-4xl text-white">Pick the level of automation you need.</h2>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Tier</th>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Price</th>
                <th className="px-4 py-4 font-medium">What's Included</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/20">
              {pricing.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-4 text-slate-300">{row.tier}</td>
                  <td className="px-4 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-4 text-slate-300">{row.price}</td>
                  <td className="px-4 py-4 text-slate-300">{row.includes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 lg:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-300">
              <TriangleAlert className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Revenue Math</span>
            </div>
            <CardTitle className="text-white">A $25k audit fee is not your real cost.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p>The visible line item is the audit. The hidden cost is founder distraction, engineering interruptions, delayed procurement, and a slowed sales cycle.</p>
            <p><span className="font-semibold text-white">$25k fee</span> vs <span className="font-semibold text-white">$160k hidden cost</span> if your team spends months collecting evidence manually and remediating reactively.</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCheck className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Why Talosly</span>
            </div>
            <CardTitle className="text-white">Competitors flag gaps. Talosly closes them.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p>Vanta and Drata can tell you a branch is unprotected. Talosly generates the exact GitHub API call to fix it, stores the evidence, and keeps the audit trail.</p>
            <p>This is not another compliance dashboard. It is an agentic operating layer for trust readiness.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Competitive Comparison</p>
          <h2 className="mt-2 font-display text-4xl text-white">Talosly vs Vanta vs Drata vs Comp.ai</h2>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Capability</th>
                <th className="px-4 py-4 font-medium">Talosly</th>
                <th className="px-4 py-4 font-medium">Vanta</th>
                <th className="px-4 py-4 font-medium">Drata</th>
                <th className="px-4 py-4 font-medium">Comp.ai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/20">
              {comparison.map((row) => (
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
        <Card className="border-white/10 bg-gradient-to-r from-indigo-500/20 to-white/5">
          <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Waitlist</p>
              <h2 className="mt-2 font-display text-4xl text-white">Be first to hand the security questionnaire to an agent.</h2>
              <p className="mt-3 text-slate-300">Join the waitlist for early access to the agentic audit workflow.</p>
            </div>
            <Button className="bg-indigo-500 hover:bg-indigo-400">
              <ArrowRight className="mr-2 h-4 w-4" />
              Join Waitlist Above
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
