"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user?.id) {
        const { error: insertError } = await supabase.from("clients").insert({
          user_id: data.user.id,
          company_name: companyName
        });

        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6">
      <div className="w-full max-w-[400px] rounded-xl border border-[#2a2a2a] bg-[#141414] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-white">Talosly</h1>
          <p className="mt-2 text-sm text-[#888888]">SOC 2 compliance, automated.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Work Email" />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full bg-[#6366f1] text-white hover:bg-[#5558e6]" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-[#888888]">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:text-[#6366f1]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
