import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gap_id } = (await request.json()) as { gap_id?: string };
    if (!gap_id) {
      return NextResponse.json({ error: "gap_id is required." }, { status: 400 });
    }

    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
    if (!client?.id) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const { data: gap } = await supabase
      .from("gap_findings")
      .select("*")
      .eq("id", gap_id)
      .eq("client_id", client.id)
      .maybeSingle();

    if (!gap) {
      return NextResponse.json({ error: "Gap not found." }, { status: 404 });
    }

    const { error: logError } = await supabase.from("remediation_log").insert({
      gap_id,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      execution_result: {
        status: "approved",
        remediation_code: gap.remediation_code
      }
    });

    if (logError) {
      throw new Error(logError.message);
    }

    const { error: gapError } = await supabase.from("gap_findings").update({ status: "approved" }).eq("id", gap_id);
    if (gapError) {
      throw new Error(gapError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve remediation." },
      { status: 500 }
    );
  }
}
