import { AboutContent } from "@/components/AboutContent";
import { getPageContent } from "@/lib/page-content-repo";

export default async function AboutPage() {
  const pageContent = await getPageContent("about");
  return <AboutContent pageContent={pageContent} />;
}
