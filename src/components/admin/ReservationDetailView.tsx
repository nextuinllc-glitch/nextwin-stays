"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  CalendarDays,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  XCircle,
  LogIn,
  CheckCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  STATUS_BADGE,
  STATUS_LABEL_FR,
  STATUS_TRANSITIONS,
  SOURCE_LABEL,
  type ReservationStatus,
  type BookingSource,
} from "@/lib/reservation-status";
import { cn, formatPrice } from "@/lib/utils";

type Reservation = {
  id: string;
  reference: string;
  status: string;
  source: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  notes: string | null;
  specialRequests: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  property: {
    id: string;
    slug: string;
    title: string;
    area: string;
    city: string;
    image: string | null;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    vip: boolean;
    totalSpend: number;
  };
};

const ACTION_ICON: Record<ReservationStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  CHECKED_IN: <LogIn className="h-4 w-4" />,
  COMPLETED: <CheckCheck className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  NO_SHOW: <AlertTriangle className="h-4 w-4" />,
};

const ACTION_BTN: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-600 hover:bg-amber-700",
  CONFIRMED: "bg-emerald-600 hover:bg-emerald-700",
  CHECKED_IN: "bg-sky-600 hover:bg-sky-700",
  COMPLETED: "bg-slate-700 hover:bg-slate-800",
  CANCELLED: "bg-rose-600 hover:bg-rose-700",
  NO_SHOW: "bg-rose-600 hover:bg-rose-700",
};

export function ReservationDetailView({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const status = reservation.status as ReservationStatus;
  const source = reservation.source as BookingSource;
  const transitions = STATUS_TRANSITIONS[status] ?? [];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  const fmtTime = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  const subtotal = reservation.nightlyRate * reservation.nights;

  const transition = async (target: ReservationStatus) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) {
        setError(j?.error ?? "Transition impossible.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) {
        setError(j?.error ?? "Annulation impossible.");
        return;
      }
      setCancelOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Retour aux réservations
      </Link>

      <header className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            {reservation.reference}
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {reservation.property.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold",
                STATUS_BADGE[status],
              )}
            >
              {STATUS_LABEL_FR[status]}
            </span>
            <span className="text-[11px] text-ink-soft">
              Source : <strong>{SOURCE_LABEL[source]}</strong>
            </span>
            <span className="text-[11px] text-ink-soft">
              Créée le {fmtTime(reservation.createdAt)}
            </span>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex flex-wrap items-center gap-2">
          {transitions.length === 0 ? (
            <span className="text-xs italic text-ink-soft">Statut final, pas d&apos;action possible.</span>
          ) : (
            transitions.map((t) =>
              t === "CANCELLED" ? (
                <button
                  key={t}
                  onClick={() => setCancelOpen(true)}
                  disabled={busy}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50",
                    ACTION_BTN[t],
                  )}
                >
                  {ACTION_ICON[t]}
                  Annuler
                </button>
              ) : (
                <button
                  key={t}
                  onClick={() => transition(t)}
                  disabled={busy}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50",
                    ACTION_BTN[t],
                  )}
                >
                  {ACTION_ICON[t]}
                  {STATUS_LABEL_FR[t]}
                </button>
              ),
            )
          )}
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Property card */}
          <Card title="Propriété">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {reservation.property.image && (
                  <Image
                    src={reservation.property.image}
                    alt={reservation.property.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-base font-semibold text-ink">
                  {reservation.property.title}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3 w-3" />
                  {reservation.property.area}, {reservation.property.city}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/properties/${reservation.property.id}`}
                    className="text-[11px] font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    Modifier la propriété
                  </Link>
                  <Link
                    href={`/properties/${reservation.property.slug}`}
                    target="_blank"
                    className="text-[11px] font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    Voir publique →
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Stay info */}
          <Card title="Séjour">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info icon={<CalendarDays className="h-4 w-4" />} label="Arrivée" value={fmt(reservation.checkIn)} />
              <Info icon={<CalendarDays className="h-4 w-4" />} label="Départ" value={fmt(reservation.checkOut)} />
              <Info
                icon={<CalendarDays className="h-4 w-4" />}
                label="Durée"
                value={`${reservation.nights} ${reservation.nights === 1 ? "nuit" : "nuits"}`}
              />
              <Info
                icon={<Users className="h-4 w-4" />}
                label="Invités"
                value={`${reservation.guests} ${reservation.guests === 1 ? "invité" : "invités"}`}
              />
            </div>
          </Card>

          {/* Notes */}
          {(reservation.notes || reservation.specialRequests) && (
            <Card title="Notes">
              {reservation.notes && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                    Notes internes
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink">{reservation.notes}</p>
                </div>
              )}
              {reservation.specialRequests && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                    Demandes spéciales
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink">
                    {reservation.specialRequests}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Cancellation banner */}
          {status === "CANCELLED" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                <XCircle className="h-4 w-4" />
                Réservation annulée
                {reservation.cancelledAt && (
                  <span className="font-normal text-rose-600/80">
                    · {fmtTime(reservation.cancelledAt)}
                  </span>
                )}
              </div>
              {reservation.cancellationReason && (
                <p className="mt-1.5 text-sm text-rose-700/90">
                  Motif : {reservation.cancellationReason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client card */}
          <Card title="Client">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-ink">
                  {reservation.client.firstName} {reservation.client.lastName}
                </span>
                {reservation.client.vip && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    VIP
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1.5 text-xs text-ink-muted">
                {reservation.client.email && (
                  <a
                    href={`mailto:${reservation.client.email}`}
                    className="flex items-center gap-1.5 hover:text-brand-700"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {reservation.client.email}
                  </a>
                )}
                {reservation.client.phone && (
                  <a
                    href={`tel:${reservation.client.phone}`}
                    className="flex items-center gap-1.5 hover:text-brand-700"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {reservation.client.phone}
                  </a>
                )}
              </div>
              <div className="mt-3 rounded-lg bg-cream-50 px-3 py-2 text-xs">
                Total cumulé&nbsp;:{" "}
                <strong className="text-ink">{formatPrice(reservation.client.totalSpend)}</strong>
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card title="Tarification">
            <div className="space-y-2 text-sm">
              <Row
                label={`${formatPrice(reservation.nightlyRate)} × ${reservation.nights} ${
                  reservation.nights === 1 ? "nuit" : "nuits"
                }`}
                value={formatPrice(subtotal)}
              />
              <Row label="Frais de ménage" value={formatPrice(reservation.cleaningFee)} />
              <Row label="Frais de service" value={formatPrice(reservation.serviceFee)} />
              <div className="!mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(reservation.total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel modal */}
      {cancelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => !busy && setCancelOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            <h3 className="font-display text-lg font-semibold text-ink">
              Annuler la réservation ?
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Le calendrier sera libéré immédiatement et le client retiré du séjour.
            </p>
            <label className="mt-4 block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                Motif (interne)
              </span>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Annulation client, force majeure, double-booking, …"
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
            </label>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelOpen(false)}
                disabled={busy}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-ink hover:border-gray-300"
              >
                Garder
              </button>
              <button
                onClick={cancel}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                {busy ? "Annulation…" : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-cream-50/50 p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        <span className="text-brand-600">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-muted">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
