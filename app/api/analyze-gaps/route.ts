import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

type EvidenceArtifact = {
  id: string;
  client_id: string | null;
  control?: string | null;
  source?: string | null;
  collected_at: string;
  raw_content?: string | null;
};

type AiGap = {
  control: "CC6" | "CC8";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  finding: string;
  evidence_source: string;
  auto_remediable: boolean;
  remediation_type: "cli" | "api" | "policy" | "manual";
  remediation_title: string;
  remediation_code: string;
};

async function authenticateClient(clientId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client?.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { clientId: client.id };
}

function parseJsonSafely<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function isRecent(dateString: string | undefined, days: number) {
  if (!dateString || dateString === "N/A" || dateString === "no_information") return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return date >= daysAgo(days);
}

function isOlderThan(dateString: string | undefined, days: number) {
  if (!dateString || dateString === "N/A" || dateString === "no_information") return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return date < daysAgo(days);
}

function deterministicAnalyze(artifacts: EvidenceArtifact[]): AiGap[] {
  const gaps: AiGap[] = [];
  const credentialReport = parseJsonSafely<Array<Record<string, string>>>(
    artifacts.find((artifact) => artifact.source === "AWS_CREDENTIAL_REPORT")?.raw_content,
  ) ?? [];
  const iamUsers = parseJsonSafely<
    Array<{ username: string; attached_policies: string[]; mfa_device_count: number }>
  >(artifacts.find((artifact) => artifact.source === "AWS_IAM_USERS")?.raw_content) ?? [];
  const passwordPolicy = parseJsonSafely<Record<string, unknown>>(
    artifacts.find((artifact) => artifact.source === "AWS_PASSWORD_POLICY")?.raw_content,
  );
  const rootAccount = parseJsonSafely<{
    root_mfa_active: boolean;
    root_last_used: string;
    root_access_key_active: boolean;
  }>(artifacts.find((artifact) => artifact.source === "AWS_ROOT_ACCOUNT")?.raw_content);
  const branchProtection = parseJsonSafely<Record<string, unknown>>(
    artifacts.find((artifact) => artifact.source === "GITHUB_BRANCH_PROTECTION")?.raw_content,
  );
  const pullRequests = parseJsonSafely<
    Array<{ number: number; title: string; merged_at: string | null; requested_reviewers: string[]; review_comments: number }>
  >(artifacts.find((artifact) => artifact.source === "GITHUB_PULL_REQUESTS")?.raw_content) ?? [];
  const codeowners = parseJsonSafely<{ exists: boolean; path: string | null }>(
    artifacts.find((artifact) => artifact.source === "GITHUB_CODEOWNERS")?.raw_content,
  );

  for (const row of credentialReport) {
    if (row.user !== "<root_account>" && row.password_enabled === "true" && row.mfa_active === "false") {
      gaps.push({
        control: "CC6",
        severity: "critical",
        title: "IAM users without MFA",
        finding: `IAM user ${row.user} has console access enabled but no MFA device registered.`,
        evidence_source: "AWS_CREDENTIAL_REPORT",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_title: "Enforce MFA for IAM user",
        remediation_code:
          `aws iam create-policy --policy-name RequireMFA --policy-document file://require-mfa-policy.json\naws iam attach-user-policy --user-name ${row.user} --policy-arn arn:aws:iam::ACCOUNT_ID:policy/RequireMFA`,
      });
    }

    const inactivePassword = isOlderThan(row.password_last_used, 90);
    const inactiveKey1 = isOlderThan(row.access_key_1_last_used_date, 90);
    const inactiveKey2 = isOlderThan(row.access_key_2_last_used_date, 90);
    if (
      row.user !== "<root_account>" &&
      (inactivePassword || inactiveKey1 || inactiveKey2) &&
      row.password_enabled === "true"
    ) {
      gaps.push({
        control: "CC6",
        severity: "medium",
        title: "Inactive IAM user",
        finding: `IAM user ${row.user} has not shown password or access-key activity within the last 90 days.`,
        evidence_source: "AWS_CREDENTIAL_REPORT",
        auto_remediable: false,
        remediation_type: "manual",
        remediation_title: "Review or disable inactive user",
        remediation_code:
          `1. Review whether ${row.user} still requires access\n2. Disable or remove unused credentials\n3. Document the access review decision`,
      });
    }
  }

  if (rootAccount) {
    if (!rootAccount.root_mfa_active) {
      gaps.push({
        control: "CC6",
        severity: "critical",
        title: "Root account MFA not enabled",
        finding: "The AWS root account does not have MFA enabled.",
        evidence_source: "AWS_ROOT_ACCOUNT",
        auto_remediable: false,
        remediation_type: "manual",
        remediation_title: "Enable root MFA",
        remediation_code:
          "1. Sign in to AWS Console as root\n2. Go to IAM → Security credentials\n3. Under Multi-factor authentication (MFA) click Assign MFA device\n4. Complete setup with a virtual or hardware MFA device",
      });
    }

    if (isRecent(rootAccount.root_last_used, 90)) {
      gaps.push({
        control: "CC6",
        severity: "critical",
        title: "Root account recently used",
        finding: `The AWS root account was used on ${rootAccount.root_last_used}.`,
        evidence_source: "AWS_ROOT_ACCOUNT",
        auto_remediable: false,
        remediation_type: "manual",
        remediation_title: "Stop routine root usage",
        remediation_code:
          "1. Move operational access to named IAM roles\n2. Rotate any root credentials if usage was unexpected\n3. Restrict root account use to break-glass procedures only",
      });
    }

    if (rootAccount.root_access_key_active) {
      gaps.push({
        control: "CC6",
        severity: "critical",
        title: "Root access keys active",
        finding: "The AWS root account has active access keys.",
        evidence_source: "AWS_ROOT_ACCOUNT",
        auto_remediable: false,
        remediation_type: "manual",
        remediation_title: "Delete root access keys",
        remediation_code:
          "1. Sign in as root\n2. Open Security credentials\n3. Delete all active root access keys\n4. Use IAM roles for programmatic access instead",
      });
    }
  }

  for (const user of iamUsers) {
    if (user.attached_policies.includes("AdministratorAccess")) {
      gaps.push({
        control: "CC6",
        severity: "high",
        title: "Direct AdministratorAccess on user",
        finding: `IAM user ${user.username} has AdministratorAccess policy attached directly to the user account, violating least privilege.`,
        evidence_source: "AWS_IAM_USERS",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_title: "Remove direct admin policy",
        remediation_code:
          `aws iam detach-user-policy --user-name ${user.username} --policy-arn arn:aws:iam::aws:policy/AdministratorAccess`,
      });
    }
  }

  if (!passwordPolicy || (passwordPolicy.exists === false)) {
    gaps.push({
      control: "CC6",
      severity: "high",
      title: "No IAM password policy",
      finding: "No account-level IAM password policy is configured.",
      evidence_source: "AWS_PASSWORD_POLICY",
      auto_remediable: true,
      remediation_type: "cli",
      remediation_title: "Set password policy",
      remediation_code:
        "aws iam update-account-password-policy --minimum-password-length 14 --require-symbols --require-numbers --require-uppercase-characters --require-lowercase-characters --allow-users-to-change-password --max-password-age 90 --password-reuse-prevention 10",
    });
  } else {
    const minimumLength = Number(passwordPolicy.MinimumPasswordLength ?? 0);
    const requiresUppercase = Boolean(passwordPolicy.RequireUppercaseCharacters);
    const requiresLowercase = Boolean(passwordPolicy.RequireLowercaseCharacters);
    const requiresNumbers = Boolean(passwordPolicy.RequireNumbers);
    const requiresSymbols = Boolean(passwordPolicy.RequireSymbols);

    if (minimumLength < 14) {
      gaps.push({
        control: "CC6",
        severity: "medium",
        title: "Weak minimum password length",
        finding: `IAM password policy minimum length is ${minimumLength}, below the recommended threshold of 14.`,
        evidence_source: "AWS_PASSWORD_POLICY",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_title: "Increase password length",
        remediation_code:
          "aws iam update-account-password-policy --minimum-password-length 14 --require-symbols --require-numbers --require-uppercase-characters --require-lowercase-characters",
      });
    }

    if (!requiresUppercase || !requiresLowercase || !requiresNumbers || !requiresSymbols) {
      gaps.push({
        control: "CC6",
        severity: "medium",
        title: "Password policy missing complexity rules",
        finding: "IAM password policy does not require uppercase, lowercase, numbers, and symbols.",
        evidence_source: "AWS_PASSWORD_POLICY",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_title: "Require password complexity",
        remediation_code:
          "aws iam update-account-password-policy --minimum-password-length 14 --require-symbols --require-numbers --require-uppercase-characters --require-lowercase-characters",
      });
    }
  }

  if (!branchProtection || branchProtection.configured === false) {
    gaps.push({
      control: "CC8",
      severity: "critical",
      title: "No branch protection on main",
      finding: "The main branch has no protection rules configured.",
      evidence_source: "GITHUB_BRANCH_PROTECTION",
      auto_remediable: true,
      remediation_type: "api",
      remediation_title: "Enable branch protection",
      remediation_code:
        "curl -X PUT https://api.github.com/repos/ORG/REPO/branches/main/protection \\\n  -H 'Authorization: Bearer YOUR_TOKEN' \\\n  -H 'Accept: application/vnd.github+json' \\\n  -d '{\"required_pull_request_reviews\":{\"required_approving_review_count\":1,\"dismiss_stale_reviews\":true,\"require_code_owner_reviews\":false},\"required_status_checks\":{\"strict\":true,\"contexts\":[]},\"enforce_admins\":true,\"restrictions\":null}'",
    });
  } else {
    const requiredPullRequestReviews = branchProtection.required_pull_request_reviews as Record<string, unknown> | null | undefined;
    const enforceAdmins = branchProtection.enforce_admins as { enabled?: boolean } | undefined;

    if (!requiredPullRequestReviews) {
      gaps.push({
        control: "CC8",
        severity: "critical",
        title: "No pull request review requirement",
        finding: "Branch protection is configured, but required pull request reviews are missing.",
        evidence_source: "GITHUB_BRANCH_PROTECTION",
        auto_remediable: true,
        remediation_type: "api",
        remediation_title: "Require PR reviews",
        remediation_code:
          "curl -X PUT https://api.github.com/repos/ORG/REPO/branches/main/protection -H 'Authorization: Bearer YOUR_TOKEN' -H 'Accept: application/vnd.github+json' -d '{\"required_pull_request_reviews\":{\"required_approving_review_count\":1,\"dismiss_stale_reviews\":true},\"enforce_admins\":true,\"required_status_checks\":{\"strict\":true,\"contexts\":[]},\"restrictions\":null}'",
      });
    } else {
      const reviewCount = Number(requiredPullRequestReviews.required_approving_review_count ?? 0);
      const dismissStale = Boolean(requiredPullRequestReviews.dismiss_stale_reviews);
      const requireCodeOwnerReviews = Boolean(requiredPullRequestReviews.require_code_owner_reviews);

      if (reviewCount < 1) {
        gaps.push({
          control: "CC8",
          severity: "critical",
          title: "No approvals required on main",
          finding: "Main branch protection does not require at least one approving review.",
          evidence_source: "GITHUB_BRANCH_PROTECTION",
          auto_remediable: true,
          remediation_type: "api",
          remediation_title: "Require one approval",
          remediation_code:
            "curl -X PUT https://api.github.com/repos/ORG/REPO/branches/main/protection -H 'Authorization: Bearer YOUR_TOKEN' -H 'Accept: application/vnd.github+json' -d '{\"required_pull_request_reviews\":{\"required_approving_review_count\":1,\"dismiss_stale_reviews\":true},\"enforce_admins\":true,\"required_status_checks\":{\"strict\":true,\"contexts\":[]},\"restrictions\":null}'",
        });
      }

      if (!dismissStale) {
        gaps.push({
          control: "CC8",
          severity: "medium",
          title: "Stale reviews not dismissed",
          finding: "Branch protection does not dismiss stale reviews after code changes.",
          evidence_source: "GITHUB_BRANCH_PROTECTION",
          auto_remediable: true,
          remediation_type: "api",
          remediation_title: "Enable stale review dismissal",
          remediation_code:
            "curl -X PUT https://api.github.com/repos/ORG/REPO/branches/main/protection -H 'Authorization: Bearer YOUR_TOKEN' -H 'Accept: application/vnd.github+json' -d '{\"required_pull_request_reviews\":{\"required_approving_review_count\":1,\"dismiss_stale_reviews\":true},\"enforce_admins\":true,\"required_status_checks\":{\"strict\":true,\"contexts\":[]},\"restrictions\":null}'",
        });
      }

      if (!requireCodeOwnerReviews) {
        gaps.push({
          control: "CC8",
          severity: "medium",
          title: "Code owner reviews not required",
          finding: "Branch protection does not require code owner reviews on main.",
          evidence_source: "GITHUB_BRANCH_PROTECTION",
          auto_remediable: true,
          remediation_type: "api",
          remediation_title: "Require code owner review",
          remediation_code:
            "curl -X PUT https://api.github.com/repos/ORG/REPO/branches/main/protection -H 'Authorization: Bearer YOUR_TOKEN' -H 'Accept: application/vnd.github+json' -d '{\"required_pull_request_reviews\":{\"required_approving_review_count\":1,\"dismiss_stale_reviews\":true,\"require_code_owner_reviews\":true},\"enforce_admins\":true,\"required_status_checks\":{\"strict\":true,\"contexts\":[]},\"restrictions\":null}'",
        });
      }
    }

    if (enforceAdmins?.enabled === false) {
      gaps.push({
        control: "CC8",
        severity: "high",
        title: "Admins bypass branch protection",
        finding: "Repository admins can bypass branch protection because admin enforcement is disabled.",
        evidence_source: "GITHUB_BRANCH_PROTECTION",
        auto_remediable: true,
        remediation_type: "api",
        remediation_title: "Enforce branch protection for admins",
        remediation_code:
          "curl -X POST https://api.github.com/repos/ORG/REPO/branches/main/protection/enforce_admins -H 'Authorization: Bearer YOUR_TOKEN' -H 'Accept: application/vnd.github+json'",
      });
    }
  }

  if (!codeowners?.exists) {
    gaps.push({
      control: "CC8",
      severity: "low",
      title: "No CODEOWNERS file",
      finding: "No CODEOWNERS file was found in the repository root, .github, or docs directory.",
      evidence_source: "GITHUB_CODEOWNERS",
      auto_remediable: false,
      remediation_type: "manual",
      remediation_title: "Add CODEOWNERS file",
      remediation_code:
        "1. Create a CODEOWNERS file in .github/CODEOWNERS\n2. Add owners for security-sensitive paths\n3. Require code owner review in branch protection",
    });
  }

  for (const pullRequest of pullRequests) {
    if (pullRequest.merged_at && pullRequest.requested_reviewers.length === 0) {
      gaps.push({
        control: "CC8",
        severity: "high",
        title: "Merged pull request without reviewers",
        finding: `Pull request #${pullRequest.number} (${pullRequest.title}) was merged without any requested reviewers.`,
        evidence_source: "GITHUB_PULL_REQUESTS",
        auto_remediable: false,
        remediation_type: "manual",
        remediation_title: "Require reviewer assignment before merge",
        remediation_code:
          "1. Update branch protection to require at least one approval\n2. Require reviewer assignment before merge\n3. Review recent merges for exceptions",
      });
    }
  }

  return gaps;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { client_id?: string };
    if (!body.client_id) {
      return NextResponse.json({ error: "Missing required field: client_id" }, { status: 400 });
    }

    const authResult = await authenticateClient(body.client_id);
    if ("error" in authResult) {
      return authResult.error;
    }

    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_KEY is not configured" }, { status: 500 });
    }

    const { data: artifacts, error: artifactsError } = await adminSupabase
      .from("evidence_artifacts")
      .select("*")
      .eq("client_id", authResult.clientId)
      .order("collected_at", { ascending: false });

    if (artifactsError) {
      throw new Error(artifactsError.message);
    }

    const typedArtifacts = (artifacts ?? []) as EvidenceArtifact[];

    if (typedArtifacts.length === 0) {
      return NextResponse.json({ error: "No evidence found. Run evidence collection first." }, { status: 400 });
    }

    const evidenceSummary = typedArtifacts.map((artifact) => ({
      control: artifact.control,
      source: artifact.source,
      collected_at: artifact.collected_at,
      data: parseJsonSafely<unknown>(artifact.raw_content ?? null),
    }));

    let gaps: AiGap[] = [];
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: `You are a senior SOC 2 auditor analyzing cloud
infrastructure evidence. You will receive evidence collected from
AWS IAM and GitHub. Identify specific SOC 2 Trust Services Criteria
violations.

Return ONLY a valid JSON array. No markdown. No explanation. No
code fences. Start your response with [ and end with ].

Each finding must be this exact shape:
{
  "control": "CC6" or "CC8",
  "severity": "critical" or "high" or "medium" or "low",
  "title": "Short finding title under 60 chars",
  "finding": "Specific description of the violation found in the
              evidence. Name the actual user, resource, or setting
              that is non-compliant. Be specific.",
  "evidence_source": "AWS_IAM_USERS" (the source field it came from),
  "auto_remediable": true or false,
  "remediation_type": "cli" or "api" or "policy" or "manual",
  "remediation_title": "What this fix does in under 50 chars",
  "remediation_code": "The exact AWS CLI command or GitHub API call
                       to fix this. For CLI use real flags. For API
                       use real endpoint and JSON body. If manual,
                       write step-by-step instructions instead."
}

SOC 2 rules to apply:

CC6 — Logical Access violations to flag:
- Any IAM user with console access (password_enabled=true) and
  mfa_active=false → critical
- Root account MFA not active → critical  
- Root account used in last 90 days → critical
- Root account has active access keys → critical
- Any IAM user with AdministratorAccess policy attached directly
  to the user (not via group) → high
- No IAM password policy exists → high
- Password policy minimum length < 14 → medium
- Password policy does not require uppercase, lowercase, numbers,
  symbols → medium
- Any IAM user with no activity in 90+ days (check
  password_last_used and access key last used dates) → medium

CC8 — Change Management violations to flag:
- Branch protection not configured on main branch → critical
- required_pull_request_reviews missing or null → critical
- required_approving_review_count < 1 → critical
- enforce_admins.enabled = false (admins can bypass) → high
- dismiss_stale_reviews = false → medium
- require_code_owner_reviews = false → medium
- No CODEOWNERS file found → low
- Pull requests merged with 0 reviewers (from PR list) → high

If the evidence shows no violations for a control, do not
fabricate findings. Return an empty array [] if everything passes.

Be specific: instead of "a user has no MFA" write
"IAM user john.smith has console access enabled but no MFA device
registered."`,
        messages: [
          {
            role: "user",
            content: JSON.stringify(evidenceSummary),
          },
        ],
      });

      const rawText = response.content[0]?.type === "text" ? response.content[0].text : "";

      try {
        gaps = JSON.parse(rawText) as AiGap[];
      } catch {
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) {
          gaps = JSON.parse(match[0]) as AiGap[];
        } else {
          return NextResponse.json({ error: "Gap analysis returned invalid JSON" }, { status: 500 });
        }
      }
    } else {
      gaps = deterministicAnalyze(typedArtifacts);
    }

    await adminSupabase.from("gap_findings").delete().eq("client_id", authResult.clientId).eq("status", "open");

    for (const gap of gaps) {
      const matchingArtifact = typedArtifacts.find((artifact) => artifact.source === gap.evidence_source) ?? null;
      await adminSupabase.from("gap_findings").insert({
        client_id: authResult.clientId,
        evidence_id: matchingArtifact?.id ?? null,
        control: gap.control,
        severity: gap.severity,
        finding: `${gap.title}: ${gap.finding}`,
        auto_remediable: gap.auto_remediable,
        remediation_type: gap.remediation_type,
        remediation_code: gap.remediation_code,
        status: "open",
      });
    }

    return NextResponse.json({
      success: true,
      gaps_found: gaps.length,
      critical: gaps.filter((gap) => gap.severity === "critical").length,
      high: gaps.filter((gap) => gap.severity === "high").length,
      gaps,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze gaps." },
      { status: 500 },
    );
  }
}
