'use client'

import { useState } from "react";
import Link from "next/link";

type Finding = {
  id: string;
  severity: "critical" | "high" | "medium";
  control: "CC6" | "CC8";
  title: string;
  finding: string;
  fix: string;
};

const findings: Finding[] = [
  {
    id: "cc6-mfa",
    severity: "critical",
    control: "CC6",
    title: 'IAM user "dev@acmeco.com" has no MFA enabled',
    finding:
      'IAM user "dev@acmeco.com" has AWS console access enabled without any registered MFA device. This leaves privileged console access protected by only a password.',
    fix: `aws iam create-policy \\
  --policy-name RequireMFA \\
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Sid":"DenyWithoutMFA",
      "Effect":"Deny",
      "NotAction":[
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "sts:GetSessionToken"
      ],
      "Resource":"*",
      "Condition":{"BoolIfExists":{"aws:MultiFactorAuthPresent":"false"}}
    }]
  }'

aws iam attach-user-policy \\
  --user-name dev@acmeco.com \\
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA`
  },
  {
    id: "cc8-branch-protection",
    severity: "critical",
    control: "CC8",
    title: 'GitHub repo "acmeco/api" has no branch protection on main',
    finding:
      'The main branch in "acmeco/api" has no branch protection rules configured. Engineers can push directly to production without approval, review, or status checks.',
    fix: `curl -X PUT \\
  https://api.github.com/repos/acmeco/api/branches/main/protection \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true
    },
    "required_status_checks": {
      "strict": true,
      "contexts": []
    },
    "enforce_admins": true,
    "restrictions": null
  }'`
  },
  {
    id: "cc6-ex-employees",
    severity: "high",
    control: "CC6",
    title: "3 ex-employee IAM accounts still active",
    finding:
      "Three IAM users belonging to former employees still have active credentials and group membership. This creates lingering access risk and weakens offboarding controls.",
    fix: `aws iam delete-login-profile --user-name former.employee.1
aws iam update-access-key --user-name former.employee.1 --access-key-id KEY_ID_1 --status Inactive
aws iam remove-user-from-group --user-name former.employee.1 --group-name ENGINEERING

aws iam delete-login-profile --user-name former.employee.2
aws iam update-access-key --user-name former.employee.2 --access-key-id KEY_ID_2 --status Inactive

aws iam delete-login-profile --user-name former.employee.3
aws iam update-access-key --user-name former.employee.3 --access-key-id KEY_ID_3 --status Inactive`
  },
  {
    id: "cc8-codeowners",
    severity: "high",
    control: "CC8",
    title: "No CODEOWNERS file found in main repo",
    finding:
      'The primary repository does not contain a CODEOWNERS file. This means review ownership is not enforced for high-risk application changes.',
    fix: `mkdir -p .github
cat <<'EOF' > .github/CODEOWNERS
* @acmeco/platform-team
/api/ @acmeco/backend-team
/infra/ @acmeco/devops
EOF

git checkout -b chore/add-codeowners
git add .github/CODEOWNERS
git commit -m "Add CODEOWNERS for protected review paths"
git push origin chore/add-codeowners`
  },
  {
    id: "cc6-guardduty",
    severity: "medium",
    control: "CC6",
    title: "AWS GuardDuty not enabled in us-east-1",
    finding:
      "GuardDuty is not enabled in us-east-1. Threat detection coverage is missing in the region where AcmeCo runs core production workloads.",
    fix: `aws guardduty create-detector \\
  --enable \\
  --region us-east-1`
  }
];

const severityStyles = {
  critical: "border-red-500/50 bg-red-500/10 text-red-300",
  high: "border-orange-500/50 bg-orange-500/10 text-orange-300",
  medium: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
} satisfies Record<Finding["severity"], string>;

export default function SamplePage() {
  const [openId, setOpenId] = useState<string | null>(findings[0]?.id ?? null);

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4 text-sm text-indigo-100">
          This is a sample scan. Connect your AWS and GitHub to see your real findings.
        </div>

        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">Sample Workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">AcmeCo security scan</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#888888]">
              Fictional sample results from a startup running AWS IAM and GitHub. These findings show the type of blockers Talosly surfaces before a buyer security review.
            </p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] px-4 py-3 text-sm text-[#d4d4d8]">
            <p>AWS + GitHub</p>
            <p className="mt-1 text-[#888888]">5 findings • 2 critical • 2 high • 1 medium</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {findings.map((item) => {
            const isOpen = openId === item.id;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                    {item.control}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[item.severity]}`}>
                    {item.severity.toUpperCase()}
                  </span>
                </div>

                <h2 className="text-lg font-semibold leading-7 text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#a1a1aa]">{item.finding}</p>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="inline-flex items-center rounded-lg border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm font-medium text-indigo-300 transition hover:bg-[#181818] hover:text-white"
                  >
                    {isOpen ? "Hide fix" : "See fix"}
                  </button>
                </div>

                {isOpen ? (
                  <div className="mt-4 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#666666]">
                      Exact remediation
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-[#e4e4e7]">
                      {item.fix}
                    </pre>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-[#2a2a2a] bg-[#111111] px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Run scan on my real stack</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#888888]">
            Sign up to connect your real AWS and GitHub accounts, collect evidence, and see the actual blockers standing between your startup and enterprise deals.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Run scan on my real stack
          </Link>
        </div>
      </div>
    </main>
  );
}
