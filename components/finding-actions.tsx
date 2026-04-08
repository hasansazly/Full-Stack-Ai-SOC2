"use client";

import { useState } from "react";

import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FindingActions({
  findingId,
  initialAnswer
}: {
  findingId: string;
  initialAnswer?: string | null;
}) {
  const [question, setQuestion] = useState("Do you enforce peer review before production deployment?");
  const [questionnaireAnswer, setQuestionnaireAnswer] = useState<string | null>(initialAnswer ?? null);
  const [policyDraft, setPolicyDraft] = useState<string | null>(null);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(false);

  async function handleQuestionnaire() {
    setLoadingQuestionnaire(true);
    const response = await fetch("/api/generate/questionnaire-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ findingId, question })
    });
    const payload = await response.json();
    captureEvent("questionnaire_answer_generated", { finding_id: findingId });
    setQuestionnaireAnswer(
      `Current State\n${payload.currentState}\n\nGap Identified\n${payload.gapIdentified}\n\nRemediation Roadmap\n${payload.remediationRoadmap}\n\nTimeline Estimate\n${payload.timelineEstimate}`
    );
    setLoadingQuestionnaire(false);
  }

  async function handlePolicy() {
    setLoadingPolicy(true);
    const response = await fetch("/api/generate/policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        policyType: "Change Management",
        companyName: "Your Company",
        employeeCount: 50,
        tools: ["AWS", "GitHub"]
      })
    });
    const payload = await response.json();
    captureEvent("policy_generated", { finding_id: findingId, policy_type: "Change Management" });
    setPolicyDraft(payload.document);
    setLoadingPolicy(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium">Questionnaire prompt</label>
        <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleQuestionnaire} disabled={loadingQuestionnaire}>
            {loadingQuestionnaire ? "Generating..." : "Refresh Questionnaire Answer"}
          </Button>
          <Button variant="secondary" onClick={handlePolicy} disabled={loadingPolicy}>
            {loadingPolicy ? "Generating..." : "Generate Policy Draft"}
          </Button>
        </div>
      </div>
      {questionnaireAnswer ? (
        <pre className="whitespace-pre-wrap rounded-3xl border border-border bg-white p-5 text-sm text-muted-foreground">
          {questionnaireAnswer}
        </pre>
      ) : null}
      {policyDraft ? (
        <pre className="whitespace-pre-wrap rounded-3xl border border-border bg-white p-5 text-sm text-muted-foreground">
          {policyDraft}
        </pre>
      ) : null}
    </div>
  );
}
