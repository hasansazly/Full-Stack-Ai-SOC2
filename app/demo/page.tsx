'use client'

import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  LayoutDashboard,
  PlayCircle,
  Shield,
  Wrench,
  X
} from "lucide-react";
import { toast } from "sonner";

import { ScanTerminal } from "@/components/scan-terminal";

type Severity = "critical" | "high" | "medium";

type Gap = {
  id: number;
  control: "CC6" | "CC8";
  severity: Severity;
  title: string;
  finding: string;
  source: string;
  collectedAt: string;
  autoRemediable: boolean;
  remediationType: "CLI" | "API" | "Manual";
  remediationCode: string;
};

type Policy = {
  id: string;
  title: string;
  controls: string;
  preview: string;
  body: string;
};

const DEMO_SCAN_LINES = [
  { text: "$ talosly scan --aws --github acme-corp", tone: "green" as const },
  { text: "Connecting to AWS IAM...", tone: "muted" as const },
  { text: "Connecting to GitHub org: acme-corp...", tone: "muted" as const },
  { text: "Collecting evidence artifacts...", tone: "muted" as const },
  { text: "⚠  CC6: 3 IAM users without MFA", tone: "yellow" as const },
  { text: "✗  CC6: Root account MFA not enabled", tone: "red" as const },
  { text: "✗  CC8: No branch protection on main", tone: "red" as const },
  { text: "⚠  CC6: AdministratorAccess on dev.bot", tone: "yellow" as const },
  { text: "✓  Remediation code generated for 3/4 gaps", tone: "green" as const },
  { text: "Evidence artifacts: 9 collected", tone: "white" as const },
  { text: "Audit trail: timestamped + SHA-256 hashed", tone: "white" as const },
  { text: "→ Run `talosly fix --approve` to remediate", tone: "indigo" as const }
];

const GAPS: Gap[] = [
  {
    id: 1,
    control: "CC6",
    severity: "critical",
    source: "AWS_CREDENTIAL_REPORT",
    collectedAt: "Collected 2 min ago",
    title: "3 IAM users with console access and no MFA",
    finding:
      "IAM users sarah.chen, dev.bot, and james.wong have AWS Console password login enabled but zero MFA devices registered. A compromised password gives full console access with no second factor. SOC 2 CC6 requires MFA for all users with console access.",
    autoRemediable: true,
    remediationType: "CLI",
    remediationCode: `aws iam create-policy \\
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

aws iam attach-user-policy --user-name sarah.chen --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA
aws iam attach-user-policy --user-name dev.bot --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA
aws iam attach-user-policy --user-name james.wong --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA`
  },
  {
    id: 2,
    control: "CC6",
    severity: "critical",
    source: "AWS_ROOT_ACCOUNT",
    collectedAt: "Collected 2 min ago",
    title: "Root account MFA not enabled",
    finding:
      "The AWS root account has no MFA device registered and was last accessed 12 days ago. Root account compromise gives unrestricted access to every resource in the account with no recovery path.",
    autoRemediable: false,
    remediationType: "Manual",
    remediationCode: `1. Sign in to AWS Console as the root account
2. Open IAM → Security credentials
3. Under Multi-factor authentication (MFA), click Assign MFA device
4. Choose Authenticator app and scan the QR code
5. Enter two consecutive 6-digit codes
6. Sign out and verify root login now requires MFA`
  },
  {
    id: 3,
    control: "CC6",
    severity: "high",
    source: "AWS_IAM_USERS",
    collectedAt: "Collected 2 min ago",
    title: "AdministratorAccess directly on IAM user",
    finding:
      "IAM user dev.bot has the AWS-managed AdministratorAccess policy attached directly. This violates the principle of least privilege. SOC 2 CC6 requires access grants to be reviewed and approved.",
    autoRemediable: true,
    remediationType: "CLI",
    remediationCode: `aws iam detach-user-policy \\
  --user-name dev.bot \\
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

aws iam create-group --group-name Developers
aws iam attach-group-policy --group-name Developers --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
aws iam add-user-to-group --user-name dev.bot --group-name Developers`
  },
  {
    id: 4,
    control: "CC6",
    severity: "high",
    source: "AWS_PASSWORD_POLICY",
    collectedAt: "Collected 2 min ago",
    title: "No IAM account password policy",
    finding:
      "No account-level password policy is configured. Users can set passwords of any length with no complexity, rotation, or reuse requirements.",
    autoRemediable: true,
    remediationType: "CLI",
    remediationCode: `aws iam update-account-password-policy \\
  --minimum-password-length 14 \\
  --require-symbols \\
  --require-numbers \\
  --require-uppercase-characters \\
  --require-lowercase-characters \\
  --allow-users-to-change-password \\
  --max-password-age 90 \\
  --password-reuse-prevention 10`
  },
  {
    id: 5,
    control: "CC8",
    severity: "critical",
    source: "GITHUB_BRANCH_PROTECTION",
    collectedAt: "Collected 1 min ago",
    title: "No branch protection on main",
    finding:
      "The main branch of acme-corp/api-service has no protection rules. Any team member can push directly to production without review, approval, or automated testing. This is the highest-risk CC8 finding.",
    autoRemediable: true,
    remediationType: "API",
    remediationCode: `curl -X PUT \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false
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
    id: 6,
    control: "CC8",
    severity: "high",
    source: "GITHUB_BRANCH_PROTECTION",
    collectedAt: "Collected 1 min ago",
    title: "Admins bypass branch protection",
    finding:
      "enforce_admins is false. The 3 repository admins can merge to main without any review, bypassing the two-person integrity requirement in SOC 2 CC8.",
    autoRemediable: true,
    remediationType: "API",
    remediationCode: `curl -X POST \\
  https://api.github.com/repos/acme-corp/api-service/branches/main/protection/enforce_admins \\
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github+json"`
  },
  {
    id: 7,
    control: "CC8",
    severity: "medium",
    source: "GITHUB_BRANCH_PROTECTION",
    collectedAt: "Collected 1 min ago",
    title: "Stale reviews not dismissed on new commits",
    finding:
      "dismiss_stale_reviews is false. A developer can get approval, push breaking changes afterward, and the original approval still counts.",
    autoRemediable: true,
    remediationType: "API",
    remediationCode: `curl -X PUT \\
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
  }'`
  },
  {
    id: 8,
    control: "CC6",
    severity: "medium",
    source: "AWS_CREDENTIAL_REPORT",
    collectedAt: "Collected 2 min ago",
    title: "Inactive IAM user not deprovisioned",
    finding:
      "IAM user contractor.raj has not logged in for 127 days and has an active access key last used 134 days ago. Inactive accounts represent orphaned access that violates CC6 quarterly access review requirements.",
    autoRemediable: true,
    remediationType: "CLI",
    remediationCode: `aws iam delete-login-profile --user-name contractor.raj
aws iam list-access-keys --user-name contractor.raj
aws iam update-access-key --user-name contractor.raj --access-key-id KEY_ID --status Inactive`
  }
];

const POLICIES: Policy[] = [
  {
    id: "information-security",
    title: "Information Security Policy",
    controls: "CC1, CC2",
    preview:
      "This policy defines the baseline administrative, technical, and organizational safeguards the company uses to protect customer data and core systems.",
    body:
      "Information Security Policy v1.0\nEffective: Today\nOwner: CTO\n\nThis policy establishes the baseline administrative, technical, and organizational safeguards used to protect systems, data, and infrastructure. The company will maintain access reviews, change approvals, evidence collection, and incident response procedures aligned to customer security requirements and SOC 2 expectations."
  },
  {
    id: "access-control",
    title: "Access Control Policy",
    controls: "CC6",
    preview:
      "Generated from IAM evidence, MFA findings, direct admin grants, and dormant-user access review gaps.",
    body:
      "Access Control Policy v1.0\nEffective: Today\nOwner: CTO\n\n1. Purpose\nThis policy establishes requirements for granting, reviewing, and revoking access to all company systems in alignment with SOC 2 CC6.\n\n2. Principle of Least Privilege\nAll system access shall be granted based on job function. No user shall receive more access than required for their role. Administrative access requires written approval from the CTO and shall be attached via IAM groups, not directly to user accounts.\n\n3. MFA Requirement\nAll IAM users with AWS Console access must have a registered MFA device. Access without MFA is prohibited. Enforcement is automated via the RequireMFA IAM policy.\n\n4. Access Reviews\nAll system access shall be reviewed quarterly. Any account inactive for more than 90 days shall be disabled pending review.\n\n5. Offboarding\nUpon termination, all system access shall be revoked within 4 business hours of HR confirmation."
  },
  {
    id: "change-management",
    title: "Change Management Policy",
    controls: "CC8",
    preview:
      "Generated from GitHub branch protection evidence, stale review settings, and administrative bypass findings.",
    body:
      "Change Management Policy v1.0\nEffective: Today\nOwner: CTO\n\nAll production-bound changes must flow through pull requests, peer review, and automated status checks. Branch protection shall be enabled on the default branch, stale reviews shall be dismissed on new commits, and administrators shall not bypass the same review requirements enforced for the rest of the engineering team."
  }
];

const severityStyles: Record<Severity, { label: string; color: string; tint: string }> = {
  critical: { label: "Critical", color: "var(--red)", tint: "rgba(239,68,68,0.12)" },
  high: { label: "High", color: "var(--orange)", tint: "rgba(249,115,22,0.12)" },
  medium: { label: "Medium", color: "var(--yellow)", tint: "rgba(234,179,8,0.12)" }
};

const sourceLabels: Record<string, string> = {
  AWS_CREDENTIAL_REPORT: "AWS_CREDENTIAL_REPORT",
  AWS_ROOT_ACCOUNT: "AWS_ROOT_ACCOUNT",
  AWS_IAM_USERS: "AWS_IAM_USERS",
  AWS_PASSWORD_POLICY: "AWS_PASSWORD_POLICY",
  GITHUB_BRANCH_PROTECTION: "GITHUB_BRANCH_PROTECTION"
};

const controlMatrix = [
  ["CC1", "Control Environment", "Not scanned", "—", "—", "—"],
  ["CC2", "Communication", "Not scanned", "—", "—", "—"],
  ["CC3", "Risk Assessment", "Not scanned", "—", "—", "—"],
  ["CC4", "Monitoring", "Not scanned", "—", "—", "—"],
  ["CC5", "Control Activities", "Not scanned", "—", "—", "—"],
  ["CC6", "Logical Access", "5 gaps", "5 artifacts", "5", "View gaps"],
  ["CC7", "System Operations", "Not scanned", "—", "—", "—"],
  ["CC8", "Change Management", "3 gaps", "4 artifacts", "3", "View gaps"],
  ["CC9", "Risk Mitigation", "Not scanned", "—", "—", "—"]
] as const;

function downloadPolicy(title: string, body: string) {
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DemoPage() {
  const [filter, setFilter] = useState<"all" | Severity | "resolved">("all");
  const [activeGapId, setActiveGapId] = useState<number | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanTab, setScanTab] = useState("demo");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  const [showAwsSecret, setShowAwsSecret] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);

  const activeGap = GAPS.find((gap) => gap.id === activeGapId) ?? null;

  const filteredGaps = useMemo(() => {
    if (filter === "resolved") {
      return GAPS.filter((gap) => resolvedIds.has(gap.id));
    }
    return GAPS.filter((gap) => {
      if (resolvedIds.has(gap.id)) return false;
      if (filter === "all") return true;
      return gap.severity === filter;
    });
  }, [filter, resolvedIds]);

  const counts = {
    critical: GAPS.filter((gap) => gap.severity === "critical" && !resolvedIds.has(gap.id)).length,
    high: GAPS.filter((gap) => gap.severity === "high" && !resolvedIds.has(gap.id)).length,
    evidence: 9,
    remediated: resolvedIds.size
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "resolved", label: "Resolved" }
  ] as const;

  const startDemoScan = () => {
    setScanning(true);
    setScanProgress(0);

    const started = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const next = Math.min(100, Math.round((elapsed / 4000) * 100));
      setScanProgress(next);
      if (next >= 100) {
        window.clearInterval(interval);
        setScanning(false);
        setScanModalOpen(false);
        toast.success("Scan complete — 6 gaps found");
      }
    }, 120);
  };

  const handleCopy = async () => {
    if (!activeGap) return;
    await navigator.clipboard.writeText(activeGap.remediationCode);
    setCopied(true);
    toast.success("Copied to clipboard");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const markResolved = (id: number) => {
    setResolvedIds((previous) => new Set(previous).add(id));
    toast.success("Logged as approved evidence");
    setActiveGapId(null);
  };

  const togglePolicy = (id: string) => {
    setExpandedPolicies((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--bg)]"
    >
      <div className="sticky top-14 z-40 flex h-10 items-center justify-between border-b border-[#3d2800] bg-[#1a1000] px-5 text-[13px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[var(--yellow)] px-2 py-0.5 text-[11px] font-semibold text-black">DEMO</span>
          <span>Acme Corp workspace</span>
        </div>
        <Link href="/signup" className="font-medium text-[var(--indigo)]">
          Run on your AWS → Sign up free
        </Link>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
        <aside className="border-b border-[var(--border)] bg-[var(--bg-card)] md:sticky md:top-24 md:h-[calc(100vh-96px)] md:w-[220px] md:flex-shrink-0 md:border-b-0 md:border-r">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--indigo)] text-sm font-semibold text-white">
                AC
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Acme Corp</p>
                <p className="text-xs text-[var(--text-muted)]">Demo workspace</p>
              </div>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
            {[
              { href: "#overview", label: "Overview", icon: LayoutDashboard, active: true },
              { href: "#gaps", label: "Gap Findings", icon: AlertTriangle, badge: "8" },
              { href: "#overview", label: "Evidence", icon: Shield },
              { href: "#gaps", label: "Remediation", icon: Wrench },
              { href: "#policies", label: "Policies", icon: FileText }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-r-[var(--radius)] px-4 py-3 text-sm transition ${
                    item.active
                      ? "border-l-2 border-[var(--indigo)] bg-[var(--indigo-dim)] text-[var(--indigo)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-[rgba(239,68,68,0.16)] px-2 py-0.5 text-xs text-[var(--red)]">
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
          <div className="px-4 pb-4 pt-2 md:mt-auto">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-[var(--radius)] bg-[var(--indigo)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--indigo-hover)]"
            >
              Run on your stack
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-8 sm:px-6">
          <section id="overview">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Security Overview</h1>
                  <div className="flex items-center gap-2 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] px-3 py-1 text-xs text-[var(--green)]">
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                      <span className="pulse-ring" />
                      <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                    </span>
                    Live scan mode
                  </div>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Last scanned: just now</p>
              </div>
              <button
                onClick={() => setScanModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--indigo)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--indigo-hover)]"
              >
                <PlayCircle className="h-4 w-4" />
                Run New Scan
              </button>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {[
                { label: "Critical gaps", value: counts.critical, tone: "var(--red)", tint: "rgba(239,68,68,0.08)", trend: "Top blockers this scan" },
                { label: "High gaps", value: counts.high, tone: "var(--orange)", tint: "rgba(249,115,22,0.08)", trend: "Operational follow-up needed" },
                { label: "Evidence items", value: counts.evidence, tone: "var(--indigo)", tint: "rgba(99,102,241,0.08)", trend: "Hashed + timestamped" },
                { label: "Remediated", value: counts.remediated, tone: "var(--green)", tint: "rgba(34,197,94,0.08)", trend: "Vs last scan" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5"
                  style={{ borderTop: `2px solid ${item.tone}`, backgroundColor: item.tint }}
                >
                  <p className="text-4xl font-semibold text-[var(--text-primary)]">{item.value}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.label}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">{item.trend}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">SOC 2 Control Status</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[var(--bg-subtle)] text-left text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Control</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Evidence</th>
                      <th className="px-4 py-3 font-medium">Gaps</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controlMatrix.map((row) => (
                      <tr key={row[0]} className="border-t border-[var(--border)] hover:bg-[var(--bg-hover)]">
                        <td className="px-4 py-4 text-[var(--text-primary)]">{row[0]}</td>
                        <td className="px-4 py-4 text-[var(--text-secondary)]">{row[1]}</td>
                        <td className="px-4 py-4">
                          <span
                            className="rounded-full px-3 py-1 text-xs"
                            style={{
                              background:
                                row[2] === "5 gaps"
                                  ? "rgba(239,68,68,0.12)"
                                  : row[2] === "3 gaps"
                                    ? "rgba(249,115,22,0.12)"
                                    : "rgba(255,255,255,0.04)",
                              color:
                                row[2] === "5 gaps"
                                  ? "var(--red)"
                                  : row[2] === "3 gaps"
                                    ? "var(--orange)"
                                    : "var(--text-secondary)"
                            }}
                          >
                            {row[2]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[var(--text-secondary)]">{row[3]}</td>
                        <td className="px-4 py-4 text-[var(--text-secondary)]">{row[4]}</td>
                        <td className="px-4 py-4">
                          {row[5] === "View gaps" ? (
                            <a href="#gaps" className="text-sm text-[var(--indigo)] hover:bg-[var(--indigo-dim)] hover:px-2 hover:py-1 hover:rounded-[var(--radius-sm)]">
                              View gaps
                            </a>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="gaps" className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Gap Findings</h2>
                <span className="rounded-full bg-[var(--indigo-dim)] px-3 py-1 text-xs text-[var(--indigo)]">{GAPS.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      filter === tab.key
                        ? "bg-[var(--indigo-dim)] text-[var(--indigo)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredGaps.map((gap) => {
                const severity = severityStyles[gap.severity];
                const isResolved = resolvedIds.has(gap.id);

                return (
                  <div
                    key={gap.id}
                    className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-5"
                    style={{ borderLeft: `3px solid ${isResolved ? "var(--green)" : severity.color}` }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--indigo-dim)] px-3 py-1 text-xs text-[var(--indigo)]">{gap.control}</span>
                        <span className="rounded-full px-3 py-1 text-xs" style={{ background: severity.tint, color: severity.color }}>
                          {severity.label}
                        </span>
                        {gap.autoRemediable ? (
                          <span className="rounded-full border border-[var(--border-bright)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                            Auto-fix available
                          </span>
                        ) : null}
                        {isResolved ? (
                          <span className="rounded-full bg-[rgba(34,197,94,0.1)] px-3 py-1 text-xs text-[var(--green)]">Resolved</span>
                        ) : null}
                      </div>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{sourceLabels[gap.source]}</span>
                    </div>
                    <p className="mt-4 text-[15px] font-medium text-[var(--text-primary)]">{gap.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{gap.finding}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-[var(--text-muted)]">{gap.collectedAt}</span>
                      {isResolved ? null : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveGapId(gap.id)}
                            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--indigo)] transition hover:bg-[var(--indigo-dim)]"
                          >
                            View fix
                          </button>
                          <button
                            onClick={() => markResolved(gap.id)}
                            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                          >
                            Mark resolved
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="policies" className="mt-12">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">AI-Generated Policies</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                SOC 2 requires written policies. These are generated from your actual infrastructure state.
              </p>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {POLICIES.map((policy) => {
                const expanded = expandedPolicies.has(policy.id);

                return (
                  <div key={policy.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-medium text-[var(--text-primary)]">{policy.title}</p>
                      <span className="rounded-full bg-[rgba(34,197,94,0.1)] px-3 py-1 text-xs text-[var(--green)]">Generated</span>
                    </div>
                    <p className="mt-3 text-xs text-[var(--text-muted)]">Last updated: today</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Controls: {policy.controls}</p>
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--text-secondary)]">{policy.preview}</p>
                    {expanded ? (
                      <pre className="mt-4 whitespace-pre-wrap rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 text-xs leading-7 text-[var(--text-secondary)]">
                        {policy.body}
                      </pre>
                    ) : null}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => togglePolicy(policy.id)}
                        className="rounded-[var(--radius-sm)] border border-[var(--border-bright)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
                      >
                        {expanded ? "Hide policy" : "View full policy"}
                      </button>
                      <button
                        onClick={() => downloadPolicy(policy.title, policy.body)}
                        className="rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      >
                        Download .md
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-12 rounded-[20px] border border-[var(--border)] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_65%)] px-8 py-14 text-center">
            <p className="text-sm text-[var(--text-secondary)]">This was a demo scan against sample data.</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
              Connect your real AWS and GitHub to see your actual gaps.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-[var(--radius)] bg-[var(--indigo)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--indigo-hover)]"
              >
                Sign up free →
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center rounded-[var(--radius)] border border-[var(--border-bright)] px-5 py-3 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
              >
                Book a call →
              </Link>
            </div>
          </section>
        </div>
      </div>

      {activeGap ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.7)] px-4 backdrop-blur-[4px]">
          <div className="max-h-[80vh] w-full max-w-[640px] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-bright)] bg-[var(--bg-card)] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--indigo-dim)] px-3 py-1 text-xs text-[var(--indigo)]">{activeGap.control}</span>
                  <span
                    className="rounded-full px-3 py-1 text-xs"
                    style={{ background: severityStyles[activeGap.severity].tint, color: severityStyles[activeGap.severity].color }}
                  >
                    {severityStyles[activeGap.severity].label}
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                    {activeGap.remediationType}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-medium text-[var(--text-primary)]">{activeGap.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{activeGap.finding}</p>
              </div>
              <button
                onClick={() => setActiveGapId(null)}
                className="rounded-full p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-[var(--radius-sm)] border border-[#3d3000] bg-[#1a1500] px-4 py-3 text-sm text-[#aaa]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--yellow)]" />
                <p>Review before running. Every approval is logged as timestamped audit evidence with your name attached.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[#050505] p-5">
              <div className="mb-3 flex justify-end">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[var(--green)]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-h-[320px] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-7 text-[#e2e8f0]">
                {activeGap.remediationCode}
              </pre>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex flex-1 items-center justify-center rounded-[var(--radius)] border border-[var(--border-bright)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
              >
                Copy command
              </button>
              <button
                onClick={() => markResolved(activeGap.id)}
                className={`inline-flex flex-1 items-center justify-center rounded-[var(--radius)] px-4 py-3 text-sm font-medium text-white transition ${
                  resolvedIds.has(activeGap.id) ? "bg-[rgba(34,197,94,0.12)] text-[var(--green)]" : "bg-[var(--indigo)] hover:bg-[var(--indigo-hover)]"
                }`}
              >
                {resolvedIds.has(activeGap.id) ? "Approved · Logged as evidence" : "Log as approved ✓"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {scanModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.7)] px-4 backdrop-blur-[4px]">
          <div className="w-full max-w-[520px] rounded-[var(--radius-lg)] border border-[var(--border-bright)] bg-[var(--bg-card)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-medium text-[var(--text-primary)]">Run Compliance Scan</h3>
              <button
                onClick={() => setScanModalOpen(false)}
                className="rounded-full p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Tabs.Root value={scanTab} onValueChange={setScanTab} className="mt-6">
              <Tabs.List className="flex rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-1">
                <Tabs.Trigger
                  value="demo"
                  className="flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)]"
                >
                  Demo scan
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="real"
                  className="flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)]"
                >
                  Connect real AWS + GitHub
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="demo" className="mt-6">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  See a scan run against Acme Corp sample data. No credentials required.
                </p>
                <div className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-sm text-[var(--text-primary)]">Company</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Acme Corp</p>
                </div>
                {scanning ? (
                  <div className="mt-6 space-y-4">
                    <ScanTerminal lines={DEMO_SCAN_LINES} compact title="talosly — demo scan" />
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                      <div className="h-full bg-[var(--indigo)] transition-all" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                ) : null}
                <button
                  onClick={startDemoScan}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius)] bg-[var(--indigo)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--indigo-hover)]"
                >
                  Run demo scan
                </button>
              </Tabs.Content>

              <Tabs.Content value="real" className="mt-6">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Your credentials are used once for this scan only. Never stored. Read-only IAM access only.
                </p>
                <div className="mt-4 space-y-3">
                  <input className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)]" placeholder="AWS Access Key ID" />
                  <div className="flex gap-2">
                    <input
                      type={showAwsSecret ? "text" : "password"}
                      className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)]"
                      placeholder="AWS Secret Access Key"
                    />
                    <button
                      onClick={() => setShowAwsSecret((current) => !current)}
                      className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-xs text-[var(--text-secondary)]"
                    >
                      {showAwsSecret ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={showGithubToken ? "text" : "password"}
                      className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)]"
                      placeholder="GitHub Personal Access Token"
                    />
                    <button
                      onClick={() => setShowGithubToken((current) => !current)}
                      className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-xs text-[var(--text-secondary)]"
                    >
                      {showGithubToken ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)]" placeholder="GitHub Organization name" />
                  <input className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)]" placeholder="GitHub Repository name" />
                </div>
                <details className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--text-secondary)]">
                  <summary className="cursor-pointer text-[var(--text-primary)]">What permissions do we need?</summary>
                  <div className="mt-3 space-y-2">
                    <p>AWS: SecurityAudit managed policy (read-only)</p>
                    <p>GitHub: repo:read, admin:org:read</p>
                  </div>
                </details>
                <button
                  onClick={() =>
                    toast("Sign up to run on your real AWS", {
                      action: {
                        label: "Sign up",
                        onClick: () => {
                          window.location.href = "/signup";
                        }
                      }
                    })
                  }
                  className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius)] bg-[var(--indigo)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--indigo-hover)]"
                >
                  Run real scan
                </button>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      ) : null}
    </motion.main>
  );
}
