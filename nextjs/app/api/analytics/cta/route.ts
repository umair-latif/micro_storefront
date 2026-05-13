import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  if (!body.profileId) {
    return NextResponse.json({ ok: false, error: "profileId is required" }, { status: 400 });
  }

  const { error } = await supabase.from("analytics_cta_clicks").insert({
    profile_id: body.profileId,
    product_id: body.productId ?? null,
    label: body.label ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
