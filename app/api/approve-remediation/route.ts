import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { gap_id?: string };
    if (!body.gap_id) {
      return NextResponse.json({ error: "Missing required field: gap_id" }, { status: 400 });
    }

    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
    if (!client?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: gap } = await supabase
      .from("gap_findings")
      .select("*")
      .eq("id", body.gap_id)
      .eq("client_id", client.id)
      .maybeSingle();

    if (!gap) {
      return NextResponse.json({ error: "Gap not found" }, { status: 404 });
    }

    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_KEY is not configured" }, { status: 500 });
    }

    const now = new Date().toISOString();
    await adminSupabase.from("remediation_log").insert({
      gap_id: gap.id,
      approved_by: user.id,
      approved_at: now,
      action_taken: "approved",
      actor: user.email ?? "Talosly user",
      timestamp: now,
      execution_result: {
        status: "approved",
        summary: "Remediation approved by user",
        remediation_code: gap.remediation_code,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve remediation." },
      { status: 500 },
    );
  }
}
