import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const body = await req.json();
  await supabase.from("analytics_cta_clicks").insert({
    profile_id: body.profileId,
    product_id: body.productId ?? null,
    label: body.label ?? null,
  }).select();
  return NextResponse.json({ ok: true });
}
