import type { FindingRecord } from "@/lib/gapEngine";

export function generateQuestionnaireAnswer(finding: FindingRecord, question: string) {
  return {
    currentState: `Current controls are partially implemented. Based on the finding "${finding.title}", ${finding.description.toLowerCase()}`,
    gapIdentified: `The primary gap is mapped to ${finding.control_area}. ${finding.business_risk}`,
    remediationRoadmap: finding.remediation_steps
      .map((step) => `${step.step}. ${step.action}: ${step.detail}`)
      .join("\n"),
    timelineEstimate:
      finding.severity === "critical"
        ? "Estimated remediation timeline: 1 to 2 weeks for immediate control hardening, with validation evidence captured during rollout."
        : "Estimated remediation timeline: 2 to 4 weeks depending on owner availability, testing, and policy updates.",
    question
  };
}
