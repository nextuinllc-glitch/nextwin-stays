"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  RESERVATION_STATUSES,
  BOOKING_SOURCES,
  STATUS_BADGE,
  STATUS_LABEL_FR,
  SOURCE_LABEL,
  type ReservationStatus,
  type BookingSource,
} from "@/lib/reservation-status";
import { cn, formatPrice } from "@/lib/utils";

type Row = {
  id: string;
  reference: string;
  status: string;
  source: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  currency: string;
  property: { id: string; title: string; image: string | null };
  client: { firstName: string; lastName: string; email: string | null };
};

type Props = {
  reservations: Row[];
  properties: Array<{ id: string; title: string }>;
};

export function ReservationsListView({ reservations, properties }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    });
    router.push(`/admin/reservations?${next.toString()}`);
  };

  const status = params.get("status") ?? "ALL";
  const source = params.get("source") ?? "ALL";
  const propertyId = params.get("propertyId") ?? "";

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(iso),
    );

  return (
    <div className="mt-6 space-y-4">
      {/* Filter bar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-card">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: search || null });
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche : référence, client, email…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </form>

          <Select
            value={status}
            onChange={(v) => update({ status: v === "ALL" ? null : v })}
            options={[
              { value: "ALL", label: "Tous statuts" },
              ...RESERVATION_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL_FR[s] })),
            ]}
          />
          <Select
            value={source}
            onChange={(v) => update({ source: v === "ALL" ? null : v })}
            options={[
              { value: "ALL", label: "Toutes sources" },
              ...BOOKING_SOURCES.map((s) => ({ value: s, label: SOURCE_LABEL[s] })),
            ]}
          />
          <Select
            value={propertyId}
            onChange={(v) => update({ propertyId: v || null })}
            options={[
              { value: "", label: "Toutes propriétés" },
              ...properties.map((p) => ({ value: p.id, label: p.title })),
            ]}
          />
        </div>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        {reservations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-ink">Aucune réservation</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              Aucune réservation ne correspond à ces filtres.
            </p>
            <Link
              href="/admin/reservations/new"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Créer la première
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3">Réf · Propriété</th>
                <th className="hidden px-4 py-3 md:table-cell">Client</th>
                <th className="hidden px-4 py-3 lg:table-cell">Séjour</th>
                <th className="px-4 py-3">Statut</th>
                <th className="hidden px-4 py-3 sm:table-cell">Source</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const status = (r.status as ReservationStatus) ?? "PENDING";
                const source = (r.source as BookingSource) ?? "DIRECT";
                return (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-b border-gray-50 transition last:border-b-0 hover:bg-brand-50/30"
                    onClick={() => router.push(`/admin/reservations/${r.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {r.property.image && (
                            <Image
                              src={r.property.image}
                              alt={r.property.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                            {r.reference}
                          </div>
                          <div className="truncate text-sm font-semibold text-ink">
                            {r.property.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="text-sm font-medium text-ink">
                        {r.client.firstName} {r.client.lastName}
                      </div>
                      {r.client.email && (
                        <div className="text-[11px] text-ink-soft">{r.client.email}</div>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-ink-muted lg:table-cell">
                      {fmt(r.checkIn)} → {fmt(r.checkOut)}
                      <div className="text-[11px] text-ink-soft">
                        {r.nights} {r.nights === 1 ? "nuit" : "nuits"} · {r.guests}{" "}
                        {r.guests === 1 ? "invité" : "invités"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          STATUS_BADGE[status] ?? STATUS_BADGE.PENDING,
                        )}
                      >
                        {STATUS_LABEL_FR[status] ?? status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-ink-muted sm:table-cell">
                      {SOURCE_LABEL[source] ?? source}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatPrice(r.total, r.currency as "EUR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
    </div>
  );
}
