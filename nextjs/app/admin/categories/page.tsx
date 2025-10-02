// app/admin/categories/page.tsx
import { getProfileByStoreParam } from "../_utils/getProfile";
import CategoriesManager from "./ui/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: { searchParams: Record<string, string | string[] | undefined> }) {
  const store = (searchParams.store as string) ?? null;
  const profile = await getProfileByStoreParam(store);

  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Categories</h1>
        <p className="text-sm text-neutral-600">
          Select a store from the top bar to manage categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Categories</h1>
        <p className="text-sm text-neutral-600">/{profile.slug}</p>
      </div>
      <CategoriesManager profileId={profile.id} />
    </div>
  );
}
