// app/admin/_utils/getProfile.ts
import { createServerSupabase } from "@/lib/supabase-ssr-server";


export async function getProfileByStoreParam(store: string | null) {
if (!store) return null;
const supabase = createServerSupabase();


const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;


const { data, error } = await supabase
.from("profiles")
.select("id, slug, display_name, is_public, owner_uid")
.eq("owner_uid", user.id) // 🔒 only my stores
.or(`id.eq.${store},slug.eq.${store}`)
.maybeSingle();


if (error) return null;
return data;
}
