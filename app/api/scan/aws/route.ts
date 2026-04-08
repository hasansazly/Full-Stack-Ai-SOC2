import { NextResponse } from "next/server";

import { collectAwsIamEvidence } from "@/lib/awsCollector";
import { sha256Json } from "@/lib/checksum";
import { buildGapFindings, persistGapFindings } from "@/lib/gapEngine";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { isUuid } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accessKeyId, secretAccessKey, region, clientId } = body as {
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
      clientId?: string;
    };

    if (!accessKeyId || !secretAccessKey || !region) {
      return NextResponse.json({ error: "Missing AWS credentials or region." }, { status: 400 });
    }

    const summary = await collectAwsIamEvidence({ accessKeyId, secretAccessKey, region });
    const checksum = sha256Json(summary);
    const supabase = createAdminSupabaseClient();
    const normalizedClientId = isUuid(clientId) ? clientId : null;

    if (supabase && normalizedClientId) {
      await supabase.from("integrations").insert({
        client_id: normalizedClientId,
        type: "aws",
        credentials: {
          accessKeyIdLast4: accessKeyId.slice(-4),
          region
        },
        status: "connected"
      });

      await supabase.from("evidence_artifacts").insert({
        client_id: normalizedClientId,
        source: "aws_iam",
        raw_data: summary,
        checksum,
        artifact_type: "iam_scan_summary"
      });

      const findings = buildGapFindings(normalizedClientId, summary, undefined);
      await persistGapFindings(findings);
    }

    return NextResponse.json({ ...summary, checksum });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AWS scan failed."
      },
      { status: 500 }
    );
  }
}
