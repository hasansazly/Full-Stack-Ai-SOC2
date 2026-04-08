import { NextResponse } from "next/server";

import { buildGapFindings, type AwsScanSummary, type GithubScanSummary } from "@/lib/gapEngine";
import { createClient } from "@/lib/supabase/server";

type ParsedGap = {
  control: string;
  severity: string;
  finding: string;
  auto_remediable: boolean;
  remediation_type: string;
  remediation_code: string;
};

function mapFindingsToParsedGaps(
  findings: ReturnType<typeof buildGapFindings>,
): ParsedGap[] {
  return findings.map((finding) => ({
    control: finding.control_area.includes("CC8") ? "CC8" : "CC6",
    severity: finding.severity,
    finding: finding.title,
    auto_remediable: ["Privileged user without MFA", "No peer review required", "Direct push to main allowed", "No CODEOWNERS file", "No branch protection on main"].includes(
      finding.title,
    ),
    remediation_type: finding.control_area.includes("CC8")
      ? finding.title.includes("CODEOWNERS")
        ? "pr"
        : "api"
      : "cli",
    remediation_code: finding.remediation_steps
      .map((step) => `${step.step}. ${step.action}: ${step.detail}`)
      .join("\n"),
  }));
}

function fallbackAnalyze(
  evidence: Array<{ control?: string | null; raw_content?: string | null; raw_data?: unknown }>,
): ParsedGap[] {
  const awsSummary = evidence.find((item) => item.control === "CC6")?.raw_data as AwsScanSummary | undefined;
  const githubSummary = evidence.find((item) => item.control === "CC8")?.raw_data as GithubScanSummary | undefined;

  if (awsSummary || githubSummary) {
    return mapFindingsToParsedGaps(buildGapFindings(null, awsSummary, githubSummary));
  }

  const findings: ParsedGap[] = [];

  for (const item of evidence) {
    const content = Buffer.from(item.raw_content || "", "base64").toString("utf-8").toLowerCase();

    if (item.control === "CC6" && content.includes("false")) {
      findings.push({
        control: "CC6",
        severity: "critical",
        finding: "AWS user missing MFA",
        auto_remediable: true,
        remediation_type: "cli",
        remediation_code:
          "aws iam create-policy --policy-name RequireMFA --policy-document file://require-mfa-policy.json"
      });
    }

    if (item.control === "CC8" && content.includes("protection\": null")) {
      findings.push({
        control: "CC8",
        severity: "high",
        finding: "GitHub branch protection missing on main",
        auto_remediable: true,
        remediation_type: "api",
        remediation_code:
          "gh api repos/ORG/REPO/branches/main/protection --method PUT --input branch-protection.json"
      });
    }

    if (item.control === "CC8" && content.includes("codeownersexists\": false")) {
      findings.push({
        control: "CC8",
        severity: "medium",
        finding: "No CODEOWNERS file",
        auto_remediable: true,
        remediation_type: "pr",
        remediation_code: "Create .github/CODEOWNERS in a pull request and require code owner review on the protected branch.",
      });
    }
  }

  return findings;
}

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
    if (!client?.id) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { data: evidence } = await supabase
      .from("evidence_artifacts")
      .select("*")
      .eq("client_id", client.id)
      .order("collected_at", { ascending: false })
      .limit(10);

    const evidenceRows = evidence || [];

    let parsedGaps: ParsedGap[] = [];

    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are a SOC 2 auditor. Analyze this evidence and return ONLY a JSON array. No markdown. No explanation. Each item: { control, severity, finding, auto_remediable, remediation_type, remediation_code }",
          messages: [
            {
              role: "user",
              content: JSON.stringify(evidenceRows)
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Anthropic analysis failed.");
      }

      const payload = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };

      const text = payload.content?.find((item) => item.type === "text")?.text || "[]";
      parsedGaps = JSON.parse(text) as ParsedGap[];
    } else {
      parsedGaps = fallbackAnalyze(
        evidenceRows as Array<{ control?: string | null; raw_content?: string | null; raw_data?: unknown }>,
      );
    }

    if (parsedGaps.length > 0) {
      await supabase.from("gap_findings").delete().eq("client_id", client.id);
      await supabase.from("gap_findings").insert(
        parsedGaps.map((gap, index) => ({
          client_id: client.id,
          evidence_id: evidenceRows[index]?.id || evidenceRows[0]?.id,
          control: gap.control,
          severity: gap.severity,
          finding: gap.finding,
          auto_remediable: gap.auto_remediable,
          remediation_type: gap.remediation_type,
          remediation_code: gap.remediation_code
        }))
      );
    }

    return NextResponse.json({ gaps: parsedGaps });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze gaps." },
      { status: 500 }
    );
  }
}
