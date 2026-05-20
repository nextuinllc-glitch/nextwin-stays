import { redirect } from "next/navigation";

/**
 * Legacy index. The admin catalogue is now split into three kind-specific
 * sections - send anyone landing here to the SALE list as the default.
 * The /admin/properties/[id] editor URLs still work unchanged.
 */
export default function AdminPropertiesIndex() {
  redirect("/admin/acheter");
}
