import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();
  const profileId = body.profileId ?? body.storefrontId;

  if (!profileId) {
    return NextResponse.json({ ok: false, error: "profileId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("analytics_views")
    .insert({ profile_id: profileId, ua: req.headers.get("user-agent") });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
