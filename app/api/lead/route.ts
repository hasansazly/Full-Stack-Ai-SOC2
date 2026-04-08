import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      company?: string;
      challenge?: string;
      source?: string;
    };

    if (!body.email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const webhookUrl = process.env.LEAD_WEBHOOK_URL;

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          receivedAt: new Date().toISOString()
        })
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thanks. We received your request and will follow up shortly."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Lead capture failed."
      },
      { status: 500 }
    );
  }
}
