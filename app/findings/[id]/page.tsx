import { notFound } from "next/navigation";

import { ExportPacketButton } from "@/components/export-packet-button";
import { FindingActions } from "@/components/finding-actions";
import { FindingViewTracker } from "@/components/finding-view-tracker";
import { QuestionnaireAnswerPreview } from "@/components/questionnaire-answer-preview";
import { RemediationDetail } from "@/components/remediation-detail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFindingById, getRemediationLogsForFinding } from "@/lib/data";
import { sampleFindingOwners } from "@/lib/demo-data";
import { buildDefaultTimeline, getRemediationForFindingRecord } from "@/lib/remediations/registry";
import { generateQuestionnaireAnswer } from "@/lib/questionnaire";

export default async function FindingDetailPage({ params }: { params: { id: string } }) {
  const finding = await getFindingById(params.id);

  if (!finding) {
    notFound();
  }

  const remediationSteps = finding.remediation_steps as Array<{ step: number; action: string; detail: string }>;
  const remediation = getRemediationForFindingRecord(finding);
  const remediationTimeline = await getRemediationLogsForFinding(finding.id ?? "");
  const cliSuggestion =
    finding.control_area.includes("CC6")
      ? "AWS CLI suggestion: aws iam list-users && aws iam list-mfa-devices --user-name <user>"
      : "GitHub CLI suggestion: gh api repos/<org>/<repo>/branches/main/protection";
  const answer = generateQuestionnaireAnswer(
    finding,
    finding.control_area.includes("CC8")
      ? "Do you enforce peer review before production deployment?"
      : "Do you require multi-factor authentication for privileged cloud access?"
  );
  const initialAnswer = `Current State\n${answer.currentState}\n\nGap Identified\n${answer.gapIdentified}\n\nRemediation Roadmap\n${answer.remediationRoadmap}\n\nTimeline Estimate\n${answer.timelineEstimate}`;
  const findingMeta =
    sampleFindingOwners[(finding.id as keyof typeof sampleFindingOwners) ?? "demo-finding-1"] ?? {
      owner: "Security lead",
      status: "planned",
      dueDate: "2026-04-15",
      compensatingControl: "Manual review and restricted access are being used temporarily while the formal control is implemented."
    };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <FindingViewTracker findingId={finding.id ?? finding.title} title={finding.title} severity={finding.severity} />
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
              <h2 className="font-semibold">Why a buyer or security team cares</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Buyers are looking for evidence that access and change controls are both designed and consistently enforced. This finding signals a control weakness they are likely to ask follow-up questions about.
              </p>
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
            <QuestionnaireAnswerPreview answer={answer} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">Owner and status</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Owner</p>
                  <p className="mt-1 text-muted-foreground">{findingMeta.owner}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                  <p className="mt-1 capitalize text-muted-foreground">{findingMeta.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Target date</p>
                  <p className="mt-1 text-muted-foreground">{findingMeta.dueDate}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Compensating control language</p>
              <p className="mt-2">{findingMeta.compensatingControl}</p>
            </div>
            <RemediationDetail
              findingId={finding.id ?? ""}
              remediation={remediation}
              initialTimeline={remediationTimeline.length > 0 ? remediationTimeline : buildDefaultTimeline()}
            />
            <FindingActions findingId={finding.id ?? ""} initialAnswer={initialAnswer} />
            <ExportPacketButton label="Export packet with this finding" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
