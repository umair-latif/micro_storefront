import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { profileId } = await req.json();
  await supabase.from("analytics_views").insert({ profile_id: profileId }).select();
  return NextResponse.json({ ok: true });
}
