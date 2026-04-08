import { z } from "zod";

export const gapFindingSchema = z.object({
  control: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  finding: z.string(),
  auto_remediable: z.boolean(),
  remediation_type: z.enum(["cli", "api", "policy", "manual"]).nullable().optional()
});

export const gapFindingArraySchema = z.array(gapFindingSchema);

export type AnalyzedGapFinding = z.infer<typeof gapFindingSchema>;

type EvidenceInput = Array<{
  control: string;
  source: string;
  raw_content: string;
}>;

export async function analyzeEvidenceWithAnthropic(evidence: EvidenceInput): Promise<AnalyzedGapFinding[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return [];
  }

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
        "You are a SOC 2 auditor. Analyze this evidence against Trust Services Criteria. Return ONLY valid JSON array of gap findings.",
      messages: [
        {
          role: "user",
          content: JSON.stringify(
            evidence.map((item) => ({
              control: item.control,
              source: item.source,
              raw_content: Buffer.from(item.raw_content, "base64").toString("utf-8")
            }))
          )
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = payload.content?.find((item) => item.type === "text")?.text || "[]";
  const parsed = JSON.parse(text);
  return gapFindingArraySchema.parse(parsed);
}
