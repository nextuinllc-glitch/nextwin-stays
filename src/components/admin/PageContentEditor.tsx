"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, ChevronLeft, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Field,
  LocalizedValue,
  PageContentMap,
  PageKey,
} from "@/lib/page-content-schema";

type Props = {
  pageKey: PageKey;
  pageLabel: string;
  fields: Field[];
  initialContent: PageContentMap;
};

type Locale = "fr" | "en" | "ar";

export function PageContentEditor({
  pageKey,
  pageLabel,
  fields,
  initialContent,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState<PageContentMap>(initialContent);
  const [locale, setLocale] = useState<Locale>("fr");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group fields by their declared `group` so the form lays out as
  // sectioned cards instead of one long list.
  const groups = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const f of fields) {
      const list = map.get(f.group) ?? [];
      list.push(f);
      map.set(f.group, list);
    }
    return Array.from(map.entries());
  }, [fields]);

  const setFieldValue = (key: string, val: string) => {
    setSaved(false);
    setContent((prev) => {
      const next: PageContentMap = { ...prev };
      const bundle: LocalizedValue = { ...(next[key] ?? {}) };
      bundle[locale] = val;
      next[key] = bundle;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${pageKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        setError(j?.error ?? "Sauvegarde impossible");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Toutes les pages
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            {pageLabel}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Champs vides &rarr; le texte par défaut du dictionnaire est utilisé.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Locale tabs — switch which language column we're editing */}
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold">
            {(["fr", "en", "ar"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 uppercase transition",
                  locale === l
                    ? "bg-brand-600 text-white"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={cn(
              "btn-primary",
              saving && "opacity-60",
            )}
          >
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </button>
        </div>
      </header>

      {(saved || error) && (
        <div
          className={cn(
            "mt-4 rounded-lg border px-4 py-2.5 text-sm",
            saved && "border-emerald-200 bg-emerald-50 text-emerald-700",
            error && "border-rose-200 bg-rose-50 text-rose-700",
          )}
        >
          {saved && "✓ Modifications enregistrées."}
          {error}
        </div>
      )}

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        <Globe className="h-3 w-3" />
        Édition en{" "}
        <span className="text-ink">
          {locale === "fr" ? "français" : locale === "en" ? "anglais" : "arabe"}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map(([group, list]) => (
          <section
            key={group}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
              {group}
            </h2>

            <div className="mt-4 space-y-4">
              {list.map((f) => {
                const bundle = content[f.key] ?? {};
                const value = bundle[locale] ?? "";
                return (
                  <label key={f.key} className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                      {f.label}
                    </span>
                    {f.hint && (
                      <span className="ml-2 text-[11px] text-ink-soft">{f.hint}</span>
                    )}
                    <div className="mt-1.5">
                      {f.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={value}
                          dir={locale === "ar" ? "rtl" : "ltr"}
                          onChange={(e) => setFieldValue(f.key, e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          dir={locale === "ar" ? "rtl" : "ltr"}
                          onChange={(e) => setFieldValue(f.key, e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        />
                      )}
                    </div>
                    {/* Hint when the OTHER locales already have content */}
                    {locale !== "fr" && bundle.fr && !value && (
                      <span className="mt-1 inline-block text-[11px] text-ink-soft">
                        FR : <em>{bundle.fr}</em>
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
