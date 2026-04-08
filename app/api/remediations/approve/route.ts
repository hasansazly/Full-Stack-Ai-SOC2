import { NextResponse } from "next/server";

import { getRemediationForFinding } from "@/lib/agents/autoRemediator";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      gapId?: string;
      finding?: string;
    };

    if (!body.gapId || !body.finding) {
      return NextResponse.json({ error: "gapId and finding are required." }, { status: 400 });
    }

    const remediation = getRemediationForFinding(body.finding);
    if (!remediation) {
      return NextResponse.json({ error: "No auto-remediation available." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    if (supabase) {
      await supabase.from("remediation_log").insert({
        gap_id: body.gapId,
        remediation_code: remediation.code,
        approved_at: new Date().toISOString(),
        execution_result: {
          status: "preview_generated",
          summary: remediation.summary
        }
      });

      await supabase.from("gap_findings").update({ status: "approved" }).eq("id", body.gapId);
    }

    return NextResponse.json({
      success: true,
      remediation
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve remediation." },
      { status: 500 }
    );
  }
}
