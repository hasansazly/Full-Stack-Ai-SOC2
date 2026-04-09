const founderSection = (
  <section
    style={{
      marginTop: "64px",
      paddingTop: "48px",
      borderTop: "1px solid #1a1a1a"
    }}
  >
    <p
      style={{
        fontSize: "11px",
        fontWeight: 500,
        color: "#6366f1",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "32px"
      }}
    >
      The founder
    </p>

    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "24px",
        flexWrap: "wrap"
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "#1a1a2d",
          border: "1px solid #2a2a3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: 500,
          color: "#6366f1",
          flexShrink: 0
        }}
      >
        AS
      </div>

      <div style={{ flex: 1, minWidth: "240px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
            flexWrap: "wrap"
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#ffffff",
              margin: 0
            }}
          >
            Abu Hasan Sazly Sarkar
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "#888"
            }}
          >
            Founder, Talosly
          </span>
          <a
            href="https://www.linkedin.com/in/abu-hasan-sazly-sarkar-b245a424b/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              color: "#6366f1",
              textDecoration: "none",
              border: "1px solid #2a2a3d",
              padding: "2px 10px",
              borderRadius: "20px"
            }}
          >
            LinkedIn →
          </a>
          <a
            href="mailto:founders@talosly.com"
            style={{
              fontSize: "12px",
              color: "#555",
              textDecoration: "none"
            }}
          >
            founders@talosly.com
          </a>
        </div>

        <p
          style={{
            fontSize: "15px",
            color: "#aaa",
            lineHeight: 1.7,
            marginBottom: "16px",
            maxWidth: "560px"
          }}
        >
          Abu Hasan Sazly Sarkar is the founder of Talosly, building the trust layer for startups selling into enterprise. He started the company to solve a simple problem: too many great products lose deals because security reviews are slow, manual, and broken. He studies Computer Science at Temple University and is focused on making trust fast, verifiable, and software-driven.
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap"
          }}
        >
          {[
            "Computer Science",
            "B2B SaaS",
            "Trust infrastructure"
          ].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "20px",
                background: "#141414",
                color: "#555",
                border: "1px solid #2a2a2a"
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">About</p>
        <h1 className="mt-2 font-display text-5xl">A product for the week an enterprise deal gets real.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Talosly exists for founders and CTOs who suddenly realize that their next big customer is not blocked by product value, but by a security questionnaire they are not ready to answer.
        </p>
      </div>
      <div className="space-y-5 text-muted-foreground">
        <p>
          Most early-stage teams do not need heavyweight compliance theater. They need a fast, credible way to identify the cloud and engineering gaps buyers will ask about, fix the highest-risk issues first, and respond with evidence instead of hand-waving.
        </p>
        <p>
          Talosly focuses on the operational controls that commonly stall B2B SaaS deals: privileged access, MFA coverage, branch protections, review discipline, ownership, and policy maturity.
        </p>
        <p>
          The product is intentionally founder-friendly: quick to try, explicit about risk, and designed to produce useful outputs before you have a full security team.
        </p>
      </div>

      <section
        style={{
          marginTop: "48px",
          paddingTop: "48px",
          borderTop: "1px solid #1a1a1a"
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#6366f1",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "16px"
          }}
        >
          Market
        </p>
        <p
          style={{
            fontSize: "17px",
            color: "#aaa",
            lineHeight: 1.8,
            maxWidth: "600px"
          }}
        >
          Over 160,000 B2B SaaS companies will face an enterprise security review this year. The compliance software market is worth $5.6B and growing 13% annually. Vanta proved the category at a $1.6B valuation. Talosly is building the remediation and evidence layer they cannot ship without taking liability for customer infrastructure — the one thing a late-stage company will not do.
        </p>
      </section>

      <section
        style={{
          marginTop: "48px",
          paddingTop: "48px",
          borderTop: "1px solid #1a1a1a"
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#6366f1",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "16px"
          }}
        >
          Why now
        </p>
        <p
          style={{
            fontSize: "17px",
            color: "#aaa",
            lineHeight: 1.8,
            maxWidth: "600px"
          }}
        >
          SOC 2 has crossed from "nice to have" to mandatory for any B2B SaaS deal above $50k. The EU AI Act and ISO 42001 are creating a second compliance wave for every company building or deploying AI — which is now every software company. And for the first time, LLMs make it possible to generate exact remediation payloads from raw evidence automatically. The infrastructure to automate trust is available today. The company that owns the standard wins the market.
        </p>
      </section>

      {founderSection}
    </main>
  );
}
