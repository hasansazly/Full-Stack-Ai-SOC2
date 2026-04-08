import type { FindingRecord, GithubRepoSummary } from "@/lib/gapEngine";

export const sampleAwsUsers = [
  {
    userName: "alex@northstar.dev",
    isAdmin: true,
    hasMFA: false,
    lastActivity: "2026-04-05T14:18:00Z",
    groups: ["Admins"],
    attachedPolicies: ["AdministratorAccess"]
  },
  {
    userName: "sam@northstar.dev",
    isAdmin: true,
    hasMFA: false,
    lastActivity: "2026-04-04T09:42:00Z",
    groups: ["Platform"],
    attachedPolicies: ["PowerUserAccess"]
  },
  {
    userName: "rita@northstar.dev",
    isAdmin: true,
    hasMFA: true,
    lastActivity: "2026-04-06T18:22:00Z",
    groups: ["Admins"],
    attachedPolicies: ["AdministratorAccess"]
  },
  {
    userName: "devon@northstar.dev",
    isAdmin: false,
    hasMFA: false,
    lastActivity: "2026-04-06T11:03:00Z",
    groups: ["Developers"],
    attachedPolicies: ["ReadOnlyAccess"]
  },
  {
    userName: "mia@northstar.dev",
    isAdmin: false,
    hasMFA: false,
    lastActivity: "2026-04-01T16:10:00Z",
    groups: ["Support"],
    attachedPolicies: []
  },
  {
    userName: "leo@northstar.dev",
    isAdmin: false,
    hasMFA: true,
    lastActivity: "2026-04-06T08:20:00Z",
    groups: ["Engineering"],
    attachedPolicies: []
  }
] as const;

export const sampleGithubRepos: GithubRepoSummary[] = [
  {
    name: "northstar-app",
    defaultBranch: "main",
    branchProtectionEnabled: false,
    requiredApprovals: 0,
    codeownersExists: false,
    directPushAllowed: true,
    ciChecksRequired: false,
    dismissStaleReviews: false,
    requireCodeOwnerReviews: false,
    riskLevel: "critical"
  },
  {
    name: "northstar-api",
    defaultBranch: "main",
    branchProtectionEnabled: true,
    requiredApprovals: 0,
    codeownersExists: false,
    directPushAllowed: false,
    ciChecksRequired: true,
    dismissStaleReviews: true,
    requireCodeOwnerReviews: false,
    riskLevel: "critical"
  },
  {
    name: "northstar-infra",
    defaultBranch: "main",
    branchProtectionEnabled: true,
    requiredApprovals: 1,
    codeownersExists: true,
    directPushAllowed: true,
    ciChecksRequired: true,
    dismissStaleReviews: true,
    requireCodeOwnerReviews: true,
    riskLevel: "high"
  },
  {
    name: "northstar-docs",
    defaultBranch: "main",
    branchProtectionEnabled: true,
    requiredApprovals: 1,
    codeownersExists: false,
    directPushAllowed: false,
    ciChecksRequired: false,
    dismissStaleReviews: false,
    requireCodeOwnerReviews: false,
    riskLevel: "medium"
  }
];

export const sampleWorkspaceSummary = {
  companyName: "Northstar AI",
  dealStage: "Pilot blocked by buyer questionnaire",
  totalUsers: sampleAwsUsers.length,
  adminUsers: sampleAwsUsers.filter((user) => user.isAdmin).length,
  usersWithoutMFA: sampleAwsUsers.filter((user) => !user.hasMFA).length,
  adminUsersWithoutMFA: sampleAwsUsers.filter((user) => user.isAdmin && !user.hasMFA).length,
  totalRepos: sampleGithubRepos.length,
  reposAtRisk: sampleGithubRepos.filter((repo) => repo.riskLevel !== "low").length
};

export const demoEvidence = [
  {
    id: "demo-artifact-1",
    client_id: null,
    source: "aws_iam",
    collected_at: new Date().toISOString(),
    raw_data: {
      totalUsers: sampleWorkspaceSummary.totalUsers,
      adminUsers: sampleWorkspaceSummary.adminUsers,
      usersWithoutMFA: sampleWorkspaceSummary.usersWithoutMFA,
      adminUsersWithoutMFA: sampleWorkspaceSummary.adminUsersWithoutMFA,
      users: sampleAwsUsers
    },
    checksum: "5c2b0f5ab8cd1234",
    artifact_type: "iam_scan_summary"
  },
  {
    id: "demo-artifact-2",
    client_id: null,
    source: "github_branch",
    collected_at: new Date().toISOString(),
    raw_data: {
      totalRepos: sampleWorkspaceSummary.totalRepos,
      reposAtRisk: sampleWorkspaceSummary.reposAtRisk,
      repos: sampleGithubRepos
    },
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
    description: "2 of 3 admin-capable AWS IAM users in the sample workspace do not have MFA configured.",
    business_risk:
      "If a buyer sees privileged access without MFA, they will assume a compromised password could lead directly to infrastructure changes or customer-data exposure.",
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
    control_area: "CC6 / Logical Access Control",
    severity: "high",
    title: "Excessive admin access",
    description: "3 of 6 AWS IAM users in the sample workspace have admin access, which is high for a team this size.",
    business_risk:
      "Too many standing administrators makes least-privilege difficult to defend during security review and increases blast radius if any one account is compromised.",
    remediation_steps: [
      {
        step: 1,
        action: "Reduce standing admin access",
        detail: "Move infrequent privileged tasks to short-lived IAM roles and remove permanent admin rights from day-to-day accounts."
      },
      {
        step: 2,
        action: "Document role ownership",
        detail: "Define who can approve privileged access and require quarterly review of all administrative assignments."
      }
    ],
    status: "open",
    created_at: new Date().toISOString()
  },
  {
    id: "demo-finding-3",
    client_id: null,
    control_area: "CC8 / Change Management",
    severity: "critical",
    title: "No peer review required",
    description: "2 repositories in the sample workspace can merge to main with zero required approvals.",
    business_risk:
      "Security teams treat missing peer review as a core process gap because production-impacting changes can ship without independent oversight.",
    remediation_steps: [
      {
        step: 1,
        action: "Require at least one approval",
        detail: "Set branch protection on all production repositories to require one or more approvals before merge."
      },
      {
        step: 2,
        action: "Dismiss stale reviews",
        detail: "Require re-review after material changes so approvals reflect the final code being shipped."
      }
    ],
    status: "open",
    created_at: new Date().toISOString()
  },
  {
    id: "demo-finding-4",
    client_id: null,
    control_area: "CC8 / Change Management",
    severity: "high",
    title: "Direct push to main allowed",
    description: "The sample workspace allows direct pushes to the default branch for the infrastructure repository.",
    business_risk:
      "Direct pushes make it harder to show buyers that production changes are reviewed, tested, and attributable to an approved workflow.",
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
  },
  {
    id: "demo-finding-5",
    client_id: null,
    control_area: "CC8 / Change Management",
    severity: "medium",
    title: "No CODEOWNERS file",
    description: "3 repositories in the sample workspace do not define CODEOWNERS for security-sensitive code paths.",
    business_risk:
      "Without code ownership, reviewer assignment is inconsistent and buyers cannot tell whether the right people are approving risky changes.",
    remediation_steps: [
      {
        step: 1,
        action: "Create CODEOWNERS for critical paths",
        detail: "Add owners for application auth flows, infrastructure definitions, deployment pipelines, and data-access code."
      },
      {
        step: 2,
        action: "Require code owner review",
        detail: "Pair CODEOWNERS with branch protection so the policy is enforced before merge."
      }
    ],
    status: "open",
    created_at: new Date().toISOString()
  }
];

export const sampleQuestionnaireExamples = [
  "Do you require multi-factor authentication for privileged cloud access?",
  "Do you enforce peer review before changes are deployed to production?",
  "How do you ensure infrastructure changes are approved and tracked?"
];
