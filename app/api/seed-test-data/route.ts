import { NextResponse } from "next/server";

import { hashContent } from "@/lib/hash";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

type SampleArtifact = {
  control: "CC6" | "CC8";
  source: string;
  raw_content: string;
};

const sampleArtifacts: SampleArtifact[] = [
  {
    control: "CC6",
    source: "AWS_CREDENTIAL_REPORT",
    raw_content: JSON.stringify([
      {
        user: "<root_account>",
        password_enabled: "true",
        password_last_used: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        mfa_active: "false",
        access_key_1_active: "true",
        access_key_1_last_used_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        access_key_2_active: "false",
        access_key_2_last_used_date: "N/A",
      },
      {
        user: "sarah.chen",
        password_enabled: "true",
        password_last_used: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        mfa_active: "false",
        access_key_1_active: "false",
        access_key_1_last_used_date: "N/A",
        access_key_2_active: "false",
        access_key_2_last_used_date: "N/A",
      },
      {
        user: "james.wong",
        password_enabled: "true",
        password_last_used: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        mfa_active: "false",
        access_key_1_active: "false",
        access_key_1_last_used_date: "N/A",
        access_key_2_active: "false",
        access_key_2_last_used_date: "N/A",
      },
      {
        user: "dev.bot",
        password_enabled: "true",
        password_last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mfa_active: "false",
        access_key_1_active: "true",
        access_key_1_last_used_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        access_key_2_active: "false",
        access_key_2_last_used_date: "N/A",
      },
    ]),
  },
  {
    control: "CC6",
    source: "AWS_IAM_USERS",
    raw_content: JSON.stringify([
      { username: "sarah.chen", arn: "arn:aws:iam::123:user/sarah.chen", attached_policies: [], mfa_device_count: 0 },
      { username: "james.wong", arn: "arn:aws:iam::123:user/james.wong", attached_policies: [], mfa_device_count: 0 },
      { username: "dev.bot", arn: "arn:aws:iam::123:user/dev.bot", attached_policies: ["AdministratorAccess"], mfa_device_count: 0 },
    ]),
  },
  {
    control: "CC6",
    source: "AWS_PASSWORD_POLICY",
    raw_content: JSON.stringify({ exists: false }),
  },
  {
    control: "CC6",
    source: "AWS_ROOT_ACCOUNT",
    raw_content: JSON.stringify({
      root_mfa_active: false,
      root_last_used: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      root_access_key_active: true,
    }),
  },
  {
    control: "CC6",
    source: "AWS_IAM_GROUPS",
    raw_content: JSON.stringify([{ group_name: "Developers", attached_policies: ["ReadOnlyAccess"] }]),
  },
  {
    control: "CC8",
    source: "GITHUB_BRANCH_PROTECTION",
    raw_content: JSON.stringify({
      required_pull_request_reviews: {
        required_approving_review_count: 0,
        dismiss_stale_reviews: false,
        require_code_owner_reviews: false,
      },
      enforce_admins: { enabled: false },
    }),
  },
  {
    control: "CC8",
    source: "GITHUB_PULL_REQUESTS",
    raw_content: JSON.stringify([
      {
        number: 42,
        title: "Ship hotfix directly to production",
        merged_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: "sarah.chen",
        requested_reviewers: [],
        review_comments: 0,
      },
    ]),
  },
  {
    control: "CC8",
    source: "GITHUB_CODEOWNERS",
    raw_content: JSON.stringify({ exists: false, path: null }),
  },
  {
    control: "CC6",
    source: "GITHUB_ORG_MEMBERS",
    raw_content: JSON.stringify([
      { login: "sarah.chen", role: "admin", type: "User" },
      { login: "james.wong", role: "member", type: "User" },
    ]),
  },
];

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_KEY is not configured" }, { status: 500 });
    }

    let { data: client } = await adminSupabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
    if (!client?.id) {
      const { data: insertedClient, error: insertClientError } = await adminSupabase
        .from("clients")
        .insert({
          user_id: user.id,
          company_name: "Acme Corp (sample)",
          tier: "readiness",
        })
        .select("id")
        .single();

      if (insertClientError || !insertedClient?.id) {
        throw new Error(insertClientError?.message || "Unable to create sample client.");
      }
      client = insertedClient;
    }

    await adminSupabase.from("gap_findings").delete().eq("client_id", client.id);
    await adminSupabase.from("evidence_artifacts").delete().eq("client_id", client.id);

    const timestamp = new Date().toISOString();
    const rows = await Promise.all(
      sampleArtifacts.map(async (artifact) => ({
        client_id: client!.id,
        control: artifact.control,
        source: artifact.source,
        collected_at: timestamp,
        content_hash: await hashContent(artifact.raw_content),
        raw_content: artifact.raw_content,
      })),
    );

    const { error: insertArtifactsError } = await adminSupabase.from("evidence_artifacts").insert(rows);
    if (insertArtifactsError) {
      throw new Error(insertArtifactsError.message);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const analyzeResponse = await fetch(`${appUrl}/api/analyze-gaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ client_id: client.id }),
    });

    const analyzePayload = (await analyzeResponse.json()) as { gaps_found?: number; error?: string };
    if (!analyzeResponse.ok) {
      throw new Error(analyzePayload.error || "Analyze gaps failed.");
    }

    return NextResponse.json({
      success: true,
      client_id: client.id,
      gaps_seeded: analyzePayload.gaps_found ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to seed test data." },
      { status: 500 },
    );
  }
}
