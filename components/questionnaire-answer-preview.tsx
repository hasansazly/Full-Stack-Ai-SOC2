type Answer = {
  currentState: string;
  gapIdentified: string;
  remediationRoadmap: string;
  timelineEstimate: string;
};

export function QuestionnaireAnswerPreview({ answer }: { answer: Answer }) {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Questionnaire Draft</p>
        <h3 className="mt-2 text-xl font-semibold">Buyer-safe answer generated from evidence</h3>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">Current State</p>
          <p className="mt-1">{answer.currentState}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Gap Identified</p>
          <p className="mt-1">{answer.gapIdentified}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Remediation Roadmap</p>
          <p className="mt-1 whitespace-pre-wrap">{answer.remediationRoadmap}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Timeline Estimate</p>
          <p className="mt-1">{answer.timelineEstimate}</p>
        </div>
      </div>
    </div>
  );
}
