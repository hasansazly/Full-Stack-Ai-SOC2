import { ArrowRight, BadgeAlert, CheckCheck, FileText, GitPullRequestArrow, LockKeyhole, ShieldCheck, TimerReset } from "lucide-react";

import { LeadCaptureForm } from "@/components/lead-capture-form";
import { TrackedLinkButton } from "@/components/tracked-link-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const blockers = [
  "Admin users without MFA",
  "Too many standing AWS admins",
  "Main branch without required approvals",
  "Direct pushes to production branches",
  "Missing CODEOWNERS for critical paths",
  "Weak evidence for buyer questionnaires"
];

const workflow = [
  {
    title: "Connect AWS and GitHub",
    description: "Or start with the sample workspace if you want to see the product before granting access."
  },
  {
    title: "Run one scan",
    description: "We collect buyer-relevant evidence, highlight the highest-risk blockers, and rank what matters first."
  },
  {
    title: "Respond and remediate",
    description: "Generate an honest questionnaire answer, a remediation plan, and policy drafts from the same evidence set."
  }
];

const outcomes = [
  {
    title: "Prioritized findings",
    description: "See what will actually stall a security review, not a generic wall of alerts.",
    icon: BadgeAlert
  },
  {
    title: "Evidence-backed answers",
    description: "Generate concise questionnaire responses grounded in the controls you do and do not have.",
    icon: FileText
  },
  {
    title: "Remediation next steps",
    description: "Know what to fix this week versus what can wait until a broader compliance sprint.",
    icon: CheckCheck
  }
];

const faqs = [
  {
    question: "Do I need SOC 2 before using this?",
    answer: "No. ClearAudit is built for the phase before SOC 2, when a real buyer is already asking security questions and you need to know what matters first."
  },
  {
    question: "Can I try it without connecting credentials?",
    answer: "Yes. The sample workspace walks through realistic AWS and GitHub blockers so a founder can understand the product in minutes."
  },
  {
    question: "Will it automatically change my environment?",
    answer: "No. The current MVP is focused on evidence collection, prioritization, and guidance. Remediation should happen with your approval."
  },
  {
    question: "Who is this best for?",
    answer: "Founder-led and lean engineering teams selling B2B SaaS into enterprise buyers, especially when procurement or security review is suddenly on the critical path."
  }
];

export default function LandingPage() {
  return (
    <main>
      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Enterprise Deal Readiness
            </p>
            <h1 className="max-w-4xl font-display text-5xl leading-tight text-foreground md:text-7xl">
              Close enterprise deals faster by fixing the security gaps buyers actually care about.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              ClearAudit helps founders and CTOs spot the AWS and GitHub issues that stall buyer security reviews, then turns those findings into remediation guidance, questionnaire answers, and policy drafts.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <TrackedLinkButton href="/book" event="homepage_cta_primary_clicked" size="lg">
                Book a 20-minute readiness review
                <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedLinkButton>
              <TrackedLinkButton
                href="/dashboard?mode=sample"
                event="homepage_cta_secondary_clicked"
                variant="outline"
                size="lg"
              >
                Run a free AWS + GitHub scan
              </TrackedLinkButton>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> AWS + GitHub evidence</p>
              <p className="flex items-center gap-2"><TimerReset className="h-4 w-4 text-primary" /> Sample mode in minutes</p>
              <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Questionnaire-ready outputs</p>
            </div>
          </div>

          <div className="w-full rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft">
            <div className="space-y-5">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-sm text-secondary-foreground">Sample buyer-readiness scan</p>
                <p className="mt-2 text-3xl font-semibold text-secondary-foreground">5 blockers found</p>
                <p className="mt-2 text-sm text-secondary-foreground/80">
                  2 critical issues are likely to trigger follow-up questions from an enterprise security team.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Privileged AWS users without MFA</p>
                  <p className="mt-1 text-2xl font-semibold">2</p>
                </div>
                <div className="rounded-3xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Repos at risk</p>
                  <p className="mt-1 text-2xl font-semibold">4</p>
                </div>
              </div>
              <div className="rounded-3xl border border-border p-5">
                <p className="text-sm font-medium text-foreground">Questionnaire answer preview</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  "We enforce pull-request based changes for production systems on most repositories. We identified exceptions where peer review and code ownership were not consistently required, and we are standardizing branch protection and CODEOWNERS enforcement across all production repositories this sprint."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Who This Is For</p>
          <h2 className="mt-2 font-display text-4xl">Built for the founder or CTO suddenly carrying the security review.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Your team is selling into enterprise for the first time.",
            "A buyer questionnaire or vendor review is now on the critical path.",
            "You use AWS and GitHub, but do not have a full security team yet."
          ].map((item) => (
            <Card key={item}>
              <CardContent className="p-6 text-sm text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">What Blockers We Find</p>
          <h2 className="mt-2 font-display text-4xl">The controls that actually stall buyer reviews.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {blockers.map((blocker) => (
            <div key={blocker} className="rounded-3xl border border-border bg-white px-5 py-4 text-sm shadow-soft">
              {blocker}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">How It Works</p>
          <h2 className="mt-2 font-display text-4xl">A founder-friendly workflow from blocker to answer.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {workflow.map((step, index) => (
            <Card key={step.title} className="grain">
              <CardHeader>
                <p className="text-sm font-semibold text-primary">Step {index + 1}</p>
                <CardTitle className="pt-2">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{step.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Fix What Matters First</p>
              <CardTitle className="pt-3 text-3xl">Stop reacting to every compliance task with equal urgency.</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              ClearAudit ranks blockers by what is most likely to trigger buyer concern, so founders can fix the highest-leverage issues first instead of drowning in generic security advice.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Generate Questionnaire Answers From Real Evidence</p>
              <CardTitle className="pt-3 text-3xl">Turn findings into buyer-safe answers your team can actually send.</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The flagship output is not just a finding. It is a concise, honest answer draft that explains your current state, acknowledges the gap, and shows a credible remediation roadmap.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">What You Get After A Scan</p>
            <h2 className="mt-2 font-display text-4xl">Outputs your team can use immediately.</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {outcomes.map((feature) => (
            <Card key={feature.title} className="grain">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="pt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why Founders Use This Before SOC 2</p>
              <CardTitle className="pt-3 text-3xl">Because the deal is blocked now.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>SOC 2 may still be coming later. Buyers still want credible answers today.</p>
              <p>ClearAudit helps teams harden the controls most likely to matter in live security reviews before they commit to a broader compliance program.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Trust / Data Access / Permissions</p>
              <CardTitle className="pt-3 text-3xl">Read evidence first. Change nothing without approval.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>ClearAudit focuses on read-oriented evidence collection for AWS IAM and GitHub configuration.</p>
              <p>It identifies what needs to change, but remediation remains explicit and under your control.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">For Early Design Partners</p>
          <h2 className="mt-2 font-display text-4xl">If you have a live deal blocked on security, we want to help.</h2>
          <p className="mt-4 text-muted-foreground">
            We’re looking for a handful of founder-led teams willing to share the real questions buyers are asking so we can make the readiness flow sharper.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <TrackedLinkButton href="/book" event="book_call_clicked" size="lg">
            Book a readiness review
          </TrackedLinkButton>
          <TrackedLinkButton href="/contact" event="signup_started" variant="outline" size="lg">
            Talk to us first
          </TrackedLinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <LeadCaptureForm />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-4xl">Common questions from founder-led teams.</h2>
        </div>
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-xl">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
