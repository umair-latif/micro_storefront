import { redirect } from "next/navigation";

export default function AdminIndex({
  searchParams,
}: { searchParams: Record<string, string | string[] | undefined> }) {
  const store = (searchParams.store as string) ?? "";
  redirect(`/admin/storefront${store ? `?store=${store}` : ""}`);
}