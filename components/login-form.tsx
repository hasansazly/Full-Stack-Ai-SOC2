"use client";

import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Use Supabase magic links if env vars are configured, or continue exploring the demo app.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setMessage("Supabase env vars are not configured yet. Add them to enable authentication.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined
      }
    });

    setMessage(error ? error.message : "Check your email for the magic link.");
  }

  return (
    <form className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Work email</label>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
      </div>
      <Button type="submit" className="w-full">
        Send magic link
      </Button>
      <p className="text-sm text-muted-foreground">{message}</p>
    </form>
  );
}
