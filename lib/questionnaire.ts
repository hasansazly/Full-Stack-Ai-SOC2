import type { FindingRecord } from "@/lib/gapEngine";

export function generateQuestionnaireAnswer(finding: FindingRecord, question: string) {
  return {
    currentState: `Based on current evidence, ${finding.description.charAt(0).toLowerCase()}${finding.description.slice(1)} The control is partially implemented, but not yet consistently enforced across the affected systems.`,
    gapIdentified: `This gap maps to ${finding.control_area}. A buyer or security reviewer will care because ${finding.business_risk.charAt(0).toLowerCase()}${finding.business_risk.slice(1)}`,
    remediationRoadmap: finding.remediation_steps
      .map((step) => `${step.step}. ${step.action}: ${step.detail}`)
      .join("\n"),
    timelineEstimate:
      finding.severity === "critical"
        ? "Estimated timeline: immediate containment this week, with full control hardening and evidence capture targeted within 1 to 2 weeks."
        : "Estimated timeline: 2 to 4 weeks depending on implementation scope, validation, and owner availability.",
    question
  };
}
