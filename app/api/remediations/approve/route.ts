import { NextResponse } from "next/server";

import { getFindingById } from "@/lib/data";
import { getRemediationForFindingRecord } from "@/lib/remediations/registry";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = (await request.json()) as {
      findingId?: string;
    };

    if (!body.findingId) {
      return NextResponse.json({ error: "findingId is required." }, { status: 400 });
    }

    const finding = await getFindingById(body.findingId);
    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    const remediation = getRemediationForFindingRecord(finding);
    if (!remediation) {
      return NextResponse.json({ error: "No auto-remediation available." }, { status: 400 });
    }

    const log = {
      id: `approval-${body.findingId}-${Date.now()}`,
      action: "approved",
      actor: user?.email ?? "Talosly demo workspace",
      at: new Date().toISOString(),
      status: "approved",
      summary: `${remediation.title} approved. Awaiting explicit apply step.`,
      executionResult: {
        remediationId: remediation.id,
        executionMode: remediation.executionMode,
        payload: remediation.payload,
      },
    };

    const adminSupabase = createAdminSupabaseClient();
    if (user && adminSupabase) {
      await adminSupabase.from("remediation_log").insert({
        gap_id: body.findingId,
        finding_id: body.findingId,
        remediation_code: remediation.payload.content,
        approved_by: user.id,
        approved_at: log.at,
        action_taken: "approved",
        actor: log.actor,
        timestamp: log.at,
        execution_result: {
          status: log.status,
          summary: log.summary,
          remediationId: remediation.id,
          beforeEvidence: remediation.beforeEvidence,
          payload: remediation.payload,
        },
      });

      await adminSupabase.from("gap_findings").update({ status: "approved" }).eq("id", body.findingId);
    }

    return NextResponse.json({
      success: true,
      remediation,
      log,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve remediation." },
      { status: 500 }
    );
  }
}
