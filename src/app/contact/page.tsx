import { ContactContent } from "@/components/ContactContent";
import { getPageContent } from "@/lib/page-content-repo";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const pageContent = await getPageContent("contact");
  return <ContactContent pageContent={pageContent} />;
}
