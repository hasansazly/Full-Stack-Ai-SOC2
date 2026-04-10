'use client'

import { motion } from "framer-motion";

const philosophy = [
  {
    title: "We build for the moment, not the audit.",
    body: "Most compliance tools optimize for passing audits. We optimize for closing deals. The fastest path to SOC 2 is fixing the 3 controls your next buyer will actually ask about — not the 200 controls on a comprehensive checklist."
  },
  {
    title: "Evidence first, policies second.",
    body: "Every policy we generate is based on your actual infrastructure state. We collect the evidence, identify the gaps, and generate policies that reflect what you are actually doing — not aspirational documents that don't match reality."
  },
  {
    title: "Human approval before any change.",
    body: "Talosly is opinionated about one thing: nothing changes in your environment without your explicit approval. Every remediation is reviewed, approved, and logged. The approval itself becomes audit evidence."
  }
];

const whyNow = [
  {
    title: "SOC 2 became table stakes",
    body: "Every enterprise procurement team now requires SOC 2 or equivalent. The question is no longer whether to get compliant but how fast."
  },
  {
    title: "LLMs made remediation automatable",
    body: "For the first time, it is possible to go from raw AWS IAM evidence to a specific, correct CLI command automatically. This was not possible two years ago."
  },
  {
    title: "The EU AI Act changes everything",
    body: "Every company building or deploying AI now faces a second compliance layer. ISO 42001 is the SOC 2 of the AI era. We are positioned to own both."
  }
];

const marketStats = [
  { value: "$5.6B", label: "Compliance software market" },
  { value: "160,000+", label: "B2B SaaS companies facing enterprise security reviews this year" },
  { value: "$1.6B", label: "Vanta's valuation — proof the category works" }
];

export default function AboutPage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--bg)]"
    >
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--indigo)]">About Talosly</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-6xl">
            Built for the week an enterprise deal gets real.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            Talosly exists because security questionnaires kill deals that should close. We are fixing that.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex h-fit items-center gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 lg:flex-col lg:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--indigo)] to-[#3f41a8] text-2xl font-semibold text-white">
            [FOUNDER_INITIALS]
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">[FOUNDER_FULL_NAME]</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Founder &amp; CEO, Talosly</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a
                href="[FOUNDER_LINKEDIN_URL]"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--border-bright)] px-4 py-1.5 text-[var(--indigo)] transition hover:border-[var(--indigo)]"
              >
                LinkedIn
              </a>
              <a href="mailto:founders@talosly.com" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                founders@talosly.com
              </a>
            </div>
          </div>
        </div>

        <div>
          <p className="max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
            Previously [FOUNDER_BIO_SENTENCE_1] I experienced this pain firsthand when [FOUNDER_BIO_SENTENCE_2] I am building Talosly because [FOUNDER_BIO_SENTENCE_3]
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["[BACKGROUND_TAG_1]", "[BACKGROUND_TAG_2]", "[BACKGROUND_TAG_3]"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-12 space-y-6">
            {philosophy.map((item) => (
              <div key={item.title} className="border-l border-[var(--indigo)] pl-5">
                <p className="text-lg font-medium text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-2 max-w-3xl text-[15px] leading-8 text-[var(--text-secondary)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--bg-card)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)]">The market</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {marketStats.map((stat) => (
              <div key={stat.label} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-6">
                <p className="text-4xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-[17px] leading-8 text-[var(--text-secondary)]">
            SOC 2 has crossed from nice-to-have to mandatory for any B2B deal above $50k. The EU AI Act and ISO 42001 are creating a second compliance wave for AI companies. Vanta proved the category. We are building the remediation and evidence layer they cannot ship without taking liability for customer infrastructure — the one thing a late-stage company will not do.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-[var(--text-primary)]">Why now</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {whyNow.map((item) => (
            <div key={item.title} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <p className="text-lg font-medium text-[var(--text-primary)]">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.main>
  );
}
