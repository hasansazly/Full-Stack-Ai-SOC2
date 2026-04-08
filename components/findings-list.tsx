"use client";

import Link from "next/link";
import { useState } from "react";

import { sampleFindingOwners } from "@/lib/demo-data";
import type { FindingRecord } from "@/lib/gapEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FindingsList({ findings }: { findings: FindingRecord[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {findings.map((finding) => {
        const isOpen = openId === finding.id;
        const meta =
          sampleFindingOwners[(finding.id as keyof typeof sampleFindingOwners) ?? "demo-finding-1"] ?? null;
        return (
          <Card key={finding.id ?? finding.title} className="overflow-hidden">
            <button
              type="button"
              className="grid w-full gap-3 px-6 py-5 text-left md:grid-cols-[1.2fr_110px_1.4fr_110px_150px]"
              onClick={() => setOpenId(isOpen ? null : finding.id ?? finding.title)}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Control Area</p>
                <p className="font-medium">{finding.control_area}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Severity</p>
                <Badge variant={finding.severity as "critical" | "high" | "medium" | "low"} className="mt-2 w-fit">
                  {finding.severity}
                </Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Title</p>
                <p className="font-medium">{finding.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                <p className="mt-2 text-sm font-medium capitalize">{finding.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Owner</p>
                <p className="mt-2 text-sm font-medium">{meta?.owner ?? "Unassigned"}</p>
              </div>
            </button>
            {isOpen ? (
              <CardContent className="border-t border-border bg-muted/40">
                <div className="space-y-5">
                  {meta ? (
                    <div className="grid gap-4 rounded-2xl border border-border bg-white p-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Owner</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{meta.owner}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Execution status</p>
                        <p className="mt-2 text-sm font-medium capitalize text-foreground">{meta.status}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Target date</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{meta.dueDate}</p>
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-semibold">What is wrong</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{finding.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Why it matters</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{finding.business_risk}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Remediation steps</h3>
                    <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                      {(finding.remediation_steps as Array<{ step: number; action: string; detail: string }>).map((step) => (
                        <li key={`${finding.id}-${step.step}`}>
                          <span className="font-medium text-foreground">{step.action}</span>: {step.detail}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/findings/${finding.id}`}>Open detail</Link>
                    </Button>
                    <QuestionnaireAnswerButton findingId={finding.id ?? ""} />
                  </div>
                </div>
              </CardContent>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

function QuestionnaireAnswerButton({ findingId }: { findingId: string }) {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    const response = await fetch("/api/generate/questionnaire-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        findingId,
        question: "Describe how your company addresses this control gap and what remediation is underway."
      })
    });
    const payload = await response.json();
    setAnswer(
      `Current State\n${payload.currentState}\n\nGap Identified\n${payload.gapIdentified}\n\nRemediation Roadmap\n${payload.remediationRoadmap}\n\nTimeline Estimate\n${payload.timelineEstimate}`
    );
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={generate} disabled={loading || !findingId}>
        {loading ? "Generating..." : "Generate Questionnaire Answer"}
      </Button>
      {answer ? <pre className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm text-muted-foreground">{answer}</pre> : null}
    </div>
  );
}
