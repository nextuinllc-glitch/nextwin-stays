import { AdminPropertiesList } from "@/components/admin/AdminPropertiesList";

export const dynamic = "force-dynamic";

/**
 * Admin catalog scoped to RENT_LONG (long-term rental) listings.
 */
export default async function AdminLouerPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  return <AdminPropertiesList kind="RENT_LONG" searchParams={sp} />;
}
