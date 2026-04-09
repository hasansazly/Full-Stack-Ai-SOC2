'use client'

import { useState } from 'react'
import Link from 'next/link'

const GAPS = [
  {
    id: 1,
    control: 'CC6',
    severity: 'critical',
    title: '3 IAM users have console access but no MFA',
    finding:
      'IAM users sarah.chen, dev.bot, and james.wong all have ' +
      'AWS Console password login enabled but zero MFA devices ' +
      'registered. A compromised password gives full console ' +
      'access with no second factor.',
    source: 'AWS_CREDENTIAL_REPORT',
    auto_remediable: true,
    remediation_type: 'cli',
    remediation_title: 'Enforce MFA via IAM policy',
    buyerImpact:
      'A buyer security team will treat privileged console access without MFA as an immediate blocker to production access approval.',
    whyItMatters:
      'This is a direct logical-access control failure. One stolen password can turn into unrestricted console access without a second factor.',
    evidenceCaptured: [
      'Updated IAM user policy attachments for affected users',
      'Fresh credential report showing MFA active status',
      'Approval timestamp and command hash in remediation log',
    ],
    questionnairePreview:
      'Privileged console users were identified without MFA enforcement. We generated and approved an IAM MFA-enforcement policy, attached it to affected users, and captured updated IAM evidence to verify second-factor enforcement.',
    remediation_code: `# Step 1: Create the MFA enforcement policy
aws iam create-policy \\
  --policy-name RequireMFA \\
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "DenyWithoutMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }]
  }'

# Step 2: Attach to affected users
aws iam attach-user-policy \\
  --user-name sarah.chen \\
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA

aws iam attach-user-policy \\
  --user-name dev.bot \\
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA

aws iam attach-user-policy \\
  --user-name james.wong \\
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA

# Step 3: Verify
aws iam list-attached-user-policies --user-name sarah.chen`,
  },
  {
    id: 2,
    control: 'CC6',
    severity: 'critical',
    title: 'Root account MFA not enabled',
    finding:
      'The AWS root account has no MFA device registered and was ' +
      'last used 12 days ago. Root account compromise gives ' +
      'unrestricted access to every resource in the account ' +
      'including the ability to delete all IAM users and data.',
    source: 'AWS_ROOT_ACCOUNT',
    auto_remediable: false,
    remediation_type: 'manual',
    remediation_title: 'Enable root MFA via AWS Console',
    buyerImpact:
      'Most enterprise buyers treat missing root MFA as a hard fail because root compromise bypasses normal administrative safeguards.',
    whyItMatters:
      'The root account can override or delete all IAM protections. If it is used recently and lacks MFA, the blast radius is total-account compromise.',
    evidenceCaptured: [
      'Updated root-account MFA status from a fresh credential report',
      'New root usage snapshot after MFA enrollment',
      'Manual remediation approval timestamp and evidence note',
    ],
    questionnairePreview:
      'We identified that the AWS root account did not have MFA enabled. Root MFA is being enabled through the AWS Console and will be re-verified in the next credential report before the control is marked complete.',
    remediation_code: `# Root MFA must be enabled manually — cannot be done via CLI

Step 1: Sign in to AWS Console as root account
  → Use your root email and root password
  → Do NOT use an IAM user for this step

Step 2: Go to IAM → Security credentials
  → Top right menu → Security credentials

Step 3: Under "Multi-factor authentication (MFA)"
  → Click "Assign MFA device"
  → Choose "Authenticator app"
  → Click Next

Step 4: Open Google Authenticator or Authy on your phone
  → Tap + → Scan QR code
  → Scan the QR code shown on screen

Step 5: Enter two consecutive 6-digit codes from the app
  → MFA code 1: first code
  → MFA code 2: wait 30 seconds, enter next code
  → Click Add MFA

Step 6: Verify by signing out and signing back in
  → Root sign-in should now require the MFA code`,
  },
  {
    id: 3,
    control: 'CC6',
    severity: 'high',
    title: 'AdministratorAccess attached directly to user',
    finding:
      'IAM user dev.bot has the AWS-managed AdministratorAccess ' +
      'policy attached directly to the user account. This violates ' +
      'the principle of least privilege. Admin access should only ' +
      'be granted via a named group with a documented approval.',
    source: 'AWS_IAM_USERS',
    auto_remediable: true,
    remediation_type: 'cli',
    remediation_title: 'Remove direct admin policy, add to group',
    buyerImpact:
      'Direct user-level admin access signals weak least-privilege controls and usually triggers follow-up questions from buyer security teams.',
    whyItMatters:
      'SOC 2 buyers expect administrative access to be structured, reviewable, and granted through named roles or groups rather than directly on a user object.',
    evidenceCaptured: [
      'Before/after attached user policies for dev.bot',
      'Group membership evidence for the replacement role',
      'Approval timestamp and remediation command history',
    ],
    questionnairePreview:
      'We found one IAM user with direct AdministratorAccess. The direct policy is being removed and replaced with scoped group-based access to align with least-privilege expectations and access review workflows.',
    remediation_code: `# Step 1: Detach AdministratorAccess from the user
aws iam detach-user-policy \\
  --user-name dev.bot \\
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Step 2: Create a Developers group if it doesn't exist
aws iam create-group --group-name Developers

# Step 3: Attach appropriate policy to the group
aws iam attach-group-policy \\
  --group-name Developers \\
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# Step 4: Add the user to the group
aws iam add-user-to-group \\
  --user-name dev.bot \\
  --group-name Developers

# Step 5: Verify no direct policies remain
aws iam list-attached-user-policies --user-name dev.bot
# Expected: empty list`,
  },
  {
    id: 4,
    control: 'CC6',
    severity: 'high',
    title: 'No IAM account password policy configured',
    finding:
      'No account-level IAM password policy exists. Users can set ' +
      'passwords of any length with no complexity requirements and ' +
      'no expiration. SOC 2 CC6 requires documented password ' +
      'standards enforced at the system level.',
    source: 'AWS_PASSWORD_POLICY',
    auto_remediable: true,
    remediation_type: 'cli',
    remediation_title: 'Set compliant password policy',
    buyerImpact:
      'Weak or missing password policy controls reduce confidence that the environment enforces baseline authentication standards consistently.',
    whyItMatters:
      'Without an account-level password policy, password complexity and expiration are left to individual users, which undermines system-level access controls.',
    evidenceCaptured: [
      'Updated IAM account password policy document',
      'Collection timestamp for the new password policy state',
      'Approval log tied to the generated CLI payload',
    ],
    questionnairePreview:
      'We identified that no IAM account password policy was configured. A compliant policy with complexity, rotation, and reuse controls has been generated and is being applied with evidence captured from the updated account settings.',
    remediation_code: `# Apply SOC 2 compliant password policy in one command
aws iam update-account-password-policy \\
  --minimum-password-length 14 \\
  --require-symbols \\
  --require-numbers \\
  --require-uppercase-characters \\
  --require-lowercase-characters \\
  --allow-users-to-change-password \\
  --max-password-age 90 \\
  --password-reuse-prevention 10 \\
  --hard-expiry

# Verify the policy was applied
aws iam get-account-password-policy`,
  },
  {
    id: 5,
    control: 'CC8',
    severity: 'critical',
    title: 'No branch protection on main branch',
    finding:
      'The main branch of acme-corp/api-service has no branch ' +
      'protection rules configured. Any team member with write ' +
      'access can push directly to production without code review, ' +
      'approval, or automated testing. This is the single highest-' +
      'risk finding for SOC 2 CC8.',
    source: 'GITHUB_BRANCH_PROTECTION',
    auto_remediable: true,
    remediation_type: 'api',
    remediation_title: 'Enable branch protection via GitHub API',
    buyerImpact:
      'This is one of the fastest ways for a buyer to lose confidence because unreviewed code can reach production directly.',
    whyItMatters:
      'Without branch protection, any engineer with write access can merge or push to main without peer review, status checks, or auditability.',
    evidenceCaptured: [
      'Before/after branch protection configuration on main',
      'Approval record for the exact GitHub API payload',
      'Updated repository evidence showing reviews and status checks enforced',
    ],
    questionnairePreview:
      'We identified that the main branch did not enforce pull request review or status checks. Talosly generated the exact GitHub branch-protection payload, captured the approval event, and can verify the updated configuration after execution.',
    remediation_code: `# Enable full branch protection on main
curl -X PUT \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false,
      "require_last_push_approval": false
    },
    "required_status_checks": {
      "strict": true,
      "contexts": []
    },
    "enforce_admins": true,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'

# Verify protection is active
curl \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN"`,
  },
  {
    id: 6,
    control: 'CC8',
    severity: 'high',
    title: 'Admins can bypass branch protection',
    finding:
      'Branch protection rules exist but enforce_admins is set to ' +
      'false. The 3 repository admins (cto@acme.com, ' +
      'lead-eng@acme.com, devops@acme.com) can merge to main ' +
      'without any review. SOC 2 CC8 two-person integrity ' +
      'requirement applies to all users including admins.',
    source: 'GITHUB_BRANCH_PROTECTION',
    auto_remediable: true,
    remediation_type: 'api',
    remediation_title: 'Enforce branch protection for admins',
    buyerImpact:
      'If admins can bypass review controls, buyers will treat branch protection as incomplete even if rules exist for everyone else.',
    whyItMatters:
      'Two-person review only works when it applies to administrators too. Otherwise the highest-privilege users can ship code outside the control.',
    evidenceCaptured: [
      'Before/after enforce_admins setting for the main branch',
      'Approval record for the GitHub API change',
      'Updated protection evidence confirming admin enforcement is active',
    ],
    questionnairePreview:
      'We identified that repository administrators could bypass branch protection. The admin-enforcement setting is being enabled and will be re-verified through the GitHub API to confirm the control applies to all privileged users.',
    remediation_code: `# Enable enforce_admins on the main branch
curl -X POST \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection/enforce_admins \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28"

# This single call enables admin enforcement
# Verify:
curl \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection/enforce_admins \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN"
# Expected: { "url": "...", "enabled": true }`,
  },
  {
    id: 7,
    control: 'CC8',
    severity: 'medium',
    title: 'Stale review dismissal not enabled',
    finding:
      'Branch protection requires 1 approving review but ' +
      'dismiss_stale_reviews is false. A developer can get ' +
      'approval on a safe version of a PR, then push additional ' +
      'commits with malicious or breaking changes, and the original ' +
      'approval still counts. The approval becomes meaningless.',
    source: 'GITHUB_BRANCH_PROTECTION',
    auto_remediable: true,
    remediation_type: 'api',
    remediation_title: 'Enable stale review dismissal',
    buyerImpact:
      'Buyer security teams view stale approvals as weak change management because reviewed code can change after approval without forcing re-review.',
    whyItMatters:
      'Dismiss stale review enforcement ensures new commits invalidate prior approvals, preserving the integrity of peer review before production changes.',
    evidenceCaptured: [
      'Updated branch protection payload with dismiss_stale_reviews=true',
      'Approval record for the remediation request',
      'Post-fix branch protection evidence from GitHub',
    ],
    questionnairePreview:
      'We found that pull request approvals remained valid after new commits were pushed. Talosly generated the branch-protection update needed to dismiss stale reviews and will verify the setting from GitHub after approval.',
    remediation_code: `# Update branch protection to dismiss stale reviews
curl -X PUT \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json" \\
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false
    },
    "required_status_checks": null,
    "enforce_admins": true,
    "restrictions": null
  }'`,
  },
  {
    id: 8,
    control: 'CC6',
    severity: 'medium',
    title: 'Inactive IAM user not deprovisioned',
    finding:
      'IAM user contractor.raj has not logged in for 127 days and ' +
      'has an active access key last used 134 days ago. Inactive ' +
      'accounts represent orphaned access that should be ' +
      'deprovisioned per the offboarding policy. SOC 2 CC6 ' +
      'requires quarterly access reviews.',
    source: 'AWS_CREDENTIAL_REPORT',
    auto_remediable: true,
    remediation_type: 'cli',
    remediation_title: 'Disable inactive user and rotate key',
    buyerImpact:
      'Orphaned access is a classic follow-up question in buyer reviews because inactive users often indicate weak offboarding and access-review discipline.',
    whyItMatters:
      'Dormant credentials create silent attack surface. Access that is no longer needed should be removed or disabled quickly and documented.',
    evidenceCaptured: [
      'Updated login profile and access-key status for contractor.raj',
      'Group membership removal evidence',
      'Recorded deprovisioning approval and completion timestamps',
    ],
    questionnairePreview:
      'We identified an inactive IAM user with lingering access. The remediation plan disables console access, deactivates keys, removes group membership, and records the deprovisioning event as evidence for access-review controls.',
    remediation_code: `# Step 1: Disable console access
aws iam delete-login-profile --user-name contractor.raj

# Step 2: Deactivate the access key
# First get the key ID
aws iam list-access-keys --user-name contractor.raj

# Then deactivate it (replace KEY_ID with actual value)
aws iam update-access-key \\
  --user-name contractor.raj \\
  --access-key-id KEY_ID \\
  --status Inactive

# Step 3: Remove from all groups
aws iam list-groups-for-user --user-name contractor.raj
aws iam remove-user-from-group \\
  --user-name contractor.raj \\
  --group-name GROUP_NAME

# Step 4: Document in your access review log
# Record: user, date disabled, approver, reason`,
  },
]

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    border: '#ef4444',
    badge: { bg: '#2d1515', color: '#ef4444' },
  },
  high: {
    label: 'High',
    badge: { bg: '#2d1a0e', color: '#f97316' },
    border: '#f97316',
  },
  medium: {
    label: 'Medium',
    badge: { bg: '#2d2a0e', color: '#eab308' },
    border: '#eab308',
  },
  low: {
    label: 'Low',
    badge: { bg: '#1a1a2d', color: '#6366f1' },
    border: '#6366f1',
  },
}

const CONTROL_CONFIG = {
  CC6: { bg: '#1a1a2d', color: '#818cf8' },
  CC8: { bg: '#0e2218', color: '#34d399' },
}

const SOURCE_LABELS: Record<string, string> = {
  AWS_CREDENTIAL_REPORT: 'AWS Credential Report',
  AWS_ROOT_ACCOUNT: 'AWS Root Account',
  AWS_IAM_USERS: 'AWS IAM Users',
  AWS_PASSWORD_POLICY: 'AWS Password Policy',
  GITHUB_BRANCH_PROTECTION: 'GitHub Branch Protection',
}

const READINESS_PACKET = [
  'Executive summary of blockers by severity and control area',
  'Evidence index with timestamps and source systems',
  'Exact remediation payloads with approval history',
  'Questionnaire-ready answers tied to supporting evidence',
]

export default function DemoPage() {
  const [filter, setFilter] = useState<string>('all')
  const [activeGap, setActiveGap] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [resolved, setResolved] = useState<Set<number>>(new Set())

  const filtered = GAPS.filter((g) => {
    if (filter === 'all') return !resolved.has(g.id)
    if (filter === 'resolved') return resolved.has(g.id)
    return g.severity === filter && !resolved.has(g.id)
  })

  const counts = {
    critical: GAPS.filter((g) => g.severity === 'critical' && !resolved.has(g.id)).length,
    high: GAPS.filter((g) => g.severity === 'high' && !resolved.has(g.id)).length,
    medium: GAPS.filter((g) => g.severity === 'medium' && !resolved.has(g.id)).length,
    resolved: resolved.size,
  }

  const activeGapData = GAPS.find((g) => g.id === activeGap)

  function copyCode() {
    if (!activeGapData) return
    navigator.clipboard.writeText(activeGapData.remediation_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function markResolved(id: number) {
    setResolved((prev) => new Set([...prev, id]))
    setActiveGap(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        fontFamily: 'Inter, sans-serif',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          background: '#1a1500',
          borderBottom: '1px solid #3d3000',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              background: '#eab308',
              color: '#000',
              padding: '2px 8px',
              borderRadius: '20px',
            }}
          >
            DEMO
          </span>
          <span style={{ fontSize: '13px', color: '#aaa' }}>
            Sample workspace for Acme Corp — all findings are illustrative
          </span>
        </div>
        <Link
          href="/signup"
          style={{
            fontSize: '13px',
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Run this on your own AWS → Sign up free
        </Link>
      </div>

      <div
        style={{
          borderBottom: '1px solid #1a1a1a',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#ffffff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              background: '#6366f1',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          Talosly
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Acme Corp (demo)</span>
          <Link
            href="/signup"
            style={{
              fontSize: '13px',
              background: '#6366f1',
              color: '#fff',
              padding: '7px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Sign up free
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 500,
              color: '#ffffff',
              marginBottom: '4px',
            }}
          >
            Gap Findings
          </h1>
          <p style={{ fontSize: '14px', color: '#555' }}>
            Evidence collected from AWS IAM and GitHub · Acme Corp · Scanned today
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          {[
            { label: 'Critical', value: counts.critical, color: '#ef4444', bg: '#2d1515' },
            { label: 'High', value: counts.high, color: '#f97316', bg: '#2d1a0e' },
            { label: 'Medium', value: counts.medium, color: '#eab308', bg: '#2d2a0e' },
            { label: 'Resolved', value: counts.resolved, color: '#22c55e', bg: '#0e2d18' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                border: `1px solid ${s.color}33`,
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
            borderBottom: '1px solid #1a1a1a',
            paddingBottom: '0',
          }}
        >
          {[
            { key: 'all', label: 'All open' },
            { key: 'critical', label: 'Critical' },
            { key: 'high', label: 'High' },
            { key: 'medium', label: 'Medium' },
            { key: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                fontSize: '13px',
                padding: '8px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: filter === tab.key ? '2px solid #6366f1' : '2px solid transparent',
                color: filter === tab.key ? '#ffffff' : '#555',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#555',
            }}
          >
            {filter === 'resolved'
              ? 'No post-fix previews yet. Use "See post-fix evidence" on a finding to preview the resolved state.'
              : 'No findings in this category.'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((gap) => {
            const sev = SEVERITY_CONFIG[gap.severity as keyof typeof SEVERITY_CONFIG]
            const ctrl = CONTROL_CONFIG[gap.control as keyof typeof CONTROL_CONFIG]
            const isResolved = resolved.has(gap.id)

            return (
              <div
                key={gap.id}
                style={{
                  background: '#141414',
                  border: '1px solid #2a2a2a',
                  borderLeft: `4px solid ${isResolved ? '#22c55e' : sev.border}`,
                  borderRadius: '10px',
                  padding: '18px 20px',
                  opacity: isResolved ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: '20px',
                      background: ctrl.bg,
                      color: ctrl.color,
                    }}
                  >
                    {gap.control}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '2px 10px',
                      borderRadius: '20px',
                      background: sev.badge.bg,
                      color: sev.badge.color,
                    }}
                  >
                    {sev.label}
                  </span>
                  {gap.auto_remediable && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '2px 10px',
                        borderRadius: '20px',
                        background: '#1a1a2d',
                        color: '#6366f1',
                      }}
                    >
                      ⚡ Auto-fix available
                    </span>
                  )}
                  {isResolved && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '2px 10px',
                        borderRadius: '20px',
                        background: '#0e2d18',
                        color: '#22c55e',
                      }}
                    >
                      ✓ Resolved
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#ffffff',
                    marginBottom: '6px',
                  }}
                >
                  {gap.title}
                </p>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#888',
                    lineHeight: 1.6,
                    marginBottom: '10px',
                  }}
                >
                  {gap.finding}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#7c8bb8',
                    lineHeight: 1.5,
                    marginBottom: '14px',
                  }}
                >
                  Buyer impact: {gap.buyerImpact}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#444',
                      fontFamily: 'monospace',
                    }}
                  >
                    {SOURCE_LABELS[gap.source] || gap.source}
                  </span>

                  {!isResolved && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setActiveGap(gap.id)}
                        style={{
                          fontSize: '13px',
                          padding: '6px 14px',
                          background: 'transparent',
                          border: '1px solid #2a2a2a',
                          borderRadius: '7px',
                          color: '#aaa',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        View fix
                      </button>
                      <button
                        onClick={() => markResolved(gap.id)}
                        style={{
                          fontSize: '13px',
                          padding: '6px 14px',
                          background: 'transparent',
                          border: '1px solid #2a2a2a',
                          borderRadius: '7px',
                          color: '#aaa',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        See post-fix evidence
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div
          style={{
            marginTop: '28px',
            background: '#101014',
            border: '1px solid #23233a',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#6366f1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Sample readiness packet
          </p>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#ffffff',
              marginBottom: '8px',
            }}
          >
            Buyer-ready output, not just a list of problems
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '18px',
              maxWidth: '640px',
            }}
          >
            After the scan, Talosly packages the findings, evidence, remediation payloads, and questionnaire drafts into one working packet your team can use in the buyer thread.
          </p>
          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            }}
          >
            {READINESS_PACKET.map((item) => (
              <div
                key={item}
                style={{
                  background: '#141414',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '13px',
                  color: '#aaa',
                  lineHeight: 1.5,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '48px',
            background: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#6366f1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            This was a sample scan
          </p>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 500,
              color: '#ffffff',
              marginBottom: '10px',
            }}
          >
            Run this on your actual AWS and GitHub
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '24px',
              maxWidth: '460px',
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            Connect your real environment and see which of these gaps actually exist. Read-only
            credentials. No changes made without your approval.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/signup"
              style={{
                fontSize: '14px',
                background: '#6366f1',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '9px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Start free scan
            </Link>
            <Link
              href="/book"
              style={{
                fontSize: '14px',
                background: 'transparent',
                color: '#aaa',
                padding: '12px 28px',
                borderRadius: '9px',
                textDecoration: 'none',
                border: '1px solid #2a2a2a',
              }}
            >
              Talk to us first
            </Link>
          </div>
        </div>
      </div>

      {activeGap && activeGapData && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveGap(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '6px',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6366f1',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  Suggested fix · {activeGapData.remediation_type.toUpperCase()}
                </p>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#ffffff',
                  }}
                >
                  {activeGapData.remediation_title}
                </h3>
              </div>
              <button
                onClick={() => setActiveGap(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#555',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0 0 0 16px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '12px',
              }}
            >
              {activeGapData.title}
            </p>

            <div
              style={{
                background: '#101014',
                border: '1px solid #23233a',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '12px',
              }}
            >
              <p style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Why buyer security cares
              </p>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>
                {activeGapData.buyerImpact}
              </p>
            </div>

            <div
              style={{
                background: '#111111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Issue summary
              </p>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>
                {activeGapData.whyItMatters}
              </p>
            </div>

            <div
              style={{
                background: '#2d2a0e',
                border: '1px solid #3d3800',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#aaa',
                lineHeight: 1.5,
              }}
            >
              ⚠ Review this fix before running. Talosly generates the exact command — you approve
              and run it. Each approval is logged as timestamped audit evidence.
            </div>

            <div
              style={{
                background: '#111111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Evidence captured after remediation
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeGapData.evidenceCaptured.map((item) => (
                  <p key={item} style={{ fontSize: '13px', color: '#aaa', margin: 0, lineHeight: 1.5 }}>
                    • {item}
                  </p>
                ))}
              </div>
            </div>

            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '18px',
                overflowX: 'auto',
              }}
            >
              <pre
                style={{
                  fontSize: '12px',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  lineHeight: 1.7,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {activeGapData.remediation_code}
              </pre>
            </div>

            <div
              style={{
                background: '#101014',
                border: '1px solid #23233a',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '18px',
              }}
            >
              <p style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Questionnaire-answer preview
              </p>
              <p style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: 1.7, margin: 0 }}>
                {activeGapData.questionnairePreview}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={copyCode}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: copied ? '#22c55e' : '#aaa',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                {copied ? '✓ Copied' : 'Copy to clipboard'}
              </button>
              <button
                onClick={() => markResolved(activeGapData.id)}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                Preview resolved state
              </button>
            </div>

            <p
              style={{
                fontSize: '11px',
                color: '#444',
                textAlign: 'center',
                marginTop: '10px',
              }}
            >
              In the real product, approval is recorded with your name, timestamp, command hash, and refreshed evidence showing the post-fix state.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
