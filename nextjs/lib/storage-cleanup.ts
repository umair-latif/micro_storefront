// lib/storage-cleanup.ts
import { createClient } from "@/lib/supabase-client";

type Parsed = { bucket: string; path: string };

/**
 * Accepts public URLs returned by supabase.storage.getPublicUrl(...),
 * e.g. https://<PROJECT>.supabase.co/storage/v1/object/public/<bucket>/<path>
 * or relative '/storage/v1/object/public/<bucket>/<path>'
 */
export function parseSupabasePublicUrl(url?: string | null): Parsed | null {
  if (!url) return null;

  try {
    // Normalize
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    // Look for '/storage/v1/object/public/<bucket>/<path...>'
    const idx = u.pathname.indexOf("/storage/v1/object/public/");
    if (idx === -1) return null;

    const after = u.pathname.slice(idx + "/storage/v1/object/public/".length); // "<bucket>/<path>"
    const [bucket, ...rest] = after.split("/");
    if (!bucket || rest.length === 0) return null;

    const path = decodeURIComponent(rest.join("/"));
    return { bucket, path };
  } catch {
    return null;
  }
}

/** Remove a single file if it's in our Supabase public buckets. */
export async function removeObjectByUrl(url?: string | null): Promise<boolean> {
  const parsed = parseSupabasePublicUrl(url);
  if (!parsed) return false;

  const supabase = createClient();
  const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
  if (error) {
    // Swallow in UI, but log for diagnostics
    // console.warn("storage remove error", parsed, error);
    return false;
  }
  return true;
}

/** Best-effort batch removal */
export async function removeObjectsByUrls(urls: Array<string | null | undefined>): Promise<void> {
  const supabase = createClient();

  // Group by bucket for fewer calls
  const map = new Map<string, string[]>();
  for (const u of urls) {
    const p = parseSupabasePublicUrl(u);
    if (!p) continue;
    if (!map.has(p.bucket)) map.set(p.bucket, []);
    map.get(p.bucket)!.push(p.path);
  }

  await Promise.all(
    Array.from(map.entries()).map(async ([bucket, paths]) => {
      if (!paths.length) return;
      const { error } = await supabase.storage.from(bucket).remove(paths);
      // if (error) console.warn("batch remove error", bucket, error);
    })
  );
}
