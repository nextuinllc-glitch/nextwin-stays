import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { PAGE_LABELS, type PageKey } from "@/lib/page-content-schema";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEYS: PageKey[] = ["home", "about", "contact"];

export default async function AdminPagesIndex() {
  // Look up which pages have any saved content so the admin can see
  // at-a-glance which still rely on the dictionary defaults.
  const rows = await prisma.pageContent.findMany({
    select: { pageKey: true, updatedAt: true },
  });
  const status = new Map(rows.map((r) => [r.pageKey, r.updatedAt]));

  return (
    <div>
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Pages</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Modifiez le contenu éditorial des pages publiques. Chaque champ
          est traduit en FR / EN / AR ; si vous laissez un champ vide,
          le texte par défaut du dictionnaire i18n est utilisé.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KEYS.map((key) => {
          const updated = status.get(key);
          return (
            <Link
              key={key}
              href={`/admin/pages/${key}`}
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-card-hover"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">{PAGE_LABELS[key]}</div>
                <div className="mt-0.5 text-xs text-ink-soft">
                  {updated
                    ? `Modifiée le ${new Date(updated).toLocaleDateString("fr-FR")}`
                    : "Par défaut (dictionnaire i18n)"}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-soft transition group-hover:text-ink" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
