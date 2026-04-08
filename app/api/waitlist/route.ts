import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      company?: string;
      dealAtRisk?: boolean;
    };

    if (!body.email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from("waitlist").upsert({
        email: body.email,
        company: body.company || null,
        deal_at_risk: body.dealAtRisk ?? false
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "You're on the waitlist. We’ll reach out when Talosly opens new audit cohorts."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to join waitlist." },
      { status: 500 }
    );
  }
}
