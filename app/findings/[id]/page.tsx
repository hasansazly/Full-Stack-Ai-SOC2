import { notFound } from "next/navigation";

import { FindingActions } from "@/components/finding-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFindingById } from "@/lib/data";

export default async function FindingDetailPage({ params }: { params: { id: string } }) {
  const finding = await getFindingById(params.id);

  if (!finding) {
    notFound();
  }

  const remediationSteps = finding.remediation_steps as Array<{ step: number; action: string; detail: string }>;
  const cliSuggestion =
    finding.control_area.includes("CC6")
      ? "AWS CLI suggestion: aws iam list-users && aws iam list-mfa-devices --user-name <user>"
      : "GitHub CLI suggestion: gh api repos/<org>/<repo>/branches/main/protection";

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={finding.severity as "critical" | "high" | "medium" | "low"}>{finding.severity}</Badge>
          <span className="text-sm text-muted-foreground">{finding.control_area}</span>
        </div>
        <h1 className="font-display text-5xl">{finding.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>What is wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{finding.description}</p>
            <div>
              <h2 className="font-semibold">Why it matters</h2>
              <p className="mt-2 text-sm text-muted-foreground">{finding.business_risk}</p>
            </div>
            <div>
              <h2 className="font-semibold">Exact remediation steps</h2>
              <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
                {remediationSteps.map((step) => (
                  <li key={`${finding.id}-${step.step}`}>
                    <span className="font-medium text-foreground">{step.action}</span>: {step.detail}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">CLI / console suggestion</p>
              <p className="mt-2 font-mono text-xs">{cliSuggestion}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistance</CardTitle>
          </CardHeader>
          <CardContent>
            <FindingActions findingId={finding.id ?? ""} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
