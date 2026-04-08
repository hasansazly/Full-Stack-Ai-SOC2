import { NextResponse } from "next/server";

import { getFindingById } from "@/lib/data";
import { generateQuestionnaireAnswer } from "@/lib/questionnaire";

export async function POST(request: Request) {
  const { findingId, question } = (await request.json()) as {
    findingId?: string;
    question?: string;
  };

  if (!findingId || !question) {
    return NextResponse.json({ error: "findingId and question are required." }, { status: 400 });
  }

  const finding = await getFindingById(findingId);
  if (!finding) {
    return NextResponse.json({ error: "Finding not found." }, { status: 404 });
  }

  return NextResponse.json(generateQuestionnaireAnswer(finding, question));
}
