export type RemediationSuggestion = {
  title: string;
  remediationType: "cli" | "api" | "policy" | "manual";
  code: string;
  summary: string;
};

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
aws iam attach-group-policy --group-name Admins --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/RequireMFA`;

const githubBranchProtectionRequest = `curl -L \\
  -X PUT \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer $GITHUB_TOKEN" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  https://api.github.com/repos/<ORG>/<REPO>/branches/main/protection \\
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["ci/test", "ci/build"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "required_approving_review_count": 1
    },
    "restrictions": null
  }'`;

export function getRemediationForFinding(finding: string): RemediationSuggestion | null {
  const normalized = finding.toLowerCase();

  if (normalized.includes("mfa")) {
    return {
      title: "Enforce MFA on privileged AWS users",
      remediationType: "cli",
      summary: "Create and attach a RequireMFA policy that denies non-enrollment actions when MFA is not present.",
      code: requireMfaPolicy
    };
  }

  if (normalized.includes("branch protection") || normalized.includes("main") || normalized.includes("peer review")) {
    return {
      title: "Enable branch protection on main",
      remediationType: "api",
      summary: "Apply required approvals, stale review dismissal, admin enforcement, and required status checks on the default branch.",
      code: githubBranchProtectionRequest
    };
  }

  return null;
}
