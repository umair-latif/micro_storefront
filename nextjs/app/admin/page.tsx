import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic'; // Force dynamic rendering


export default async function AdminIndex({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const store = (resolvedSearchParams.store as string) ?? "";
  redirect(`/admin/storefront${store ? `?store=${store}` : ""}`);
}
