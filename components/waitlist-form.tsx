"use client";

import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [dealAtRisk, setDealAtRisk] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Join the waitlist for early access to Talosly.");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setLoading(true);
    captureEvent("signup_started", { source: "waitlist_hero" });

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, company, dealAtRisk })
    });
    const payload = await response.json();
    setMessage(response.ok ? payload.message : payload.error || "Unable to join waitlist.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
        <Input
          type="email"
          placeholder="founder@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
        />
        <Input
          placeholder="Company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="border-white/10 bg-white/5 text-white placeholder:text-slate-400"
        />
        <Button type="submit" className="bg-indigo-500 hover:bg-indigo-400" disabled={loading}>
          {loading ? "Joining..." : "Join Waitlist"}
        </Button>
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" checked={dealAtRisk} onChange={() => setDealAtRisk((value) => !value)} />
        A live enterprise deal is already at risk.
      </label>
      <p className="text-sm text-slate-300">{message}</p>
    </form>
  );
}
