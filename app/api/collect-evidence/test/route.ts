import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    mode: "sample",
    company: "Acme Corp (sample)",
    artifacts_collected: 9,
    gaps_found: 6,
    gaps: [
      {
        control: "CC6",
        severity: "critical",
        title: "IAM users without MFA",
        finding: "3 IAM users have console access enabled but no MFA device registered: sarah.chen, dev.bot, james.wong",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_code:
          "aws iam create-policy --policy-name RequireMFA --policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"DenyWithoutMFA\",\"Effect\":\"Deny\",\"NotAction\":[\"iam:CreateVirtualMFADevice\",\"iam:EnableMFADevice\",\"iam:GetUser\",\"iam:ListMFADevices\",\"sts:GetSessionToken\"],\"Resource\":\"*\",\"Condition\":{\"BoolIfExists\":{\"aws:MultiFactorAuthPresent\":\"false\"}}}]}'\naws iam attach-user-policy --user-name sarah.chen --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA\naws iam attach-user-policy --user-name james.wong --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA",
      },
      {
        control: "CC6",
        severity: "critical",
        title: "Root account MFA not enabled",
        finding: "The AWS root account does not have MFA enabled. Root account was last used 12 days ago.",
        auto_remediable: false,
        remediation_type: "manual",
        remediation_code:
          "1. Sign in to AWS Console as root\n2. Go to IAM → Security credentials\n3. Under Multi-factor authentication (MFA) click Assign MFA device\n4. Choose Virtual MFA device\n5. Use Google Authenticator or Authy to scan the QR code\n6. Enter two consecutive codes to verify",
      },
      {
        control: "CC6",
        severity: "high",
        title: "Direct AdministratorAccess on user",
        finding: "IAM user dev.bot has AdministratorAccess policy attached directly to the user account, violating least-privilege principle.",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_code:
          "aws iam detach-user-policy --user-name dev.bot --policy-arn arn:aws:iam::aws:policy/AdministratorAccess\naws iam add-user-to-group --user-name dev.bot --group-name Developers",
      },
      {
        control: "CC8",
        severity: "critical",
        title: "No branch protection on main",
        finding: "The main branch has no protection rules configured. Any team member can push directly to production without review.",
        auto_remediable: true,
        remediation_type: "api",
        remediation_code:
          "curl -X PUT https://api.github.com/repos/ORG/REPO/branches/main/protection \\\n  -H 'Authorization: Bearer YOUR_TOKEN' \\\n  -H 'Accept: application/vnd.github+json' \\\n  -d '{\"required_pull_request_reviews\":{\"required_approving_review_count\":1,\"dismiss_stale_reviews\":true,\"require_code_owner_reviews\":false},\"required_status_checks\":{\"strict\":true,\"contexts\":[]},\"enforce_admins\":true,\"restrictions\":null}'",
      },
      {
        control: "CC8",
        severity: "high",
        title: "Admins bypass branch protection",
        finding: "Branch protection exists but enforce_admins is disabled. Repository admins can merge without review.",
        auto_remediable: true,
        remediation_type: "api",
        remediation_code:
          "curl -X POST https://api.github.com/repos/ORG/REPO/branches/main/protection/enforce_admins \\\n  -H 'Authorization: Bearer YOUR_TOKEN' \\\n  -H 'Accept: application/vnd.github+json'",
      },
      {
        control: "CC6",
        severity: "medium",
        title: "No IAM password policy",
        finding: "No account-level IAM password policy is configured. Users can set weak passwords with no expiration.",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_code:
          "aws iam update-account-password-policy \\\n  --minimum-password-length 14 \\\n  --require-symbols \\\n  --require-numbers \\\n  --require-uppercase-characters \\\n  --require-lowercase-characters \\\n  --allow-users-to-change-password \\\n  --max-password-age 90 \\\n  --password-reuse-prevention 10",
      },
    ],
  });
}
