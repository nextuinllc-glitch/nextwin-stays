import { ContactContent } from "@/components/ContactContent";
import { getPageContent } from "@/lib/page-content-repo";
import { getContactSettings } from "@/lib/settings-repo";

export default async function ContactPage() {
  const [pageContent, contact] = await Promise.all([
    getPageContent("contact"),
    getContactSettings(),
  ]);
  return <ContactContent pageContent={pageContent} contact={contact} />;
}
