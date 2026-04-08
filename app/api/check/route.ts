import {
  GenerateCredentialReportCommand,
  GetCredentialReportCommand,
  GetLoginProfileCommand,
  IAMClient,
  ListAttachedUserPoliciesCommand,
  ListMFADevicesCommand,
  ListUsersCommand,
} from "@aws-sdk/client-iam";
import { NextResponse } from "next/server";

type Check = {
  id: string;
  control: string;
  name: string;
  status: "pass" | "fail";
  findings: string[];
};

type CheckPayload = {
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  githubToken?: string;
  githubOrg?: string;
};

type GithubRepo = {
  name: string;
  archived: boolean;
  private: boolean;
};

const INVALID_AWS_ERRORS = new Set([
  "InvalidClientTokenId",
  "SignatureDoesNotMatch",
  "UnrecognizedClientException",
  "AccessDenied",
  "AuthFailure",
]);

function shaResponse(checks: Check[]) {
  return {
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter((check) => check.status === "pass").length,
      failed: checks.filter((check) => check.status === "fail").length,
    },
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCredentialReport(content: Uint8Array) {
  const csv = Buffer.from(content).toString("utf8");
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows
    .filter(Boolean)
    .map((row) => {
      const values = parseCsvLine(row);
      return headers.reduce<Record<string, string>>((accumulator, header, index) => {
        accumulator[header] = values[index] ?? "";
        return accumulator;
      }, {});
    });
}

function isInvalidAwsError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as { name?: unknown }).name === "string" &&
    INVALID_AWS_ERRORS.has((error as { name: string }).name)
  );
}

async function getCredentialReport(client: IAMClient) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await client.send(new GenerateCredentialReportCommand({}));
    const report = await client.send(new GetCredentialReportCommand({}));

    if (report.Content) {
      return report.Content;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  throw new Error("Unable to generate credential report.");
}

async function runAwsChecks(client: IAMClient) {
  const usersResponse = await client.send(new ListUsersCommand({}));
  const users = usersResponse.Users ?? [];

  const mfaFindings: string[] = [];
  const privilegeFindings: string[] = [];

  await Promise.all(
    users.map(async (user) => {
      if (!user.UserName) return;

      let hasConsoleAccess = false;
      try {
        await client.send(new GetLoginProfileCommand({ UserName: user.UserName }));
        hasConsoleAccess = true;
      } catch (error) {
        const maybeName = typeof error === "object" && error !== null && "name" in error ? (error as { name?: string }).name : "";
        if (maybeName !== "NoSuchEntity") {
          throw error;
        }
      }

      const [mfaDevices, attachedPolicies] = await Promise.all([
        client.send(new ListMFADevicesCommand({ UserName: user.UserName })),
        client.send(new ListAttachedUserPoliciesCommand({ UserName: user.UserName })),
      ]);

      if (hasConsoleAccess && (mfaDevices.MFADevices?.length ?? 0) === 0) {
        mfaFindings.push(`User ${user.UserName} has console access but no MFA enabled`);
      }

      const hasAdminPolicy = (attachedPolicies.AttachedPolicies ?? []).some(
        (policy) => policy.PolicyName === "AdministratorAccess",
      );

      if (hasAdminPolicy) {
        privilegeFindings.push(`User ${user.UserName} has AdministratorAccess - violates least privilege`);
      }
    }),
  );

  const reportContent = await getCredentialReport(client);
  const reportRows = parseCredentialReport(reportContent);
  const rootRow = reportRows.find((row) => row.user === "<root_account>");
  const rootFindings: string[] = [];

  if (rootRow) {
    if (rootRow.root_account_mfa_active?.toLowerCase() !== "true") {
      rootFindings.push("Root MFA not enabled");
    }

    const rootLastUsed = rootRow.password_last_used || rootRow.access_key_1_last_used_date || rootRow.access_key_2_last_used_date;
    if (rootLastUsed && rootLastUsed !== "N/A" && rootLastUsed !== "no_information") {
      const lastUsed = new Date(rootLastUsed);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      if (!Number.isNaN(lastUsed.getTime()) && lastUsed >= ninetyDaysAgo) {
        rootFindings.push(`Root account used on ${lastUsed.toISOString().slice(0, 10)}`);
      }
    }
  }

  return {
    mfaCheck: {
      id: "cc6_mfa",
      control: "CC6",
      name: "MFA enforcement",
      status: mfaFindings.length > 0 ? "fail" : "pass",
      findings: mfaFindings,
    } as Check,
    rootCheck: {
      id: "cc6_root",
      control: "CC6",
      name: "No root account usage",
      status: rootFindings.length > 0 ? "fail" : "pass",
      findings: rootFindings,
    } as Check,
    privilegeCheck: {
      id: "cc6_least_privilege",
      control: "CC6",
      name: "Overprivileged users",
      status: privilegeFindings.length > 0 ? "fail" : "pass",
      findings: privilegeFindings,
    } as Check,
  };
}

async function fetchGithub<T>(url: string, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Talosly-Compliance-Check",
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Invalid GitHub token");
  }

  if (!response.ok) {
    throw new Error("Unable to query GitHub");
  }

  return (await response.json()) as T;
}

async function runGithubBranchProtectionCheck(githubToken: string, githubOrg: string): Promise<Check> {
  const repos = await fetchGithub<GithubRepo[]>(
    `https://api.github.com/orgs/${encodeURIComponent(githubOrg)}/repos?per_page=100&type=all`,
    githubToken,
  );

  const candidateRepos = repos.filter((repo) => !repo.archived);
  const findings: string[] = [];

  await Promise.all(
    candidateRepos.map(async (repo) => {
      const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(githubOrg)}/${encodeURIComponent(repo.name)}/branches/main/protection`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Talosly-Compliance-Check",
        },
        cache: "no-store",
      });

      if (response.status === 404) {
        findings.push(`Repository ${repo.name} has no main branch protection configured`);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid GitHub token");
      }

      if (!response.ok) {
        throw new Error(`Unable to query branch protection for ${repo.name}`);
      }

      const protection = (await response.json()) as {
        required_pull_request_reviews?: {
          required_approving_review_count?: number;
        } | null;
        enforce_admins?: {
          enabled?: boolean;
        };
      };

      const reviewCount = protection.required_pull_request_reviews?.required_approving_review_count ?? 0;
      const enforceAdmins = protection.enforce_admins?.enabled ?? false;

      if (!protection.required_pull_request_reviews || reviewCount < 1 || !enforceAdmins) {
        findings.push(`Main branch allows direct pushes - no review required (${repo.name})`);
      }
    }),
  );

  return {
    id: "cc8_branch_protection",
    control: "CC8",
    name: "GitHub branch protection",
    status: findings.length > 0 ? "fail" : "pass",
    findings,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckPayload;
  const { awsAccessKeyId, awsSecretAccessKey, githubToken, githubOrg } = body;

  if (!awsAccessKeyId || !awsSecretAccessKey || !githubToken || !githubOrg) {
    return NextResponse.json({ error: "All credentials and the GitHub org name are required." }, { status: 400 });
  }

  try {
    const iamClient = new IAMClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });

    const [awsChecks, githubBranchCheck] = await Promise.all([
      runAwsChecks(iamClient),
      runGithubBranchProtectionCheck(githubToken, githubOrg),
    ]);

    const checks = [awsChecks.mfaCheck, awsChecks.rootCheck, githubBranchCheck, awsChecks.privilegeCheck];
    return NextResponse.json(shaResponse(checks));
  } catch (error) {
    if (isInvalidAwsError(error)) {
      return NextResponse.json({ error: "Invalid AWS credentials" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Invalid GitHub token") {
      return NextResponse.json({ error: "Invalid GitHub token" }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to run compliance check." }, { status: 500 });
  }
}
