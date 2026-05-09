import { prisma } from "@/lib/db";
import type { PageContentMap, PageKey } from "@/lib/page-content-schema";

// Read content for one page. Returns an empty object if the row
// doesn't exist or the JSON is malformed — callers always treat it
// as "no override yet" and fall back to dictionary defaults.
export async function getPageContent(pageKey: PageKey): Promise<PageContentMap> {
  const row = await prisma.pageContent.findUnique({ where: { pageKey } });
  if (!row) return {};
  try {
    const parsed = JSON.parse(row.contentJson);
    return typeof parsed === "object" && parsed ? (parsed as PageContentMap) : {};
  } catch {
    return {};
  }
}

// Upsert — creates the row on first save, replaces it after.
export async function setPageContent(pageKey: PageKey, content: PageContentMap) {
  return prisma.pageContent.upsert({
    where: { pageKey },
    create: { pageKey, contentJson: JSON.stringify(content) },
    update: { contentJson: JSON.stringify(content) },
  });
}
