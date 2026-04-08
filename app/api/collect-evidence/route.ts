import { createHash, webcrypto } from "crypto";
import { NextResponse } from "next/server";
import { GenerateCredentialReportCommand, GetCredentialReportCommand, IAMClient } from "@aws-sdk/client-iam";

import { createClient } from "@/lib/supabase/server";

async function sha256(content: string) {
  const buffer = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
  return Buffer.from(buffer).toString("hex");
}

async function getCurrentClientId() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!client?.id) {
    throw new Error("Client not found");
  }

  return { supabase, user, clientId: client.id };
}

async function getAwsCredentialReport(accessKeyId: string, secretAccessKey: string) {
  const iam = new IAMClient({
    region: "us-east-1",
    credentials: { accessKeyId, secretAccessKey }
  });

  await iam.send(new GenerateCredentialReportCommand({}));

  for (let i = 0; i < 5; i += 1) {
    const report = await iam.send(new GetCredentialReportCommand({}));
    if (report.Content) {
      return Buffer.from(report.Content).toString("utf-8");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("AWS credential report was not ready.");
}

export async function POST(request: Request) {
  try {
    const { supabase, clientId } = await getCurrentClientId();
    const body = (await request.json()) as {
      aws_access_key?: string;
      aws_secret_key?: string;
      github_token?: string;
      github_org?: string;
    };

    if (!body.aws_access_key || !body.aws_secret_key || !body.github_token || !body.github_org) {
      return NextResponse.json({ error: "Missing credentials or GitHub org." }, { status: 400 });
    }

    const artifacts: Array<Record<string, string>> = [];

    const awsContent = await getAwsCredentialReport(body.aws_access_key, body.aws_secret_key);
    artifacts.push({
      client_id: clientId,
      control: "CC6",
      source: "AWS_IAM",
      collected_at: new Date().toISOString(),
      content_hash: await sha256(awsContent),
      raw_content: Buffer.from(awsContent).toString("base64")
    });

    const reposResponse = await fetch(`https://api.github.com/orgs/${body.github_org}/repos?per_page=100`, {
      headers: {
        Authorization: `Bearer ${body.github_token}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!reposResponse.ok) {
      throw new Error("Failed to fetch GitHub repositories.");
    }

    const repos = (await reposResponse.json()) as Array<{ name: string; default_branch: string }>;
    const protections = await Promise.all(
      repos.slice(0, 10).map(async (repo) => {
        const response = await fetch(
          `https://api.github.com/repos/${body.github_org}/${repo.name}/branches/${repo.default_branch || "main"}/protection`,
          {
            headers: {
              Authorization: `Bearer ${body.github_token}`,
              Accept: "application/vnd.github+json"
            }
          }
        );

        const data = response.ok ? await response.json() : { repo: repo.name, protection: null };
        return { repo: repo.name, data };
      })
    );

    const githubContent = JSON.stringify(protections, null, 2);
    artifacts.push({
      client_id: clientId,
      control: "CC8",
      source: "GITHUB_BRANCH",
      collected_at: new Date().toISOString(),
      content_hash: await sha256(githubContent),
      raw_content: Buffer.from(githubContent).toString("base64")
    });

    const { data: insertedArtifacts, error } = await supabase.from("evidence_artifacts").insert(artifacts).select("*");
    if (error) {
      throw new Error(error.message);
    }

    const analyzeResponse = await fetch(new URL("/api/analyze-gaps", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "" }
    });

    const analyzePayload = await analyzeResponse.json();

    return NextResponse.json({
      success: true,
      artifacts_collected: insertedArtifacts?.length || 0,
      gaps_found: analyzePayload.gaps?.length || 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to collect evidence." },
      { status: 500 }
    );
  }
}
