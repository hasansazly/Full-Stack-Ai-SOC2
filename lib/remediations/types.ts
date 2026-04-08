export type RemediationProvider = "aws" | "github";
export type RemediationRiskLevel = "low" | "medium" | "high";
export type RemediationExecutionMode = "manual" | "api" | "cli" | "pr";
export type EvidenceStatus = "captured" | "pending" | "expected";

export type RemediationEvidenceItem = {
  label: string;
  detail: string;
  status: EvidenceStatus;
};

export type RemediationField = {
  name: string;
  label: string;
  type: "text" | "password" | "textarea";
  placeholder?: string;
  required?: boolean;
  helperText?: string;
};

export type RemediationPayload = {
  title: string;
  language: "bash" | "json" | "diff" | "text";
  content: string;
  secondaryTitle?: string;
  secondaryLanguage?: "bash" | "json" | "diff" | "text";
  secondaryContent?: string;
};

export type RemediationDefinition = {
  id: string;
  supportedProvider: RemediationProvider;
  riskLevel: RemediationRiskLevel;
  executionMode: RemediationExecutionMode;
  findingMatchers: string[];
  title: string;
  issueSummary: string;
  whyItMatters: string;
  approvalWarning: string;
  suggestedFixLabel: string;
  approvalLabel: string;
  applyLabel: string;
  evidenceLabel: string;
  executionSummary: string;
  payload: RemediationPayload;
  beforeEvidence: RemediationEvidenceItem[];
  afterEvidence: RemediationEvidenceItem[];
  manualSteps?: string[];
  executionFields?: RemediationField[];
};

export type RemediationExecutionRecord = {
  id: string;
  action: string;
  actor: string;
  at: string;
  status: string;
  summary: string;
};
