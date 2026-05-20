import { AboutContent } from "@/components/AboutContent";
import { TeamSection } from "@/components/TeamSection";
import { getPageContent } from "@/lib/page-content-repo";
import { getPublishedTeam } from "@/lib/team-repo";

export default async function AboutPage() {
  const [pageContent, team] = await Promise.all([
    getPageContent("about"),
    getPublishedTeam(),
  ]);
  return (
    <>
      <AboutContent pageContent={pageContent} />
      <TeamSection team={team} />
    </>
  );
}
