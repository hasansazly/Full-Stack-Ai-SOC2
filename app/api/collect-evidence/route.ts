import { NextResponse } from "next/server";

import { collectAwsIamEvidence } from "@/lib/awsCollector";
import { sha256Json } from "@/lib/checksum";
import { buildGapFindings, persistGapFindings } from "@/lib/gapEngine";
import { collectGithubEvidence } from "@/lib/githubCollector";
import { createClient } from "@/lib/supabase/server";

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
    const [awsSummary, githubSummary] = await Promise.all([
      collectAwsIamEvidence({
        accessKeyId: body.aws_access_key,
        secretAccessKey: body.aws_secret_key,
        region: "us-east-1",
      }),
      collectGithubEvidence({
        token: body.github_token,
        org: body.github_org,
      }),
    ]);

    const awsContent = JSON.stringify(awsSummary, null, 2);
    const awsChecksum = sha256Json(awsSummary);
    artifacts.push({
      client_id: clientId,
      control: "CC6",
      source: "AWS_IAM",
      collected_at: new Date().toISOString(),
      content_hash: awsChecksum,
      checksum: awsChecksum,
      raw_content: Buffer.from(awsContent).toString("base64"),
      raw_data: awsSummary,
      artifact_type: "iam_scan_summary",
    } as unknown as Record<string, string>);

    const githubContent = JSON.stringify(githubSummary, null, 2);
    const githubChecksum = sha256Json(githubSummary);
    artifacts.push({
      client_id: clientId,
      control: "CC8",
      source: "GITHUB_BRANCH",
      collected_at: new Date().toISOString(),
      content_hash: githubChecksum,
      checksum: githubChecksum,
      raw_content: Buffer.from(githubContent).toString("base64"),
      raw_data: githubSummary,
      artifact_type: "github_branch_audit",
    } as unknown as Record<string, string>);

    const { data: insertedArtifacts, error } = await supabase.from("evidence_artifacts").insert(artifacts).select("*");
    if (error) {
      throw new Error(error.message);
    }
    const findings = buildGapFindings(clientId, awsSummary, githubSummary);
    const persistedFindings = await persistGapFindings(findings);

    return NextResponse.json({
      success: true,
      artifacts_collected: insertedArtifacts?.length || 0,
      gaps_found: persistedFindings.length || 0,
      summary: {
        aws: awsSummary,
        github: githubSummary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to collect evidence." },
      { status: 500 }
    );
  }
}
