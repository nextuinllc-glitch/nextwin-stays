import { notFound } from "next/navigation";
import { PAGE_LABELS, PAGE_SCHEMAS, type PageKey } from "@/lib/page-content-schema";
import { getPageContent } from "@/lib/page-content-repo";
import { PageContentEditor } from "@/components/admin/PageContentEditor";

export const dynamic = "force-dynamic";

const VALID: PageKey[] = ["home", "about", "contact"];

export default async function AdminPageEdit({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!(VALID as string[]).includes(key)) notFound();
  const pageKey = key as PageKey;

  const initialContent = await getPageContent(pageKey);
  const fields = PAGE_SCHEMAS[pageKey];

  return (
    <PageContentEditor
      pageKey={pageKey}
      pageLabel={PAGE_LABELS[pageKey]}
      fields={fields}
      initialContent={initialContent}
    />
  );
}
