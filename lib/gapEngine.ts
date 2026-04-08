import { createAdminSupabaseClient } from "@/lib/supabase";

export type RemediationStep = {
  step: number;
  action: string;
  detail: string;
};

export type FindingRecord = {
  id?: string;
  client_id: string | null;
  control_area: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  business_risk: string;
  remediation_steps: RemediationStep[];
  status: string;
  created_at?: string;
};

export type AwsScanSummary = {
  totalUsers: number;
  adminUsers: number;
  usersWithoutMFA: number;
  adminUsersWithoutMFA: number;
  users: Array<{
    userName: string;
    isAdmin: boolean;
    hasMFA: boolean;
    lastActivity: string | null;
    groups: string[];
    attachedPolicies: string[];
  }>;
};

export type GithubRepoSummary = {
  name: string;
  defaultBranch: string;
  branchProtectionEnabled: boolean;
  requiredApprovals: number;
  codeownersExists: boolean;
  directPushAllowed: boolean;
  ciChecksRequired: boolean;
  dismissStaleReviews: boolean;
  requireCodeOwnerReviews: boolean;
  riskLevel: "critical" | "high" | "medium" | "low";
};

export type GithubScanSummary = {
  totalRepos: number;
  reposAtRisk: number;
  repos: GithubRepoSummary[];
};

function makeFinding(
  clientId: string | null,
  severity: FindingRecord["severity"],
  controlArea: string,
  title: string,
  description: string,
  businessRisk: string,
  remediationSteps: RemediationStep[]
): FindingRecord {
  return {
    client_id: clientId,
    control_area: controlArea,
    severity,
    title,
    description,
    business_risk: businessRisk,
    remediation_steps: remediationSteps,
    status: "open"
  };
}

export function buildGapFindings(clientId: string | null, aws?: AwsScanSummary, github?: GithubScanSummary) {
  const findings: FindingRecord[] = [];

  if (aws) {
    if (aws.adminUsers > 2) {
      findings.push(
        makeFinding(
          clientId,
          "high",
          "CC6 / Logical Access Control",
          "Excessive admin access",
          `${aws.adminUsers} of ${aws.totalUsers} IAM users currently have administrative access.`,
          "Broad administrative access expands blast radius during account compromise and makes least-privilege enforcement harder to demonstrate during security reviews.",
          [
            {
              step: 1,
              action: "Reduce standing admin access",
              detail: "Review each administrative assignment and remove administrator policies from users that do not require full account control."
            },
            {
              step: 2,
              action: "Move privileged work to roles",
              detail: "Use temporary elevation through IAM roles or an approval workflow instead of permanent user-based admin permissions."
            }
          ]
        )
      );
    }

    if (aws.adminUsersWithoutMFA > 0) {
      findings.push(
        makeFinding(
          clientId,
          "critical",
          "CC6 / Logical Access Control",
          "Privileged user without MFA",
          `${aws.adminUsersWithoutMFA} privileged IAM user${aws.adminUsersWithoutMFA === 1 ? "" : "s"} do not have MFA enabled.`,
          "A privileged account without MFA is a direct security-review blocker because a single stolen password can allow unauthorized infrastructure changes or data access.",
          [
            {
              step: 1,
              action: "Enroll privileged users in MFA immediately",
              detail: "Require every admin-capable IAM user to register at least one MFA device."
            },
            {
              step: 2,
              action: "Enforce MFA at policy level",
              detail: "Add a deny statement for sensitive API actions when aws:MultiFactorAuthPresent is false."
            }
          ]
        )
      );
    }

    if (aws.totalUsers > 0 && aws.usersWithoutMFA / aws.totalUsers > 0.5) {
      findings.push(
        makeFinding(
          clientId,
          "high",
          "CC6 / Logical Access Control",
          "MFA adoption below 50%",
          `${aws.usersWithoutMFA} of ${aws.totalUsers} IAM users do not have MFA enabled.`,
          "Low MFA adoption increases the probability of account takeover and signals weak access hygiene to customers and auditors.",
          [
            {
              step: 1,
              action: "Roll out MFA to all IAM users",
              detail: "Prioritize engineering, support, and operations users with console access first."
            },
            {
              step: 2,
              action: "Document enforcement",
              detail: "Update onboarding and access review procedures so MFA is required before access is considered active."
            }
          ]
        )
      );
    }
  }

  if (github) {
    const reposWithoutProtection = github.repos.filter((repo) => !repo.branchProtectionEnabled);
    if (reposWithoutProtection.length > 0) {
      findings.push(
        makeFinding(
          clientId,
          "critical",
          "CC8 / Change Management",
          "No branch protection on main",
          `${reposWithoutProtection.length} repository${reposWithoutProtection.length === 1 ? "" : "ies"} do not enforce branch protection on the default branch.`,
          "Without branch protection, production code can be changed without review gates, increasing the risk of defects, unauthorized changes, and failed security due diligence.",
          [
            {
              step: 1,
              action: "Enable branch protection",
              detail: "Require pull requests on main/master for every production-facing repository."
            },
            {
              step: 2,
              action: "Add review and CI gates",
              detail: "Enable required reviews, stale review dismissal, and status checks before merge."
            }
          ]
        )
      );
    }

    const reposWithoutPeerReview = github.repos.filter((repo) => repo.requiredApprovals === 0);
    if (reposWithoutPeerReview.length > 0) {
      findings.push(
        makeFinding(
          clientId,
          "critical",
          "CC8 / Change Management",
          "No peer review required",
          `${reposWithoutPeerReview.length} repository${reposWithoutPeerReview.length === 1 ? "" : "ies"} allow merges without required pull request approvals.`,
          "Peer review is a foundational control for secure change management. Missing approval requirements makes it difficult to prove segregation of duties.",
          [
            {
              step: 1,
              action: "Set minimum required approvals",
              detail: "Require at least one reviewer approval on all protected branches."
            },
            {
              step: 2,
              action: "Document exceptions",
              detail: "If emergency merges are possible, log and retrospectively review them through a formal break-glass process."
            }
          ]
        )
      );
    }

    const reposAllowingDirectPush = github.repos.filter((repo) => repo.directPushAllowed);
    if (reposAllowingDirectPush.length > 0) {
      findings.push(
        makeFinding(
          clientId,
          "high",
          "CC8 / Change Management",
          "Direct push to main allowed",
          `${reposAllowingDirectPush.length} repository${reposAllowingDirectPush.length === 1 ? "" : "ies"} still allow direct pushes to the default branch.`,
          "Direct pushes bypass normal review workflows and increase the chance that risky or unauthorized changes reach production undetected.",
          [
            {
              step: 1,
              action: "Disable direct pushes",
              detail: "Restrict the default branch so all changes flow through pull requests."
            },
            {
              step: 2,
              action: "Audit bypass actors",
              detail: "Review which administrators or apps can bypass protection and narrow that list to approved maintainers."
            }
          ]
        )
      );
    }

    const reposWithoutCodeowners = github.repos.filter((repo) => !repo.codeownersExists);
    if (reposWithoutCodeowners.length > 0) {
      findings.push(
        makeFinding(
          clientId,
          "medium",
          "CC8 / Change Management",
          "No CODEOWNERS file",
          `${reposWithoutCodeowners.length} repository${reposWithoutCodeowners.length === 1 ? "" : "ies"} do not define code ownership rules.`,
          "Undefined code ownership weakens accountability for security-sensitive areas and can lead to inconsistent reviewer assignment.",
          [
            {
              step: 1,
              action: "Add a CODEOWNERS file",
              detail: "Assign owners for critical code paths, infrastructure definitions, and deployment workflows."
            },
            {
              step: 2,
              action: "Pair with review rules",
              detail: "Require code owner review on protected branches to ensure the policy is actively enforced."
            }
          ]
        )
      );
    }
  }

  return findings;
}

export async function persistGapFindings(findings: FindingRecord[]) {
  if (findings.length === 0) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return findings;
  }

  const clientId = findings[0]?.client_id;
  if (clientId) {
    const titles = findings.map((finding) => finding.title);
    await supabase.from("gap_findings").delete().eq("client_id", clientId).in("title", titles);
  }

  const { data, error } = await supabase.from("gap_findings").insert(findings).select("*");
  if (error) {
    throw new Error(`Failed to persist gap findings: ${error.message}`);
  }

  return data ?? findings;
}
