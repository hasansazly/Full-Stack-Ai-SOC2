import crypto from "crypto";

import {
  GenerateCredentialReportCommand,
  GetCredentialReportCommand,
  IAMClient
} from "@aws-sdk/client-iam";
import { Octokit } from "@octokit/rest";

import { createAdminSupabaseClient } from "@/lib/supabase";

type AwsEvidenceInput = {
  clientId: string;
  region?: string;
};

type GithubEvidenceInput = {
  clientId: string;
  org: string;
};

export type CollectedArtifact = {
  id?: string;
  client_id: string;
  control: string;
  source: string;
  collected_at: string;
  content_hash: string;
  raw_content: string;
};

function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function encodeContent(content: string) {
  return Buffer.from(content, "utf-8").toString("base64");
}

async function getCredentialReportContent(client: IAMClient) {
  await client.send(new GenerateCredentialReportCommand({}));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const report = await client.send(new GetCredentialReportCommand({}));
    if (report.Content) {
      return Buffer.from(report.Content).toString("utf-8");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Unable to fetch IAM credential report.");
}

export async function collectAwsCredentialReport(input: AwsEvidenceInput): Promise<CollectedArtifact> {
  const client = new IAMClient({
    region: input.region || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
  });

  const content = await getCredentialReportContent(client);
  return {
    client_id: input.clientId,
    control: "CC6.1",
    source: "AWS_IAM",
    collected_at: new Date().toISOString(),
    content_hash: sha256(content),
    raw_content: encodeContent(content)
  };
}

export async function collectGithubBranchProtection(input: GithubEvidenceInput): Promise<CollectedArtifact[]> {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  const [reposResponse, membersResponse] = await Promise.all([
    octokit.repos.listForOrg({
      org: input.org,
      per_page: 100
    }),
    octokit.orgs.listMembers({
      org: input.org,
      per_page: 100
    })
  ]);

  const repoProtectionPayload = await Promise.all(
    reposResponse.data.map(async (repo) => {
      const branch = repo.default_branch || "main";
      try {
        const protection = await octokit.repos.getBranchProtection({
          owner: input.org,
          repo: repo.name,
          branch
        });
        return {
          repo: repo.name,
          branch,
          protection: protection.data
        };
      } catch {
        return {
          repo: repo.name,
          branch,
          protection: null
        };
      }
    })
  );

  const branchContent = JSON.stringify(repoProtectionPayload, null, 2);
  const memberContent = JSON.stringify(
    membersResponse.data.map((member) => ({
      login: member.login,
      type: member.type,
      role: "member"
    })),
    null,
    2
  );

  return [
    {
      client_id: input.clientId,
      control: "CC8.1",
      source: "GITHUB_BRANCH_PROTECTION",
      collected_at: new Date().toISOString(),
      content_hash: sha256(branchContent),
      raw_content: encodeContent(branchContent)
    },
    {
      client_id: input.clientId,
      control: "CC6.2",
      source: "GITHUB_ORG_MEMBERS",
      collected_at: new Date().toISOString(),
      content_hash: sha256(memberContent),
      raw_content: encodeContent(memberContent)
    }
  ];
}

export async function storeEvidenceArtifacts(artifacts: CollectedArtifact[]) {
  const supabase = createAdminSupabaseClient();
  if (!supabase || artifacts.length === 0) {
    return artifacts;
  }

  const { data, error } = await supabase.from("evidence_artifacts").insert(artifacts).select("*");
  if (error) {
    throw new Error(`Failed to store evidence artifacts: ${error.message}`);
  }

  return data ?? artifacts;
}
