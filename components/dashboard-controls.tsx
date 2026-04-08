"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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
  totalUsers: 8,
  adminUsers: 3,
  usersWithoutMFA: 4,
  adminUsersWithoutMFA: 2,
  totalRepos: 5,
  reposAtRisk: 3
};

export function DashboardControls({ clientId }: { clientId: string | null }) {
  const [aws, setAws] = useState({ accessKeyId: "", secretAccessKey: "", region: "us-east-1" });
  const [github, setGithub] = useState({ token: "", org: "" });
  const [summary, setSummary] = useState<ScanSummary>(initialSummary);
  const [connected, setConnected] = useState({ aws: false, github: false });
  const [loading, setLoading] = useState(false);
  const clientReference = useMemo(() => clientId ?? "", [clientId]);

  async function connectAws() {
    setConnected((current) => ({ ...current, aws: !!aws.accessKeyId && !!aws.secretAccessKey }));
  }

  async function connectGithub() {
    setConnected((current) => ({ ...current, github: !!github.token && !!github.org }));
  }

  async function runScan() {
    setLoading(true);

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

    setLoading(false);
  }

  return (
    <div className="space-y-8">
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
            />
            <Input
              placeholder="AWS Secret Access Key"
              type="password"
              value={aws.secretAccessKey}
              onChange={(event) => setAws((current) => ({ ...current, secretAccessKey: event.target.value }))}
            />
            <Input
              placeholder="Region"
              value={aws.region}
              onChange={(event) => setAws((current) => ({ ...current, region: event.target.value }))}
            />
            <Button variant={connected.aws ? "secondary" : "outline"} onClick={connectAws}>
              {connected.aws ? "Connected" : "Connect AWS"}
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
            />
            <Input
              placeholder="GitHub organization"
              value={github.org}
              onChange={(event) => setGithub((current) => ({ ...current, org: event.target.value }))}
            />
            <Button variant={connected.github ? "secondary" : "outline"} onClick={connectGithub}>
              {connected.github ? "Connected" : "Connect GitHub"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={runScan} disabled={loading}>
          {loading ? "Running Scan..." : "Run Scan"}
        </Button>
        <p className="self-center text-sm text-muted-foreground">
          Running a scan stores evidence artifacts, updates findings, and refreshes summary metrics.
        </p>
      </div>
    </div>
  );
}
