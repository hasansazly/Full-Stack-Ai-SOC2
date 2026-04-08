"use client";

import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function LeadCaptureForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [challenge, setChallenge] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    "Best for founders who want to sanity-check buyer blockers before granting access."
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }

    setLoading(true);
    captureEvent("signup_started", {
      source: "lead_capture",
      email_domain: email.split("@")[1] ?? "unknown"
    });

    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        company,
        challenge,
        source: "lead_capture"
      })
    });

    const payload = await response.json();
    setSubmitted(response.ok);
    setMessage(
      response.ok
        ? payload.message
        : payload.error || "Something went wrong. Please email founders@talosly.com."
    );
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[2rem] border border-border bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Not ready to connect credentials?</p>
      <h3 className="mt-3 text-2xl font-semibold">Get the founder checklist and sample blockers instead.</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Leave your work email and we’ll treat this like a design-partner lead. No credential connection required.
      </p>
      <div className="mt-5 grid gap-3">
        <Input
          type="email"
          placeholder="founder@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          placeholder="Company name"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
        <Textarea
          placeholder="What is blocked right now? Example: buyer questionnaire, pilot review, procurement security questions."
          value={challenge}
          onChange={(event) => setChallenge(event.target.value)}
          className="min-h-[96px]"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Get sample findings"}
        </Button>
      </div>
      <p className={`mt-3 text-sm ${submitted ? "text-emerald-700" : "text-muted-foreground"}`}>{message}</p>
    </form>
  );
}
