import type { FindingRecord } from "@/lib/gapEngine";
import type {
  RemediationDefinition,
  RemediationExecutionRecord,
  RemediationEvidenceItem,
} from "@/lib/remediations/types";

const githubBranchProtectionPayload = `curl -L \\
  -X PUT \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer $GITHUB_TOKEN" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  https://api.github.com/repos/<ORG>/<REPO>/branches/main/protection \\
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["ci/test"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "required_approving_review_count": 1
    },
    "restrictions": null
  }'`;

const githubBranchProtectionBody = `{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci/test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null
}`;

const codeownersContent = `# CODEOWNERS
* @<ORG>/engineering
/.github/ @<ORG>/security
/infrastructure/ @<ORG>/platform
/app/auth/ @<ORG>/security @<ORG>/backend`;

const codeownersPatch = `diff --git a/.github/CODEOWNERS b/.github/CODEOWNERS
new file mode 100644
--- /dev/null
+++ b/.github/CODEOWNERS
@@
+# CODEOWNERS
+* @<ORG>/engineering
+/.github/ @<ORG>/security
+/infrastructure/ @<ORG>/platform
+/app/auth/ @<ORG>/security @<ORG>/backend`;

const requireMfaPolicy = `cat > require-mfa-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyAllExceptMFAEnrollmentIfNoMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ListVirtualMFADevices",
        "iam:ResyncMFADevice",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
EOF

aws iam create-policy --policy-name RequireMFA --policy-document file://require-mfa-policy.json
aws iam attach-user-policy --user-name <PRIVILEGED_USER> --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/RequireMFA`;

export const remediationRegistry: RemediationDefinition[] = [
  {
    id: "github_branch_protection_main",
    supportedProvider: "github",
    riskLevel: "medium",
    executionMode: "api",
    findingMatchers: ["no peer review required", "direct push to main allowed", "branch protection missing", "no branch protection on main"],
    title: "Enforce main branch protection",
    issueSummary: "The default branch can be merged without the review and CI controls buyers expect.",
    whyItMatters:
      "A buyer or auditor will treat missing branch protection as evidence that production changes can bypass review, code validation, and admin oversight.",
    approvalWarning: "This changes repository protection rules. Approval is required before Talosly sends the GitHub API request.",
    suggestedFixLabel: "Suggested fix",
    approvalLabel: "Approval required",
    applyLabel: "Apply remediation",
    evidenceLabel: "Evidence captured",
    executionSummary: "Apply required PR review, one approval, stale review dismissal, and required status checks on main.",
    payload: {
      title: "GitHub branch protection API request",
      language: "bash",
      content: githubBranchProtectionPayload,
      secondaryTitle: "Request body",
      secondaryLanguage: "json",
      secondaryContent: githubBranchProtectionBody,
    },
    beforeEvidence: [
      { label: "Before evidence", detail: "Capture current branch protection settings from the main branch.", status: "captured" },
      { label: "Gap evidence", detail: "Store the failing review requirement and admin enforcement state.", status: "captured" },
    ],
    afterEvidence: [
      { label: "After evidence", detail: "Store the updated main branch protection response body returned by GitHub.", status: "expected" },
      { label: "Execution timestamp", detail: "Record who approved the change and when the API request completed.", status: "expected" },
    ],
    executionFields: [
      { name: "githubToken", label: "GitHub Personal Access Token", type: "password", required: true, helperText: "Used only for this request." },
      { name: "githubOrg", label: "GitHub Org", type: "text", required: true, placeholder: "acme-inc" },
      { name: "githubRepo", label: "GitHub Repo", type: "text", required: true, placeholder: "api" },
    ],
  },
  {
    id: "github_codeowners_pr",
    supportedProvider: "github",
    riskLevel: "low",
    executionMode: "pr",
    findingMatchers: ["no codeowners file", "missing codeowners"],
    title: "Create CODEOWNERS via pull request",
    issueSummary: "Critical paths do not have declared owners, so reviewer assignment and approval expectations are inconsistent.",
    whyItMatters:
      "Without CODEOWNERS, security-sensitive paths can merge without the right reviewers. Buyers often treat this as weak change-management discipline.",
    approvalWarning: "Talosly will prepare a CODEOWNERS patch and a PR-ready payload. It will not mutate the default branch directly.",
    suggestedFixLabel: "Suggested fix",
    approvalLabel: "Approval required",
    applyLabel: "Apply remediation",
    evidenceLabel: "Evidence captured",
    executionSummary: "Generate a CODEOWNERS file and PR payload so the repository can adopt enforceable ownership rules safely.",
    payload: {
      title: "Suggested CODEOWNERS file",
      language: "text",
      content: codeownersContent,
      secondaryTitle: "Patch preview",
      secondaryLanguage: "diff",
      secondaryContent: codeownersPatch,
    },
    beforeEvidence: [
      { label: "Before evidence", detail: "Capture the missing CODEOWNERS file state in the repository default branch.", status: "captured" },
      { label: "Gap evidence", detail: "Store the finding that security-sensitive paths lack explicit owners.", status: "captured" },
    ],
    afterEvidence: [
      { label: "PR evidence", detail: "Capture the generated branch name, proposed file content, and PR metadata.", status: "expected" },
      { label: "Merge evidence", detail: "After merge, capture the CODEOWNERS file from the default branch.", status: "expected" },
    ],
    executionFields: [
      { name: "githubOrg", label: "GitHub Org", type: "text", required: true, placeholder: "acme-inc" },
      { name: "githubRepo", label: "GitHub Repo", type: "text", required: true, placeholder: "api" },
      { name: "defaultOwners", label: "Default owners", type: "text", required: false, placeholder: "@acme-inc/engineering" },
    ],
    manualSteps: [
      "Review the generated CODEOWNERS content with engineering and security leads.",
      "Open a pull request instead of writing to the default branch directly.",
      "Enable code owner review in branch protection after the file is merged.",
    ],
  },
  {
    id: "aws_privileged_user_mfa",
    supportedProvider: "aws",
    riskLevel: "high",
    executionMode: "manual",
    findingMatchers: ["privileged user without mfa", "user missing mfa", "mfa adoption below", "mfa"],
    title: "Enforce MFA for privileged AWS users",
    issueSummary: "One or more privileged AWS users can reach the console or privileged actions without MFA.",
    whyItMatters:
      "Privileged access without MFA is one of the fastest ways to fail a buyer security review because a single compromised password could turn into infrastructure access.",
    approvalWarning: "Talosly will log approval, generate the exact CLI, and capture evidence before and after. The actual MFA enrollment remains a manual or semi-automated step in v1.",
    suggestedFixLabel: "Suggested fix",
    approvalLabel: "Approval required",
    applyLabel: "Apply remediation",
    evidenceLabel: "Evidence captured",
    executionSummary: "Prepare an MFA enforcement policy and a documented runbook for each privileged AWS user.",
    payload: {
      title: "AWS CLI and policy payload",
      language: "bash",
      content: requireMfaPolicy,
    },
    beforeEvidence: [
      { label: "Before evidence", detail: "Capture affected privileged users and their MFA device state from IAM.", status: "captured" },
      { label: "Gap evidence", detail: "Store the credential report and affected usernames before remediation starts.", status: "captured" },
    ],
    afterEvidence: [
      { label: "After evidence", detail: "Collect updated MFA device listings and the credential report after the team enables MFA.", status: "expected" },
      { label: "Execution timestamp", detail: "Record who approved the fix and when the team completed manual enforcement.", status: "expected" },
    ],
    executionFields: [
      { name: "awsAccountId", label: "AWS Account ID", type: "text", required: false, placeholder: "123456789012" },
      { name: "affectedUser", label: "Affected privileged user", type: "text", required: false, placeholder: "alice.admin" },
    ],
    manualSteps: [
      "Create or confirm a RequireMFA policy scoped to privileged users.",
      "Enroll each affected user in MFA and validate console login requires it.",
      "Re-run evidence collection to capture the updated MFA state.",
    ],
  },
];

export function getRemediationForFindingRecord(
  finding: Pick<FindingRecord, "title" | "description" | "control_area" | "business_risk">,
): RemediationDefinition | null {
  const haystack = `${finding.title} ${finding.description} ${finding.control_area}`.toLowerCase();
  return remediationRegistry.find((item) => item.findingMatchers.some((matcher) => haystack.includes(matcher))) ?? null;
}

export function buildDefaultTimeline(now = new Date().toISOString()): RemediationExecutionRecord[] {
  return [
    {
      id: `timeline-${now}`,
      action: "detected",
      actor: "Talosly scanner",
      at: now,
      status: "open",
      summary: "Talosly identified a supported remediation path for this finding.",
    },
  ];
}

export function normalizeEvidence(items: RemediationEvidenceItem[]) {
  return items.map((item) => ({ ...item }));
}
