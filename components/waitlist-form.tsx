"use client";

import Link from "next/link";
import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WAITLIST_URL = "https://tally.so/r/PdYMqB";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [dealAtRisk, setDealAtRisk] = useState(true);
  const [message, setMessage] = useState("Join the waitlist for early access to Talosly.");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    captureEvent("signup_started", { source: "waitlist_hero" });
    setMessage("Opening the Talosly waitlist form...");
    window.open(WAITLIST_URL, "_blank", "noopener,noreferrer");
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
        <Button type="submit" className="bg-indigo-500 hover:bg-indigo-400">
          Join Waitlist
        </Button>
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" checked={dealAtRisk} onChange={() => setDealAtRisk((value) => !value)} />
        A live enterprise deal is already at risk.
      </label>
      <p className="text-sm text-slate-300">
        {message} Prefer to skip the fields and go straight there?{" "}
        <Link href={WAITLIST_URL} target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">
          Open the Tally form
        </Link>
        .
      </p>
    </form>
  );
}
