import { AgentDashboard } from "@/components/agent-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoDashboardArtifacts, demoDashboardGaps, demoRemediationLog } from "@/lib/agent-demo-data";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { mode?: string };
}) {
  const mode = searchParams?.mode === "sample" ? "Sample Workspace" : "Client Workspace";

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">{mode}</p>
          <h1 className="mt-2 font-display text-5xl">Trust Mission Control</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Talosly agents have collected evidence, analyzed gaps against Trust Services Criteria, and prepared auto-remediation cards where the fix can be safely proposed for approval.
          </p>
        </div>
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">CPA-Signed Audit Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>Talosly does not stop at evidence collection. The platform is designed to carry a startup from raw controls to remediated evidence and an auditor-ready walkthrough.</p>
            <p>The sample dashboard below shows the exact shape of that operating model: controls, evidence, gap analysis, remediation approvals, and execution history in one place.</p>
          </CardContent>
        </Card>
        <AgentDashboard
          gaps={[...demoDashboardGaps]}
          artifacts={[...demoDashboardArtifacts]}
          remediationLog={[...demoRemediationLog]}
        />
      </div>
    </main>
  );
}
