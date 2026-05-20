import { AdminPropertiesList } from "@/components/admin/AdminPropertiesList";

export const dynamic = "force-dynamic";

/**
 * Admin catalog scoped to SHORT_STAY (court séjour) listings. This is the
 * legacy /admin/properties view, now reachable under a kind-specific URL.
 */
export default async function AdminCourtSejourPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  return <AdminPropertiesList kind="SHORT_STAY" searchParams={sp} />;
}
