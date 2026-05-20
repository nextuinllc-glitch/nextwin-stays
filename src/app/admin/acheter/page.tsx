import { AdminPropertiesList } from "@/components/admin/AdminPropertiesList";

export const dynamic = "force-dynamic";

/**
 * Admin catalog scoped to SALE listings. The shared AdminPropertiesList
 * component handles the table, filters, and counts; this thin wrapper just
 * pins the listingKind.
 */
export default async function AdminAcheterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  return <AdminPropertiesList kind="SALE" searchParams={sp} />;
}
