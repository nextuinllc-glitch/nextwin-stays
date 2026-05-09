"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  STATUS_BAR,
  STATUS_LABEL_FR,
  RESERVATION_STATUSES,
  type ReservationStatus,
} from "@/lib/reservation-status";
import { cn } from "@/lib/utils";

type Property = {
  id: string;
  title: string;
  type: string;
  area: string;
  image: string | null;
};

type Reservation = {
  id: string;
  reference: string;
  propertyId: string;
  status: string;
  checkIn: string;
  checkOut: string;
  clientName: string;
};

type Props = {
  monthStart: string; // ISO
  monthEnd: string;   // ISO (exclusive — first of next month)
  properties: Property[];
  reservations: Reservation[];
};

const DAY_LABEL = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function MasterCalendar({ monthStart, monthEnd, properties, reservations }: Props) {
  const router = useRouter();
  const start = new Date(monthStart);
  const end = new Date(monthEnd);
  const daysInMonth = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
    .format(start)
    .replace(/^./, (c) => c.toUpperCase());

  const prevMonth = (() => {
    const d = new Date(start);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const nextMonth = (() => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const thisMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group reservations by property for fast row lookup.
  const byProperty: Record<string, Reservation[]> = {};
  for (const r of reservations) {
    (byProperty[r.propertyId] ??= []).push(r);
  }

  const isoDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Compute the column index (1-based for CSS grid) of a given date relative
  // to the visible month. Out-of-bounds returns clipped to the edges.
  const colFor = (d: Date) => {
    const idx = Math.round((startOfDay(d).getTime() - start.getTime()) / 86_400_000);
    return Math.max(0, Math.min(daysInMonth, idx));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Calendrier</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Vue d&apos;ensemble du mois — cliquez une cellule libre pour créer une réservation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/calendar?m=${prevMonth}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-[140px] text-center font-display text-base font-semibold text-ink">
            {monthLabel}
          </div>
          <Link
            href={`/admin/calendar?m=${nextMonth}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/calendar?m=${thisMonth}`}
            className="ml-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gray-50"
          >
            Aujourd&apos;hui
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-muted">
        {RESERVATION_STATUSES.filter((s) => s !== "NO_SHOW").map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                "inline-block h-2.5 w-4 rounded-sm",
                STATUS_BAR[s as ReservationStatus].split(" ")[0],
              )}
            />
            {STATUS_LABEL_FR[s as ReservationStatus]}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="min-w-[900px]">
          {/* Date header */}
          <div
            className="sticky top-0 z-10 grid border-b border-gray-100 bg-white"
            style={{
              gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(40px, 1fr))`,
            }}
          >
            <div className="border-r border-gray-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              Propriété
            </div>
            {days.map((d) => {
              const isToday = startOfDay(d).getTime() === today.getTime();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "flex flex-col items-center justify-center border-r border-gray-50 px-1 py-2 text-[10px] font-semibold",
                    isWeekend ? "bg-cream-100/50 text-ink-muted" : "text-ink-soft",
                    isToday && "bg-brand-50 text-brand-700",
                  )}
                >
                  <span className="uppercase tracking-wide">{DAY_LABEL[d.getDay()]}</span>
                  <span className={cn("text-base", isToday ? "font-bold text-brand-700" : "font-semibold text-ink")}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Property rows */}
          {properties.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-ink-muted">
              Aucune propriété publiée. Ajoutez-en depuis{" "}
              <Link href="/admin/properties" className="font-semibold text-brand-700 hover:underline">
                la liste
              </Link>
              .
            </div>
          ) : (
            properties.map((p) => {
              const reservs = byProperty[p.id] ?? [];
              return (
                <div
                  key={p.id}
                  className="relative grid border-b border-gray-50 last:border-b-0"
                  style={{
                    gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(40px, 1fr))`,
                  }}
                >
                  {/* Property label */}
                  <div className="flex items-center gap-2 border-r border-gray-100 px-3 py-2">
                    <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {p.image && (
                        <Image src={p.image} alt={p.title} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="min-w-0 flex-1 truncate text-xs font-semibold text-ink hover:text-brand-700"
                      title={p.title}
                    >
                      {p.title}
                      <span className="block text-[10px] font-normal text-ink-soft">{p.area}</span>
                    </Link>
                  </div>

                  {/* Day cells (background) */}
                  {days.map((d) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday = startOfDay(d).getTime() === today.getTime();
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() =>
                          router.push(`/admin/reservations/new?propertyId=${p.id}&checkIn=${isoDay(d)}`)
                        }
                        className={cn(
                          "group relative h-12 border-r border-gray-50 transition",
                          isWeekend && "bg-cream-100/30",
                          isToday && "bg-brand-50/30",
                          "hover:bg-brand-50/60",
                        )}
                        title={`Nouvelle réservation — ${d.toLocaleDateString("fr-FR")}`}
                      >
                        <Plus className="absolute right-1 top-1 h-3 w-3 text-brand-700 opacity-0 transition group-hover:opacity-100" />
                      </button>
                    );
                  })}

                  {/* Reservation bars (overlay) */}
                  {reservs.map((r) => {
                    const startCol = colFor(new Date(r.checkIn)) + 2; // +1 for property col, +1 because grid is 1-based
                    const endCol = colFor(new Date(r.checkOut)) + 2;
                    const span = Math.max(1, endCol - startCol);
                    if (span < 1) return null;
                    const status = (r.status as ReservationStatus) ?? "PENDING";
                    return (
                      <Link
                        key={r.id}
                        href={`/admin/reservations/${r.id}`}
                        className={cn(
                          "pointer-events-auto absolute top-1 mx-0.5 flex h-10 items-center gap-1.5 truncate rounded-md px-2 text-[10px] font-semibold shadow-sm ring-1 ring-black/5 transition hover:translate-y-[-1px] hover:shadow-md",
                          STATUS_BAR[status],
                        )}
                        style={{
                          gridColumnStart: startCol,
                          gridColumnEnd: `span ${span}`,
                        }}
                        title={`${r.reference} · ${r.clientName}`}
                      >
                        <span className="truncate">{r.clientName}</span>
                        <span className="ml-auto shrink-0 font-mono text-[9px] opacity-80">
                          {r.reference.slice(-4)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-ink-soft">
        💡 Les barres hachurées indiquent les annulations. Cliquez sur une barre pour ouvrir la réservation, ou sur une cellule libre pour en créer une.
      </p>
    </div>
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
