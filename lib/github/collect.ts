import type { CollectedEvidence } from "@/lib/aws/collect";

export type GithubCollectionResult = {
  evidenceItems: CollectedEvidence[];
};

type GithubMember = {
  login: string;
  type: string;
};

async function githubFetch<T>(url: string, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  return response as Response & { json(): Promise<T> };
}

type PullRequestRow = {
  number: number;
  title: string;
  merged_at: string | null;
  user?: { login?: string | null } | null;
  requested_reviewers?: Array<{ login?: string | null }> | null;
  review_comments?: number | null;
};

export async function collectGithubEvidence(params: {
  githubToken: string;
  githubOrg: string;
  githubRepo: string;
}): Promise<GithubCollectionResult> {
  const evidenceItems: CollectedEvidence[] = [];

  const branchResponse = await githubFetch<Record<string, unknown>>(
    `https://api.github.com/repos/${encodeURIComponent(params.githubOrg)}/${encodeURIComponent(params.githubRepo)}/branches/main/protection`,
    params.githubToken,
  );

  if (branchResponse.status === 401) {
    throw new Error("Invalid GitHub token");
  }

  if (branchResponse.status !== 404 && !branchResponse.ok) {
    throw new Error(`GitHub error: ${branchResponse.statusText}`);
  }

  const branchProtection =
    branchResponse.status === 404 ? { configured: false } : await branchResponse.json();

  evidenceItems.push({
    control: "CC8",
    source: "GITHUB_BRANCH_PROTECTION",
    raw_content: JSON.stringify(branchProtection),
  });

  const pullsResponse = await githubFetch<PullRequestRow[]>(
    `https://api.github.com/repos/${encodeURIComponent(params.githubOrg)}/${encodeURIComponent(params.githubRepo)}/pulls?state=closed&per_page=20`,
    params.githubToken,
  );

  if (pullsResponse.status === 401) {
    throw new Error("Invalid GitHub token");
  }

  if (pullsResponse.status === 404) {
    throw new Error(`GitHub repo not found: ${params.githubOrg}/${params.githubRepo}`);
  }

  if (!pullsResponse.ok) {
    throw new Error(`GitHub error: ${pullsResponse.statusText}`);
  }

  const pullRequestRows = (await pullsResponse.json()) as PullRequestRow[];
  const pullRequests = pullRequestRows.map((pr) => ({
    number: pr.number,
    title: pr.title,
    merged_at: pr.merged_at,
    user: pr.user?.login ?? "",
    requested_reviewers: (pr.requested_reviewers ?? []).map((reviewer) => reviewer.login ?? ""),
    review_comments: pr.review_comments ?? 0,
  }));

  evidenceItems.push({
    control: "CC8",
    source: "GITHUB_PULL_REQUESTS",
    raw_content: JSON.stringify(pullRequests),
  });

  const codeownersPaths = ["CODEOWNERS", ".github/CODEOWNERS", "docs/CODEOWNERS"];
  let foundPath: string | null = null;

  for (const path of codeownersPaths) {
    const codeownersResponse = await githubFetch(
      `https://api.github.com/repos/${encodeURIComponent(params.githubOrg)}/${encodeURIComponent(params.githubRepo)}/contents/${path}`,
      params.githubToken,
    );

    if (codeownersResponse.status === 401) {
      throw new Error("Invalid GitHub token");
    }

    if (codeownersResponse.ok) {
      foundPath = path;
      break;
    }
  }

  evidenceItems.push({
    control: "CC8",
    source: "GITHUB_CODEOWNERS",
    raw_content: JSON.stringify({ exists: !!foundPath, path: foundPath }),
  });

  const membersResponse = await githubFetch<GithubMember[]>(
    `https://api.github.com/orgs/${encodeURIComponent(params.githubOrg)}/members?role=all&per_page=100`,
    params.githubToken,
  );

  if (membersResponse.status === 401) {
    throw new Error("Invalid GitHub token");
  }

  if (membersResponse.status === 404) {
    throw new Error(`GitHub repo not found: ${params.githubOrg}/${params.githubRepo}`);
  }

  if (!membersResponse.ok) {
    throw new Error(`GitHub error: ${membersResponse.statusText}`);
  }

  const members = (await membersResponse.json()) as GithubMember[];
  const memberDetails = await Promise.all(
    members.map(async (member) => {
      const membershipResponse = await githubFetch<{ role?: string }>(
        `https://api.github.com/orgs/${encodeURIComponent(params.githubOrg)}/memberships/${encodeURIComponent(member.login)}`,
        params.githubToken,
      );

      const membership = membershipResponse.ok ? await membershipResponse.json() : { role: "member" };
      return {
        login: member.login,
        role: membership.role ?? "member",
        type: member.type,
      };
    }),
  );

  evidenceItems.push({
    control: "CC6",
    source: "GITHUB_ORG_MEMBERS",
    raw_content: JSON.stringify(memberDetails),
  });

  return { evidenceItems };
}
