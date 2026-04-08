"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

import { captureEvent } from "@/lib/analytics";
import { demoFindings, sampleGithubRepos, sampleQuestionnaireExamples, sampleWorkspaceSummary } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SummaryCard } from "@/components/summary-card";

type ScanSummary = {
  totalUsers: number;
  adminUsers: number;
  usersWithoutMFA: number;
  adminUsersWithoutMFA: number;
  totalRepos: number;
  reposAtRisk: number;
};

const initialSummary: ScanSummary = {
  totalUsers: sampleWorkspaceSummary.totalUsers,
  adminUsers: sampleWorkspaceSummary.adminUsers,
  usersWithoutMFA: sampleWorkspaceSummary.usersWithoutMFA,
  adminUsersWithoutMFA: sampleWorkspaceSummary.adminUsersWithoutMFA,
  totalRepos: sampleWorkspaceSummary.totalRepos,
  reposAtRisk: sampleWorkspaceSummary.reposAtRisk
};

type WorkspaceMode = "sample" | "real" | null;

export function DashboardControls({
  clientId,
  initialMode
}: {
  clientId: string | null;
  initialMode?: WorkspaceMode;
}) {
  const [aws, setAws] = useState({ accessKeyId: "", secretAccessKey: "", region: "us-east-1" });
  const [github, setGithub] = useState({ token: "", org: "" });
  const [summary, setSummary] = useState<ScanSummary>(initialSummary);
  const [connected, setConnected] = useState({ aws: false, github: false });
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(initialMode ?? null);
  const [loading, setLoading] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(initialMode === "sample");
  const clientReference = useMemo(() => clientId ?? "", [clientId]);
  const topFindings = demoFindings.slice(0, 3);

  const steps = [
    { label: "Sign up", done: true },
    { label: "Choose workspace", done: !!workspaceMode },
    { label: "Connect GitHub", done: workspaceMode === "sample" || connected.github },
    { label: "Connect AWS", done: workspaceMode === "sample" || connected.aws },
    { label: "Run first scan", done: scanCompleted },
    { label: "View top blockers", done: scanCompleted },
    { label: "Generate answer or plan", done: scanCompleted }
  ];

  async function connectAws() {
    const isConnected = !!aws.accessKeyId && !!aws.secretAccessKey;
    setConnected((current) => ({ ...current, aws: isConnected }));
    if (isConnected) {
      captureEvent("aws_connected", { mode: workspaceMode ?? "unknown" });
    }
  }

  async function connectGithub() {
    const isConnected = !!github.token && !!github.org;
    setConnected((current) => ({ ...current, github: isConnected }));
    if (isConnected) {
      captureEvent("github_connected", { mode: workspaceMode ?? "unknown" });
    }
  }

  function chooseMode(mode: WorkspaceMode) {
    setWorkspaceMode(mode);
    if (mode === "sample") {
      setConnected({ aws: true, github: true });
      setScanCompleted(true);
      captureEvent("sample_workspace_opened", { source: "dashboard" });
    }
  }

  async function runScan() {
    setLoading(true);
    captureEvent("first_scan_started", { mode: workspaceMode ?? "real" });

    if (workspaceMode === "sample") {
      setSummary(initialSummary);
      setScanCompleted(true);
      setLoading(false);
      captureEvent("first_scan_completed", { mode: "sample", blockers_found: demoFindings.length });
      return;
    }

    const results = await Promise.all([
      aws.accessKeyId && aws.secretAccessKey
        ? fetch("/api/scan/aws", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...aws, clientId: clientReference })
          }).then((response) => response.json())
        : Promise.resolve(null),
      github.token && github.org
        ? fetch("/api/scan/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...github, clientId: clientReference })
          }).then((response) => response.json())
        : Promise.resolve(null)
    ]);

    setSummary((current) => ({
      totalUsers: results[0]?.totalUsers ?? current.totalUsers,
      adminUsers: results[0]?.adminUsers ?? current.adminUsers,
      usersWithoutMFA: results[0]?.usersWithoutMFA ?? current.usersWithoutMFA,
      adminUsersWithoutMFA: results[0]?.adminUsersWithoutMFA ?? current.adminUsersWithoutMFA,
      totalRepos: results[1]?.totalRepos ?? current.totalRepos,
      reposAtRisk: results[1]?.reposAtRisk ?? current.reposAtRisk
    }));

    setScanCompleted(true);
    setLoading(false);
    captureEvent("first_scan_completed", {
      mode: "real",
      total_users: results[0]?.totalUsers ?? 0,
      total_repos: results[1]?.totalRepos ?? 0
    });
  }

  return (
    <div className="space-y-8">
      <Card className="grain">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">First-Run Flow</p>
              <CardTitle className="pt-3 text-3xl">See blockers without guessing what to do next.</CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                Choose the sample workspace for a realistic walkthrough or connect your real environment and run your first buyer-readiness scan.
              </CardDescription>
            </div>
            <Badge variant={workspaceMode === "sample" ? "medium" : "neutral"}>
              {workspaceMode === "sample" ? "Sample workspace" : workspaceMode === "real" ? "Real workspace" : "Choose mode"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {workspaceMode === "sample" ? (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Sample workspace story</p>
              <p className="mt-2">
                This demo represents a founder-led B2B SaaS company with an enterprise pilot blocked on buyer security review. Start with the top blocker, open the finding, then generate the questionnaire answer to see the core Talosly workflow.
              </p>
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.label} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-center gap-2 text-sm">
                  {step.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                  <span className="font-medium">Step {index + 1}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseMode("sample")}
              className={`rounded-3xl border p-5 text-left transition ${workspaceMode === "sample" ? "border-primary bg-primary/5" : "border-border bg-white"}`}
            >
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">Sample Workspace</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold">Walk through realistic blockers in under 2 minutes.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Includes AWS admins without MFA, too many admins, missing GitHub approvals, and missing CODEOWNERS.
              </p>
            </button>
            <button
              type="button"
              onClick={() => chooseMode("real")}
              className={`rounded-3xl border p-5 text-left transition ${workspaceMode === "real" ? "border-primary bg-primary/5" : "border-border bg-white"}`}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Real Workspace</div>
              <h3 className="mt-3 text-xl font-semibold">Connect GitHub and AWS to scan your actual environment.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Good for founder-led teams already facing a live buyer review or vendor assessment.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total users" value={summary.totalUsers} />
        <SummaryCard label="Admin count" value={summary.adminUsers} />
        <SummaryCard label="Users without MFA" value={summary.usersWithoutMFA} />
        <SummaryCard label="Repos at risk" value={summary.reposAtRisk} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AWS integration</CardTitle>
            <CardDescription>Connect an IAM-scoped access key to audit users, MFA coverage, and admin exposure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="AWS Access Key ID"
              value={aws.accessKeyId}
              onChange={(event) => setAws((current) => ({ ...current, accessKeyId: event.target.value }))}
              disabled={workspaceMode === "sample"}
            />
            <Input
              placeholder="AWS Secret Access Key"
              type="password"
              value={aws.secretAccessKey}
              onChange={(event) => setAws((current) => ({ ...current, secretAccessKey: event.target.value }))}
              disabled={workspaceMode === "sample"}
            />
            <Input
              placeholder="Region"
              value={aws.region}
              onChange={(event) => setAws((current) => ({ ...current, region: event.target.value }))}
              disabled={workspaceMode === "sample"}
            />
            <Button variant={connected.aws ? "secondary" : "outline"} onClick={connectAws} disabled={workspaceMode === null}>
              {workspaceMode === "sample" ? "Using sample AWS data" : connected.aws ? "Connected" : "Connect AWS"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GitHub integration</CardTitle>
            <CardDescription>Connect a GitHub token with org read access to inspect branch protections and ownership rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="GitHub token"
              type="password"
              value={github.token}
              onChange={(event) => setGithub((current) => ({ ...current, token: event.target.value }))}
              disabled={workspaceMode === "sample"}
            />
            <Input
              placeholder="GitHub organization"
              value={github.org}
              onChange={(event) => setGithub((current) => ({ ...current, org: event.target.value }))}
              disabled={workspaceMode === "sample"}
            />
            <Button variant={connected.github ? "secondary" : "outline"} onClick={connectGithub} disabled={workspaceMode === null}>
              {workspaceMode === "sample" ? "Using sample GitHub data" : connected.github ? "Connected" : "Connect GitHub"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={runScan} disabled={loading || workspaceMode === null}>
          {loading ? "Running Scan..." : "Run Scan"}
        </Button>
        <p className="self-center text-sm text-muted-foreground">
          {workspaceMode === "sample"
            ? "Sample mode uses realistic mock evidence so new visitors can experience the product before connecting credentials."
            : "Running a scan stores evidence artifacts, updates findings, and refreshes summary metrics."}
        </p>
      </div>

      {scanCompleted ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Top blockers after your first scan</CardTitle>
              <CardDescription>These are the findings most likely to trigger buyer follow-up questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topFindings.map((finding) => (
                <Link key={finding.id} href={`/findings/${finding.id}`} className="block rounded-2xl border border-border bg-white p-4 transition hover:border-primary">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{finding.title}</p>
                    <Badge variant={finding.severity as "critical" | "high" | "medium" | "low"}>{finding.severity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{finding.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card className="grain">
            <CardHeader>
              <CardTitle>Magic output: buyer-safe answer draft</CardTitle>
              <CardDescription>Generated from the finding and evidence so the response is honest, concise, and useful.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p className="rounded-2xl border border-border bg-white p-4">
                "We identified a small number of privileged cloud users without MFA and are remediating those accounts first. Administrative access is being reduced and protected with MFA-enforced policies, with rollout tracked as part of our access-control hardening plan."
              </p>
              <div>
                <p className="font-medium text-foreground">Suggested questions to test</p>
                <div className="mt-2 space-y-2">
                  {sampleQuestionnaireExamples.map((question) => (
                    <p key={question}>- {question}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="font-medium text-foreground">Suggested next step</p>
                <p className="mt-2 text-muted-foreground">
                  Open the critical finding first, confirm why the buyer cares, then use the generated answer as the starting point for your security questionnaire response.
                </p>
              </div>
              <Link href="/findings" className="font-semibold text-primary">
                Open findings and generate your own answer
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {workspaceMode === "sample" ? (
        <Card>
          <CardHeader>
            <CardTitle>Sample GitHub walkthrough</CardTitle>
            <CardDescription>See how the product explains change-management risk before a real buyer asks.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-3xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Repo</th>
                  <th className="px-4 py-3 font-medium">Required approvals</th>
                  <th className="px-4 py-3 font-medium">CODEOWNERS</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {sampleGithubRepos.map((repo) => (
                  <tr key={repo.name}>
                    <td className="px-4 py-3">{repo.name}</td>
                    <td className="px-4 py-3">{repo.requiredApprovals}</td>
                    <td className="px-4 py-3">{repo.codeownersExists ? "Present" : "Missing"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={repo.riskLevel as "critical" | "high" | "medium" | "low"}>{repo.riskLevel}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
