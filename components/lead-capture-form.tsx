"use client";

import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LeadCaptureForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }

    captureEvent("signup_started", {
      source: "lead_capture",
      email_domain: email.split("@")[1] ?? "unknown"
    });
    setSubmitted(true);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[2rem] border border-border bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Not ready to connect credentials?</p>
      <h3 className="mt-3 text-2xl font-semibold">Get the founder checklist and sample blockers instead.</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Leave your work email and we’ll treat this like a design-partner lead. No credential connection required.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          placeholder="founder@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit">Get sample findings</Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {submitted
          ? "Lead captured locally for this MVP. Wire this form to your CRM or Supabase table next."
          : "Best for founders who want to sanity-check buyer blockers before granting access."}
      </p>
    </form>
  );
}
