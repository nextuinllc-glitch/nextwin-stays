"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { PropertyType } from "@/lib/properties";
import { cn } from "@/lib/utils";

type Pill = { value: PropertyType | "all"; label: string; count: number };

type Props = {
  pills: Pill[];
};

const ACTIVE_BG: Record<string, string> = {
  all: "bg-brand-600 text-white border-brand-600",
  villa: "bg-violet-500 text-white border-violet-500",
  riad: "bg-amber-600 text-white border-amber-600",
  apartment: "bg-sky-400 text-white border-sky-400",
};

export function TypePills({ pills }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = (params.get("type") ?? "all") as PropertyType | "all";

  const select = (value: PropertyType | "all") => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("type");
    else next.set("type", value);
    router.push(`${pathname}?${next.toString()}`);
  };

  // Split "All" from the type-specific pills so we can stack them in the
  // editorial 2-row layout: ALL on its own row above, type pills below.
  const allPill = pills.find((p) => p.value === "all");
  const typePills = pills.filter((p) => p.value !== "all");

  const renderPill = (p: Pill) => {
    const isActive = active === p.value;
    const activeClass = ACTIVE_BG[p.value] ?? "bg-ink text-white border-ink";
    return (
      <button
        key={p.value}
        onClick={() => select(p.value)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
          isActive
            ? activeClass
            : "border-gray-200 bg-white text-ink hover:border-gray-300",
        )}
      >
        <span>{p.label}</span>
        <span className={cn("text-xs", isActive ? "text-white/80" : "text-ink-soft")}>
          ({p.count})
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Row 1 — the "All" master toggle, isolated so it reads as a
          parent option above the type-specific filters. */}
      {allPill && <div className="flex justify-center">{renderPill(allPill)}</div>}
      {/* Row 2 — Villa / Apartment / Riad. Wraps if it overflows on
          narrow screens so we never get a horizontal scroll bar. */}
      <div className="flex flex-wrap justify-center gap-2">
        {typePills.map(renderPill)}
      </div>
    </div>
  );
}
