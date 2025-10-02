// app/admin/products/page.tsx
import { getProfileByStoreParam } from "../_utils/getProfile";
import ProductsManager from "./ui/ProductsManager";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: { searchParams: Record<string, string | string[] | undefined> }) {
  const store = (searchParams.store as string) ?? null;
  const profile = await getProfileByStoreParam(store);

  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Products</h1>
        <p className="text-sm text-neutral-600">
          Select a store from the top bar to manage products.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Products</h1>
        <p className="text-sm text-neutral-600">/{profile.slug}</p>
      </div>
      <ProductsManager profileId={profile.id} />
    </div>
  );
}
