import { NextResponse } from "next/server";

import { sha256Json } from "@/lib/checksum";
import { collectGithubEvidence } from "@/lib/githubCollector";
import { buildGapFindings, persistGapFindings } from "@/lib/gapEngine";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { isUuid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, org, clientId } = body as {
      token?: string;
      org?: string;
      clientId?: string;
    };

    if (!token || !org) {
      return NextResponse.json({ error: "Missing GitHub token or org." }, { status: 400 });
    }

    const summary = await collectGithubEvidence({ token, org });
    const checksum = sha256Json(summary);
    const supabase = createAdminSupabaseClient();
    const normalizedClientId = isUuid(clientId) ? clientId : null;

    if (supabase && normalizedClientId) {
      await supabase.from("integrations").insert({
        client_id: normalizedClientId,
        type: "github",
        credentials: {
          org,
          tokenLast4: token.slice(-4)
        },
        status: "connected"
      });

      await supabase.from("evidence_artifacts").insert({
        client_id: normalizedClientId,
        source: "github_branch",
        raw_data: summary,
        checksum,
        artifact_type: "github_branch_audit"
      });

      const findings = buildGapFindings(normalizedClientId, undefined, summary);
      await persistGapFindings(findings);
    }

    return NextResponse.json({ ...summary, checksum });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "GitHub scan failed."
      },
      { status: 500 }
    );
  }
}
