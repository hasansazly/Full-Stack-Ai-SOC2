'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Search,
  Shield,
  Wrench
} from "lucide-react";

import { ScanTerminal } from "@/components/scan-terminal";

const heroLines = [
  { text: "$ talosly scan --aws --github acme-corp", tone: "green" as const },
  { text: "Connecting to AWS IAM...", tone: "muted" as const },
  { text: "Connecting to GitHub org: acme-corp...", tone: "muted" as const },
  { text: "Collecting evidence artifacts...", tone: "muted" as const },
  { text: "⚠  CC6: 3 IAM users without MFA", tone: "yellow" as const },
  { text: "✗  CC6: Root account MFA not enabled", tone: "red" as const },
  { text: "✗  CC8: No branch protection on main", tone: "red" as const },
  { text: "⚠  CC6: AdministratorAccess on dev.bot", tone: "yellow" as const },
  { text: "✓  Remediation code generated for 3/4 gaps", tone: "green" as const },
  { text: "Evidence artifacts: 9 collected", tone: "white" as const },
  { text: "Audit trail: timestamped + SHA-256 hashed", tone: "white" as const },
  { text: "→ Run `talosly fix --approve` to remediate", tone: "indigo" as const }
];

const stats = [
  { value: "$200k+", label: "Avg enterprise deal size at risk" },
  { value: "60 sec", label: "Time to first gap finding" },
  { value: "CC6 + CC8", label: "Controls that block most deals" },
  { value: "0", label: "Lines of config required" }
];

const questionnaire = [
  { question: "Are you SOC 2 Type II certified?", status: "Not yet", tone: "var(--red)" },
  { question: "Describe your penetration testing cadence.", status: "Partly", tone: "var(--yellow)" },
  { question: "Do you conduct background checks on all employees with access to customer data?", status: "Partly", tone: "var(--yellow)" }
];

const steps = [
  { number: "01", icon: Shield, title: "Connect", description: "Read-only AWS IAM and GitHub credentials. Never stored." },
  { number: "02", icon: Search, title: "Collect", description: "9 evidence artifacts across CC6 and CC8. Hashed and timestamped." },
  { number: "03", icon: AlertTriangle, title: "Analyze", description: "AI maps evidence to SOC 2 criteria. Flags exact violations." },
  { number: "04", icon: Wrench, title: "Remediate", description: "Generates CLI commands and API calls. You approve each one." },
  { number: "05", icon: FileCheck, title: "Prove", description: "Every approval is logged as audit evidence with SHA-256 hash." }
];

const comparisonRows = [
  ["Finds compliance gaps", "✓", "✓", "✓", "✓"],
  ["Auto-remediates AWS + GitHub", "✓", "—", "—", "—"],
  ["Generates exact CLI/API fix", "✓", "—", "—", "partial"],
  ["Evidence hashed + timestamped", "✓", "—", "—", "—"],
  ["Human approval before any change", "✓", "—", "—", "—"],
  ["CPA-ready audit trail", "✓", "—", "—", "—"]
];

const marketStats = [
  { value: "$5.6B", label: "Compliance software market size" },
  { value: "13%", label: "Annual market growth rate" },
  { value: "$1.6B", label: "Vanta's valuation — proof the category works" }
];

export default function HomePage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--bg)]"
    >
      <section className="relative overflow-hidden px-6 pb-20 pt-[120px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_42%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f130] bg-[var(--indigo-dim)] px-3 py-1 text-xs text-[var(--indigo)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--indigo)]" />
              SOC 2 Auto-Remediation
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-4xl text-center">
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[56px]">
              Close your enterprise deal.
              <br />
              <span className="text-[var(--indigo)]">SOC 2 gaps fixed, not flagged.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[540px] text-lg leading-8 text-[var(--text-secondary)]">
              Talosly connects to your AWS and GitHub, finds the exact controls blocking your enterprise deal, and generates the remediation code to fix them. Evidence collected. Fixes approved. Audit trail built.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-[8px] bg-white px-6 py-3 text-[15px] font-medium text-black transition hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
              >
                See it live — no signup
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center rounded-[8px] border border-[var(--border-bright)] px-6 py-3 text-[15px] text-[var(--text-secondary)] transition hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Book a 20-min call
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
              <span>Free scan</span>
              <span>·</span>
              <span>No card required</span>
              <span>·</span>
              <span>Results in 60 seconds</span>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-[680px]">
            <ScanTerminal lines={heroLines} />
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--bg-card)] py-8">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-4 md:divide-x md:divide-[var(--border)]">
          {stats.map((item) => (
            <div key={item.label} className="px-0 text-center md:px-12">
              <p className="text-[32px] font-semibold text-[var(--text-primary)]">{item.value}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--indigo)]">The problem</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)]">
            The questionnaire that&apos;s killing your deal.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
            You are one signature away from the largest contract in company history. Their security team just sent 340 questions. The CISO call is in 9 days.
          </p>
          <p className="mt-8 max-w-xl text-[15px] leading-8 text-[var(--text-secondary)]">
            Talosly tells you exactly which questions you can answer honestly, which gaps you need to fix first, and generates the evidence trail to back it up.
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <p className="text-sm font-medium text-[var(--text-primary)]">Live buyer questionnaire</p>
          <div className="mt-5 space-y-4">
            {questionnaire.map((item) => (
              <div key={item.question} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.question}</p>
                <div className="mt-3 flex items-center justify-between gap-4 text-xs">
                  <span className="uppercase tracking-[0.18em] text-[var(--text-muted)]">How to answer</span>
                  <span className="rounded-full px-3 py-1" style={{ background: `${item.tone}20`, color: item.tone }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--indigo)]">How it works</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)]">
            From evidence to remediation in one session.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--indigo)]">{step.number}</p>
                  <Icon className="mt-6 h-5 w-5 text-[var(--indigo)]" />
                  <p className="mt-4 text-[15px] font-medium text-[var(--text-primary)]">{step.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{step.description}</p>
                </div>
                {index < steps.length - 1 ? (
                  <div className="absolute left-[calc(100%-10px)] top-1/2 hidden h-px w-5 bg-[var(--border-bright)] md:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--indigo)]">Competitive comparison</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)]">One platform. Not a dashboard.</h2>
          <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
            Vanta and Drata can tell you there is a problem. Talosly generates the exact fix. Adding auto-remediation to a monitoring dashboard requires taking liability for live customer infrastructure — something a late-stage, compliance-certified company will not ship. That is the structural difference.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--bg-subtle)] text-left text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-4 font-medium">Capability</th>
                <th className="border-l border-[var(--indigo)] px-4 py-4 font-medium text-[var(--text-primary)]">Talosly</th>
                <th className="px-4 py-4 font-medium">Vanta</th>
                <th className="px-4 py-4 font-medium">Drata</th>
                <th className="px-4 py-4 font-medium">Comp.ai</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]} className="border-t border-[var(--border)]">
                  <td className="px-4 py-4 text-[var(--text-primary)]">{row[0]}</td>
                  {row.slice(1).map((value, index) => (
                    <td
                      key={`${row[0]}-${value}-${index}`}
                      className={`px-4 py-4 ${index === 0 ? "border-l border-[var(--indigo)]" : ""}`}
                    >
                      <span
                        className={
                          value === "✓"
                            ? "text-[var(--green)]"
                            : value === "partial"
                              ? "text-[var(--orange)]"
                              : "text-[var(--text-muted)]"
                        }
                      >
                        {value}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--bg-card)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {marketStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-[640px] text-center text-[17px] leading-8 text-[var(--text-secondary)]">
            SOC 2 has crossed from nice-to-have to mandatory for any B2B SaaS deal above $50k. The EU AI Act and ISO 42001 are creating a second compliance wave for every company building or deploying AI. And for the first time, LLMs make automated remediation possible. The infrastructure to automate trust is available today. The company that owns the standard wins the market.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[20px] border border-[#6366f120] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_65%)] px-8 py-20 text-center">
          <h2 className="text-4xl font-semibold text-[var(--text-primary)]">Bring us the blocked deal.</h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            We&apos;ll identify the exact gaps and generate the fixes in one session.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-[8px] bg-white px-6 py-3 text-sm font-medium text-black transition hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
            >
              See live demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center rounded-[8px] border border-[var(--border-bright)] px-6 py-3 text-sm text-[var(--text-secondary)] transition hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Book a 20-min call
            </Link>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
