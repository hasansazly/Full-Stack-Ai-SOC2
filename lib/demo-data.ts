import type { FindingRecord } from "@/lib/gapEngine";

export const demoEvidence = [
  {
    id: "demo-artifact-1",
    client_id: null,
    source: "aws_iam",
    collected_at: new Date().toISOString(),
    raw_data: { totalUsers: 8, adminUsers: 3, usersWithoutMFA: 4, adminUsersWithoutMFA: 2 },
    checksum: "5c2b0f5ab8cd1234",
    artifact_type: "iam_scan_summary"
  },
  {
    id: "demo-artifact-2",
    client_id: null,
    source: "github_branch",
    collected_at: new Date().toISOString(),
    raw_data: { totalRepos: 5, reposAtRisk: 3 },
    checksum: "1c8f00e4abce7890",
    artifact_type: "github_branch_audit"
  }
];

export const demoFindings: FindingRecord[] = [
  {
    id: "demo-finding-1",
    client_id: null,
    control_area: "CC6 / Logical Access Control",
    severity: "critical",
    title: "Privileged user without MFA",
    description: "2 of 3 admin users do not have MFA configured in AWS IAM.",
    business_risk:
      "An attacker only needs one leaked password to gain privileged access and materially impact infrastructure, customer data, and audit readiness.",
    remediation_steps: [
      {
        step: 1,
        action: "Require MFA for all admin users",
        detail: "Attach a conditional IAM policy or AWS account setting that denies privileged actions unless MFA is present."
      },
      {
        step: 2,
        action: "Review break-glass access",
        detail: "Limit emergency access accounts and store credentials in a secure vault with documented approval controls."
      }
    ],
    status: "open",
    created_at: new Date().toISOString()
  },
  {
    id: "demo-finding-2",
    client_id: null,
    control_area: "CC8 / Change Management",
    severity: "high",
    title: "Direct push to main allowed",
    description: "3 repositories allow direct pushes to their default branch without enforced review controls.",
    business_risk:
      "Unreviewed production changes increase the chance of introducing security defects, outages, and unauthorized code changes that are difficult to detect.",
    remediation_steps: [
      {
        step: 1,
        action: "Enforce branch protection",
        detail: "Block direct pushes to main/master and require pull requests for every change."
      },
      {
        step: 2,
        action: "Require approvals and CI",
        detail: "Configure at least one approval, stale review dismissal, and status checks before merge."
      }
    ],
    status: "open",
    created_at: new Date().toISOString()
  }
];
