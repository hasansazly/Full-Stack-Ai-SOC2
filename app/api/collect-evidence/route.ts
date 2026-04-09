import { NextResponse } from "next/server";

import { collectAwsEvidence, INVALID_AWS_CREDENTIAL_ERRORS, type CollectedEvidence } from "@/lib/aws/collect";
import { collectGithubEvidence } from "@/lib/github/collect";
import { hashContent } from "@/lib/hash";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

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

  return { user, clientId: client.id };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      aws_access_key_id?: string;
      aws_secret_access_key?: string;
      github_token?: string;
      github_org?: string;
      github_repo?: string;
      client_id?: string;
    };

    const requiredFields = [
      "aws_access_key_id",
      "aws_secret_access_key",
      "github_token",
      "github_org",
      "github_repo",
      "client_id",
    ] as const;

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const authResult = await authenticateClient(body.client_id!);
    if ("error" in authResult) {
      return authResult.error;
    }

    let awsEvidence: CollectedEvidence[] = [];
    try {
      const awsResult = await collectAwsEvidence({
        awsAccessKeyId: body.aws_access_key_id!,
        awsSecretAccessKey: body.aws_secret_access_key!,
      });
      awsEvidence = awsResult.evidenceItems;
    } catch (error) {
      const errorName =
        typeof error === "object" && error !== null && "name" in error ? String((error as { name?: string }).name) : "";
      if (INVALID_AWS_CREDENTIAL_ERRORS.has(errorName)) {
        return NextResponse.json({ error: "Invalid AWS credentials" }, { status: 400 });
      }
      if (errorName === "AccessDenied") {
        return NextResponse.json(
          { error: "AWS access denied. Ensure SecurityAudit policy is attached to this IAM user." },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: `AWS error: ${error instanceof Error ? error.message : "Unknown AWS error"}` },
        { status: 500 },
      );
    }

    let githubEvidence: CollectedEvidence[] = [];
    try {
      const githubResult = await collectGithubEvidence({
        githubToken: body.github_token!,
        githubOrg: body.github_org!,
        githubRepo: body.github_repo!,
      });
      githubEvidence = githubResult.evidenceItems;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown GitHub error";
      if (message === "Invalid GitHub token") {
        return NextResponse.json({ error: "Invalid GitHub token" }, { status: 400 });
      }
      if (message.startsWith("GitHub repo not found:")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      if (message.startsWith("GitHub error:")) {
        return NextResponse.json({ error: message }, { status: 500 });
      }
      return NextResponse.json({ error: `GitHub error: ${message}` }, { status: 500 });
    }

    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_KEY is not configured" }, { status: 500 });
    }

    const collectedAt = new Date().toISOString();
    const artifacts = await Promise.all(
      [...awsEvidence, ...githubEvidence].map(async (item) => ({
        client_id: authResult.clientId,
        control: item.control,
        source: item.source,
        collected_at: collectedAt,
        content_hash: await hashContent(item.raw_content),
        raw_content: item.raw_content,
      })),
    );

    const { error } = await adminSupabase.from("evidence_artifacts").insert(artifacts);
    if (error) throw new Error(error.message);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    await fetch(`${appUrl}/api/analyze-gaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ client_id: authResult.clientId }),
    });

    return NextResponse.json({
      success: true,
      artifacts_collected: artifacts.length,
      message: "Evidence collected and gap analysis started",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to collect evidence." },
      { status: 500 }
    );
  }
}
