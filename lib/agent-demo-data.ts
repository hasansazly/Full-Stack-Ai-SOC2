import { getRemediationForFinding } from "@/lib/agents/autoRemediator";

export const demoDashboardGaps = [
  {
    id: "demo-finding-1",
    control: "CC6.1",
    severity: "critical",
    finding: "AWS user missing MFA",
    auto_remediable: true,
    remediation_type: "cli",
    status: "open"
  },
  {
    id: "demo-finding-3",
    control: "CC8.1",
    severity: "critical",
    finding: "GitHub branch protection missing on main",
    auto_remediable: true,
    remediation_type: "api",
    status: "open"
  },
  {
    id: "demo-finding-2",
    control: "CC6.2",
    severity: "high",
    finding: "Too many standing administrators",
    auto_remediable: false,
    remediation_type: "manual",
    status: "open"
  }
] as const;

export const demoDashboardArtifacts = [
  {
    id: "artifact-cc61",
    control: "CC6.1",
    source: "AWS_IAM",
    collected_at: "2026-04-07T14:12:00Z",
    content_hash: "55e1dbfb3db1b4b10a8983dd3ee03d9cad7aa163f3caa84ee8f6e77fc08c7ef3"
  },
  {
    id: "artifact-cc81",
    control: "CC8.1",
    source: "GITHUB_BRANCH_PROTECTION",
    collected_at: "2026-04-07T14:14:00Z",
    content_hash: "1d0f37932f57f7856fd89dc364e4cb3db6c8a3cdef9e9f163bf6c25ea495d1d2"
  },
  {
    id: "artifact-cc62",
    control: "CC6.2",
    source: "GITHUB_ORG_MEMBERS",
    collected_at: "2026-04-07T14:16:00Z",
    content_hash: "82f36f682161b4a62bd70a8932d6a14cbec89bb53fbecb688f8510cbbe0f21db"
  }
];

export const demoRemediationLog = [
  {
    id: "log-1",
    gap_id: "demo-finding-1",
    remediation_code: getRemediationForFinding("AWS user missing MFA")?.code || "",
    approved_at: "2026-04-07T14:20:00Z",
    executed_at: null,
    execution_result: {
      status: "awaiting_customer_approval",
      summary: "MFA enforcement policy preview generated for privileged AWS users."
    }
  }
];
