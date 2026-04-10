'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

const tiers = [
  {
    name: "Free Scan",
    price: "$0",
    badge: "Start here",
    description: "For founders who want to see their actual blockers before a buyer call.",
    features: [
      "AWS + GitHub evidence collection",
      "CC6 and CC8 gap findings",
      "Exact remediation code for each gap",
      "Questionnaire-ready findings summary"
    ],
    cta: "Run free scan",
    href: "/demo",
    featured: false
  },
  {
    name: "Readiness Sprint",
    price: "$2,500",
    badge: "Most popular",
    description: "For teams with a live deal, active questionnaire, or security call on the calendar.",
    features: [
      "Everything in Free Scan",
      "Full gap analysis across all 9 CC criteria",
      "AI-generated policies for CC1, CC6, CC8",
      "Questionnaire response drafts",
      "One 60-min remediation walkthrough call",
      "Slack access to founder during sprint"
    ],
    cta: "Book a sprint",
    href: "/book",
    featured: true
  },
  {
    name: "Audit Prep",
    price: "$8,000/mo",
    badge: "For growing teams",
    description: "For companies turning repeated buyer friction into a durable compliance program.",
    features: [
      "Everything in Readiness Sprint",
      "Continuous evidence monitoring",
      "Full SOC 2 evidence package",
      "CPA-ready report pathway",
      "Monthly compliance review call"
    ],
    cta: "Talk to us",
    href: "/book",
    featured: false
  }
];

const revenueRows = [
  ["Engineering time", "400 hrs @ $150/hr = $60k", "~20 hours"],
  ["Deal slippage (4-6 mo)", "$66k-$100k lost", "6-8 weeks"],
  ["Outside legal/compliance", "$15k-$25k", "Included"],
  ["Audit firm (standalone)", "$40k-$80k", "Included"],
  ["Total hidden cost", "$181k-$265k", "—"],
  ["Our fee", "—", "$2,500"],
  ["Net savings", "—", "$178k-$262k"]
];

const faqItems = [
  {
    question: "Do you store my AWS or GitHub credentials?",
    answer: "Never. Credentials are used in the request and immediately discarded. We store only the evidence artifacts — the data we collected, not the keys used to collect it."
  },
  {
    question: "Can Talosly make changes to my AWS account without my approval?",
    answer: "No. Every remediation requires explicit approval from you. We generate the command. You review it. You approve it. Nothing runs without your confirmation."
  },
  {
    question: "What if we already have Vanta?",
    answer: "Vanta tells you there is a problem. Talosly fixes it. They are complementary. Most teams use Vanta for monitoring and Talosly for the specific gaps blocking a live deal."
  },
  {
    question: "How long does a readiness sprint take?",
    answer: "Most sprints complete in 5-7 days. The free scan takes 60 seconds. The remediation walkthrough call is 60 minutes. The rest is async."
  }
];

export default function PricingPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--bg)]"
    >
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--indigo)]">Pricing</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-6xl">
            Start free. Pay when it works.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            See your real gaps before you commit to anything.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-[var(--radius-lg)] border bg-[var(--bg-card)] p-6 ${
                tier.featured
                  ? "scale-[1.02] border-[var(--indigo)] shadow-[0_0_0_1px_var(--indigo),0_0_40px_rgba(99,102,241,0.08)]"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xl font-semibold text-[var(--text-primary)]">{tier.name}</p>
                <span className="rounded-full border border-[var(--border-bright)] bg-[var(--indigo-dim)] px-3 py-1 text-xs text-[var(--indigo)]">
                  {tier.badge}
                </span>
              </div>
              <p className="mt-5 text-4xl font-semibold text-[var(--text-primary)]">{tier.price}</p>
              <p className="mt-4 min-h-[72px] text-sm leading-7 text-[var(--text-secondary)]">{tier.description}</p>
              <div className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <Check className="mt-0.5 h-4 w-4 text-[var(--green)]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                href={tier.href}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-[var(--radius)] px-4 py-3 text-sm font-medium transition ${
                  tier.featured
                    ? "bg-[var(--indigo)] text-white hover:bg-[var(--indigo-hover)]"
                    : "border border-[var(--border-bright)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)]">The math is simple.</h2>
          <div className="mt-8 overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-4 font-medium"> </th>
                  <th className="px-4 py-4 font-medium">Doing it alone</th>
                  <th className="bg-[var(--indigo-dim)] px-4 py-4 font-medium text-[var(--indigo)]">With Talosly</th>
                </tr>
              </thead>
              <tbody>
                {revenueRows.map((row, index) => (
                  <tr
                    key={row[0]}
                    className={`border-t border-[var(--border)] ${index === revenueRows.length - 1 ? "font-semibold text-[var(--green)]" : "text-[var(--text-secondary)]"}`}
                  >
                    <td className="px-4 py-4 text-[var(--text-primary)]">{row[0]}</td>
                    <td className="px-4 py-4">{row[1]}</td>
                    <td className="px-4 py-4">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-3xl font-semibold text-[var(--text-primary)]">FAQ</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => {
            const open = openQuestion === item.question;

            return (
              <div key={item.question} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)]">
                <button
                  onClick={() => setOpenQuestion(open ? null : item.question)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{item.question}</span>
                  <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? <p className="px-5 pb-5 text-sm leading-7 text-[var(--text-secondary)]">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </section>
    </motion.main>
  );
}
