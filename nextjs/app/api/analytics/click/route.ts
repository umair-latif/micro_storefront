import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { profile_id, product_id, cta, source, ua } = await req.json();

  if (!profile_id || !cta || !source) {
    return NextResponse.json(
      { ok: false, error: "profile_id, cta, and source are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("analytics_clicks").insert({
    profile_id,
    product_id: product_id ?? null,
    cta,
    source,
    ua: ua ?? req.headers.get("user-agent"),
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
