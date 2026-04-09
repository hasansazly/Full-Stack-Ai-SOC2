'use client'

import Link from 'next/link'

const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  'mailto:hello@talosly.com?subject=Readiness Review Request'

export default function BookPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '13px',
            color: '#888',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          ← Back to Talosly
        </Link>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#6366f1',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Readiness Review
        </p>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: '12px',
          }}
        >
          Book a 20-minute readiness review.
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#888',
            lineHeight: 1.7,
            marginBottom: '36px',
          }}
        >
          Bring the questionnaire, the blocked deal, or the customer ask. We will map the fastest
          path from &quot;not ready&quot; to &quot;credible answer.&quot;
        </p>

        <div
          style={{
            background: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '28px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#ffffff',
              marginBottom: '16px',
            }}
          >
            What we cover
          </p>
          {[
            'The specific controls your buyer is likely stuck on',
            'Whether AWS and GitHub evidence can answer the question directly',
            'Which gaps are genuine blockers versus paperwork noise',
            'What to remediate now versus what can wait until SOC 2',
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 0',
                borderTop: i === 0 ? 'none' : '1px solid #2a2a2a',
              }}
            >
              <span
                style={{
                  color: '#6366f1',
                  fontSize: '14px',
                  marginTop: '1px',
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#aaa',
                  lineHeight: 1.5,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            background: '#6366f1',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 500,
            textAlign: 'center',
            textDecoration: 'none',
            borderRadius: '10px',
            marginBottom: '12px',
            transition: 'background 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#5558e3')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#6366f1')}
        >
          Book now
        </a>

        <p
          style={{
            fontSize: '12px',
            color: '#555',
            textAlign: 'center',
          }}
        >
          20 minutes. No sales pitch. Just the gaps that matter.
        </p>
      </div>
    </main>
  )
}
