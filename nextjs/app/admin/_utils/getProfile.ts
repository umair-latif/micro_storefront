// app/admin/_utils/getProfile.ts
import { createServerSupabase } from "@/lib/supabase-ssr-server";

export async function getProfileByStoreParam(store: string | null) {
  if (!store) return null;
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, slug, display_name, is_public")
    .or(`id.eq.${store},slug.eq.${store}`)
    .maybeSingle();

  if (error) return null;
  return data;
}
