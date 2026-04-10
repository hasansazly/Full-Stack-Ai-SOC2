'use client'

import { motion } from "framer-motion";
import Link from "next/link";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;
const checklist = [
  "The specific controls your buyer is asking about",
  "Whether AWS and GitHub evidence answers them",
  "Which gaps are deal-killers vs paperwork noise",
  "What to fix now vs what can wait"
];

export default function BookPage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl px-6 py-16"
    >
      <Link href="/" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
        ← Back to Talosly
      </Link>

      <div className="mt-8 rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--indigo)]">Readiness review</p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">Book a 20-minute readiness review</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
          Bring the questionnaire, the blocked deal, or the customer ask. We will map the fastest path from not ready to credible answer.
        </p>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)] p-6">
          <p className="text-sm font-medium text-[var(--text-primary)]">What we cover</p>
          <div className="mt-5 space-y-3">
            {checklist.map((item) => (
              <div key={item} className="flex items-start gap-3 border-t border-[var(--border)] pt-3 first:border-t-0 first:pt-0">
                <span className="mt-0.5 text-[var(--indigo)]">✓</span>
                <span className="text-sm leading-7 text-[var(--text-secondary)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {BOOKING_URL ? (
          <div className="mt-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
            <iframe
              src={`${BOOKING_URL}?embed_domain=talosly.com&embed_type=Inline&hide_landing_page_details=1&hide_gdpr_banner=1`}
              width="100%"
              height="700px"
              frameBorder="0"
              title="Book a readiness review"
            />
          </div>
        ) : (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)] p-8 text-center">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Book a 20-minute readiness review</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              We will review the buyer questions, identify which controls are real blockers, and tell you what Talosly can fix now versus what can wait.
            </p>
            <a
              href="mailto:founders@talosly.com?subject=Readiness Review Request"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-[#e0e0e0]"
            >
              Email founders@talosly.com
            </a>
            <p className="mt-4 text-sm text-[var(--text-muted)]">We respond within 4 hours on weekdays</p>
          </div>
        )}
      </div>
    </motion.main>
  );
}
