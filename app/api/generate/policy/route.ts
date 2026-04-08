import { NextResponse } from "next/server";

import { generatePolicyDocument } from "@/lib/policyGenerator";

export async function POST(request: Request) {
  const { policyType, companyName, employeeCount, tools } = (await request.json()) as {
    policyType?: "Access Control" | "Change Management";
    companyName?: string;
    employeeCount?: number;
    tools?: string[];
  };

  if (!policyType || !companyName || !employeeCount) {
    return NextResponse.json({ error: "policyType, companyName, and employeeCount are required." }, { status: 400 });
  }

  const document = generatePolicyDocument({
    policyType,
    companyName,
    employeeCount,
    tools: tools ?? []
  });

  return NextResponse.json({
    document,
    provider: "rule-based"
  });
}
