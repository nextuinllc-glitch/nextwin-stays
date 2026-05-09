"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Counts = {
  all: number;
  riad: number;
  villa: number;
  apartment: number;
};

const TABS: Array<{ id: keyof Counts; label: string; tone: string }> = [
  { id: "all", label: "Toutes", tone: "border-brand-600 text-brand-700 bg-brand-50" },
  { id: "riad", label: "Riad", tone: "border-amber-500 text-amber-700 bg-amber-50" },
  { id: "villa", label: "Villa", tone: "border-violet-500 text-violet-700 bg-violet-50" },
  {
    id: "apartment",
    label: "Appartement",
    tone: "border-sky-500 text-sky-700 bg-sky-50",
  },
];

// State lives entirely in the URL (?type=&q=) so the server component owns
// the filtering and there's no client-side data fetching. useTransition
// keeps the pills snappy while the server re-renders behind the scenes.
export function PropertyFilterBar({ counts }: { counts: Counts }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentType = (params.get("type") ?? "all") as keyof Counts;
  const currentQ = params.get("q") ?? "";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`/admin/properties?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        pending && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = currentType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setParam("type", tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                active
                  ? tab.tone
                  : "border-gray-200 bg-white text-ink-muted hover:border-gray-300 hover:text-ink",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  active ? "bg-white/70 text-ink" : "bg-gray-100 text-ink-soft",
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative sm:w-64">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          // Uncontrolled is fine — onChange just nudges the URL, and the
          // server response repaints the row. Avoids the cursor-jump that
          // controlled inputs sometimes have under transitions.
          defaultValue={currentQ}
          placeholder="Rechercher un nom, quartier…"
          onChange={(e) => setParam("q", e.target.value.trim() || null)}
          className="w-full rounded-full border border-gray-200 bg-white py-2 ps-9 pe-9 text-xs text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {currentQ && (
          <button
            type="button"
            onClick={() => setParam("q", null)}
            aria-label="Effacer"
            className="absolute end-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition hover:bg-gray-100 hover:text-ink"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
