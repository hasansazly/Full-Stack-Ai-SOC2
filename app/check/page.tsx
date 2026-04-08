"use client";

import { FormEvent, useState } from "react";

type CheckResult = {
  id: string;
  control: string;
  name: string;
  status: "pass" | "fail";
  findings: string[];
};

type CheckResponse = {
  checks: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
};

function StatusBadge({ status }: { status: "pass" | "fail" }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        status === "pass"
          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border border-red-500/20 bg-red-500/10 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}

export default function CheckPage() {
  const [results, setResults] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      awsAccessKeyId: String(formData.get("awsAccessKeyId") || ""),
      awsSecretAccessKey: String(formData.get("awsSecretAccessKey") || ""),
      githubToken: String(formData.get("githubToken") || ""),
      githubOrg: String(formData.get("githubOrg") || ""),
    };

    form.reset();

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as CheckResponse & { error?: string };

      if (!response.ok) {
        setError(data.error || "Unable to run compliance check.");
        return;
      }

      setResults(data);
    } catch {
      setError("Unable to run compliance check.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">Quick Check</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-white">Run a 4-check compliance probe</h1>
          <p className="mt-3 text-sm text-[#888888]">
            Test logical access and change-management controls across AWS and GitHub without storing credentials.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          Credentials are used once and never stored.
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label htmlFor="awsAccessKeyId" className="text-sm text-[#cfcfcf]">
              AWS Access Key ID
            </label>
            <input
              id="awsAccessKeyId"
              name="awsAccessKeyId"
              type="text"
              required
              autoComplete="off"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6366f1]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="awsSecretAccessKey" className="text-sm text-[#cfcfcf]">
              AWS Secret Access Key
            </label>
            <input
              id="awsSecretAccessKey"
              name="awsSecretAccessKey"
              type="password"
              required
              autoComplete="off"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6366f1]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="githubToken" className="text-sm text-[#cfcfcf]">
              GitHub Personal Access Token
            </label>
            <input
              id="githubToken"
              name="githubToken"
              type="password"
              required
              autoComplete="off"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6366f1]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="githubOrg" className="text-sm text-[#cfcfcf]">
              GitHub Org Name
            </label>
            <input
              id="githubOrg"
              name="githubOrg"
              type="text"
              required
              autoComplete="off"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#6366f1]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-[#6366f1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5558e6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Running checks..." : "Run Compliance Check"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        ) : null}

        {results ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3 text-sm text-[#cfcfcf]">
                Total checks: <span className="font-semibold text-white">{results.summary.total}</span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                Passed: <span className="font-semibold">{results.summary.passed}</span>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Failed: <span className="font-semibold">{results.summary.failed}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]">
              <table className="min-w-full divide-y divide-[#2a2a2a] text-sm">
                <thead className="bg-[#111111] text-left text-[#888888]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Check Name</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {results.checks.map((check, index) => (
                    <tr key={check.id} className={index % 2 === 0 ? "bg-[#141414]" : "bg-[#161616]"}>
                      <td className="px-4 py-4 text-white">
                        <div className="font-medium">{check.name}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#888888]">{check.control}</div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={check.status} />
                      </td>
                      <td className="px-4 py-4 text-[#cfcfcf]">
                        {check.findings.length > 0 ? (
                          <ul className="space-y-1">
                            {check.findings.map((finding) => (
                              <li key={finding}>{finding}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-emerald-400">No issues found.</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
