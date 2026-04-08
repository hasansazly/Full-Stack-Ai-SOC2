import { Octokit } from "@octokit/rest";

import type { GithubRepoSummary, GithubScanSummary } from "@/lib/gapEngine";

type GithubScanInput = {
  token: string;
  org: string;
};

const codeownersPaths = [".github/CODEOWNERS", "CODEOWNERS", "docs/CODEOWNERS"];

async function hasCodeowners(octokit: Octokit, owner: string, repo: string) {
  for (const path of codeownersPaths) {
    try {
      await octokit.repos.getContent({
        owner,
        repo,
        path
      });
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

function determineRisk(repo: Omit<GithubRepoSummary, "riskLevel">): GithubRepoSummary["riskLevel"] {
  if (!repo.branchProtectionEnabled || repo.requiredApprovals === 0) return "critical";
  if (repo.directPushAllowed) return "high";
  if (!repo.codeownersExists || !repo.ciChecksRequired) return "medium";
  return "low";
}

export async function collectGithubEvidence(input: GithubScanInput): Promise<GithubScanSummary> {
  const octokit = new Octokit({ auth: input.token });
  const reposResponse = await octokit.repos.listForOrg({
    org: input.org,
    per_page: 100,
    sort: "updated",
    direction: "desc"
  });

  const repos = await Promise.all(
    reposResponse.data.map(async (repo): Promise<GithubRepoSummary> => {
      const owner = repo.owner?.login ?? input.org;
      const defaultBranch = repo.default_branch || "main";

      let branchProtectionEnabled = false;
      let requiredApprovals = 0;
      let directPushAllowed = true;
      let ciChecksRequired = false;
      let dismissStaleReviews = false;
      let requireCodeOwnerReviews = false;

      try {
        const protection = await octokit.repos.getBranchProtection({
          owner,
          repo: repo.name,
          branch: defaultBranch
        });

        branchProtectionEnabled = true;
        requiredApprovals = protection.data.required_pull_request_reviews?.required_approving_review_count ?? 0;
        directPushAllowed = !!protection.data.allow_force_pushes?.enabled;
        ciChecksRequired = (protection.data.required_status_checks?.contexts?.length ?? 0) > 0;
        dismissStaleReviews = !!protection.data.required_pull_request_reviews?.dismiss_stale_reviews;
        requireCodeOwnerReviews = !!protection.data.required_pull_request_reviews?.require_code_owner_reviews;
      } catch {
        branchProtectionEnabled = false;
      }

      const codeownersExists = await hasCodeowners(octokit, owner, repo.name);
      const repoSummary = {
        name: repo.name,
        defaultBranch,
        branchProtectionEnabled,
        requiredApprovals,
        codeownersExists,
        directPushAllowed,
        ciChecksRequired,
        dismissStaleReviews,
        requireCodeOwnerReviews
      };

      return {
        ...repoSummary,
        riskLevel: determineRisk(repoSummary)
      };
    })
  );

  return {
    totalRepos: repos.length,
    reposAtRisk: repos.filter((repo) => repo.riskLevel !== "low").length,
    repos
  };
}
