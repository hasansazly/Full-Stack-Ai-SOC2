import { NextResponse } from "next/server";

import { getFindingById } from "@/lib/data";
import { getRemediationForFindingRecord } from "@/lib/remediations/registry";
import type { RemediationEvidenceItem } from "@/lib/remediations/types";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

type ApplyBody = {
  findingId?: string;
  executionInput?: Record<string, string>;
};

async function applyGithubBranchProtection(remediationTitle: string, executionInput: Record<string, string>) {
  const githubToken = executionInput.githubToken;
  const githubOrg = executionInput.githubOrg;
  const githubRepo = executionInput.githubRepo;

  if (!githubToken || !githubOrg || !githubRepo) {
    throw new Error("GitHub token, org, and repo are required.");
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Talosly-Remediator",
  };

  const baseUrl = `https://api.github.com/repos/${encodeURIComponent(githubOrg)}/${encodeURIComponent(githubRepo)}/branches/main/protection`;
  const beforeResponse = await fetch(baseUrl, { headers, cache: "no-store" });
  const beforeEvidence = beforeResponse.ok ? await beforeResponse.json() : { status: beforeResponse.status };

  const payload = {
    required_status_checks: {
      strict: true,
      contexts: ["ci/test"],
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      required_approving_review_count: 1,
    },
    restrictions: null,
  };

  const applyResponse = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!applyResponse.ok) {
    const errorText = await applyResponse.text();
    throw new Error(`GitHub branch protection update failed: ${errorText}`);
  }

  const afterEvidence = await applyResponse.json();

  return {
    status: "executed",
    summary: `${remediationTitle} applied to ${githubOrg}/${githubRepo}.`,
    executionResult: {
      provider: "github",
      repository: `${githubOrg}/${githubRepo}`,
      mode: "api",
      before: beforeEvidence,
      after: afterEvidence,
    },
    afterEvidence: [
      {
        label: "After evidence",
        detail: `Updated branch protection captured for ${githubOrg}/${githubRepo}.`,
        status: "captured",
      },
      {
        label: "Execution timestamp",
        detail: "GitHub returned a successful branch protection response.",
        status: "captured",
      },
    ] satisfies RemediationEvidenceItem[],
  };
}

function applyGithubCodeowners(remediationTitle: string, executionInput: Record<string, string>) {
  const githubOrg = executionInput.githubOrg || "<ORG>";
  const githubRepo = executionInput.githubRepo || "<REPO>";
  const defaultOwners = executionInput.defaultOwners || `@${githubOrg}/engineering`;
  const branchName = `talosly/codeowners-${Date.now()}`;
  const content = `# CODEOWNERS
* ${defaultOwners}
/.github/ @${githubOrg}/security
/infrastructure/ @${githubOrg}/platform
/app/auth/ @${githubOrg}/security @${githubOrg}/backend`;

  return {
    status: "prepared",
    summary: `${remediationTitle} prepared as a PR payload for ${githubOrg}/${githubRepo}.`,
    executionResult: {
      provider: "github",
      mode: "pr",
      repository: `${githubOrg}/${githubRepo}`,
      branch: branchName,
      path: ".github/CODEOWNERS",
      content,
      nextStep: "Open a pull request with this branch content and enable code owner review after merge.",
    },
    afterEvidence: [
      {
        label: "PR evidence",
        detail: `PR payload prepared for ${githubOrg}/${githubRepo} on branch ${branchName}.`,
        status: "captured",
      },
      {
        label: "Merge evidence",
        detail: "Re-run evidence collection after the CODEOWNERS pull request merges.",
        status: "pending",
      },
    ] satisfies RemediationEvidenceItem[],
  };
}

function applyAwsMfa(remediationTitle: string, executionInput: Record<string, string>) {
  const affectedUser = executionInput.affectedUser || "<PRIVILEGED_USER>";
  const awsAccountId = executionInput.awsAccountId || "<ACCOUNT_ID>";

  return {
    status: "prepared",
    summary: `${remediationTitle} prepared for manual execution for ${affectedUser}.`,
    executionResult: {
      provider: "aws",
      mode: "manual",
      accountId: awsAccountId,
      affectedUser,
      nextStep: "Run the generated CLI, enroll the user in MFA, then re-run evidence collection to verify the control.",
    },
    afterEvidence: [
      {
        label: "After evidence",
        detail: `Awaiting updated MFA device evidence for ${affectedUser}.`,
        status: "pending",
      },
      {
        label: "Execution timestamp",
        detail: "Manual remediation package prepared and logged.",
        status: "captured",
      },
    ] satisfies RemediationEvidenceItem[],
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = (await request.json()) as ApplyBody;
    if (!body.findingId) {
      return NextResponse.json({ error: "findingId is required." }, { status: 400 });
    }

    const finding = await getFindingById(body.findingId);
    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    const remediation = getRemediationForFindingRecord(finding);
    if (!remediation) {
      return NextResponse.json({ error: "No supported remediation exists for this finding." }, { status: 400 });
    }

    const executionInput = body.executionInput ?? {};
    let result:
      | Awaited<ReturnType<typeof applyGithubBranchProtection>>
      | ReturnType<typeof applyGithubCodeowners>
      | ReturnType<typeof applyAwsMfa>;

    if (remediation.id === "github_branch_protection_main") {
      result = await applyGithubBranchProtection(remediation.title, executionInput);
    } else if (remediation.id === "github_codeowners_pr") {
      result = applyGithubCodeowners(remediation.title, executionInput);
    } else {
      result = applyAwsMfa(remediation.title, executionInput);
    }

    const actor = user?.email ?? "Talosly demo workspace";
    const at = new Date().toISOString();
    const log = {
      id: `execution-${body.findingId}-${Date.now()}`,
      action: "applied",
      actor,
      at,
      status: result.status,
      summary: result.summary,
      executionResult: result.executionResult,
      afterEvidence: result.afterEvidence,
    };

    const adminSupabase = createAdminSupabaseClient();
    if (user && adminSupabase) {
      await adminSupabase.from("remediation_log").insert({
        gap_id: body.findingId,
        finding_id: body.findingId,
        approved_by: user.id,
        approved_at: at,
        executed_at: result.status === "executed" ? at : null,
        remediation_code: remediation.payload.content,
        action_taken: "applied",
        actor,
        timestamp: at,
        execution_result: {
          status: result.status,
          summary: result.summary,
          remediationId: remediation.id,
          input: Object.keys(executionInput).reduce<Record<string, string>>((acc, key) => {
            acc[key] = key.toLowerCase().includes("token") ? "[redacted]" : executionInput[key];
            return acc;
          }, {}),
          beforeEvidence: remediation.beforeEvidence,
          afterEvidence: result.afterEvidence,
          details: result.executionResult,
        },
      });

      const nextFindingStatus = result.status === "executed" ? "remediated" : "approved";
      await adminSupabase.from("gap_findings").update({ status: nextFindingStatus }).eq("id", body.findingId);
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to apply remediation." },
      { status: 500 },
    );
  }
}
