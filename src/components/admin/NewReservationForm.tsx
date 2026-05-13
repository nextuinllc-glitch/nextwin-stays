"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Search,
  AlertTriangle,
  CheckCircle2,
  Users,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  BOOKING_SOURCES,
  SOURCE_LABEL,
  type BookingSource,
} from "@/lib/reservation-status";

type Property = {
  id: string;
  title: string;
  area: string;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  image: string | null;
};

type Defaults = {
  propertyId: string | null;
  checkIn: string | null;
  cleaningFee: number;
  serviceFeeRate: number;
};

type ClientHit = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  vip: boolean;
  totalSpend: number;
};

type Props = {
  properties: Property[];
  defaults: Defaults;
};

type Avail =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok" }
  | { state: "conflict"; conflicts: Array<{ reference: string; checkIn: string; checkOut: string }> };

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

export function NewReservationForm({ properties, defaults }: Props) {
  const router = useRouter();

  const [propertyId, setPropertyId] = useState<string>(defaults.propertyId ?? properties[0]?.id ?? "");
  const property = properties.find((p) => p.id === propertyId) ?? null;

  const [checkIn, setCheckIn] = useState<string>(defaults.checkIn ?? todayISO());
  const [checkOut, setCheckOut] = useState<string>(addDaysISO(defaults.checkIn ?? todayISO(), 3));
  const [guests, setGuests] = useState<number>(2);
  const [source, setSource] = useState<BookingSource>("DIRECT");
  const [notes, setNotes] = useState("");

  // Pricing — pre-filled from property + settings, can be overridden.
  const [nightlyRate, setNightlyRate] = useState<number>(property?.pricePerNight ?? 0);
  const [cleaningFee, setCleaningFee] = useState<number>(defaults.cleaningFee);
  const [serviceFeeRate] = useState<number>(defaults.serviceFeeRate);

  // Sync nightly rate when property changes (only if user hasn't overridden).
  const lastPropertyRef = useRef(property?.id);
  useEffect(() => {
    if (lastPropertyRef.current !== property?.id && property) {
      setNightlyRate(property.pricePerNight);
      lastPropertyRef.current = property.id;
    }
  }, [property]);

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nightlyRate * nights;
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const total = nights ? subtotal + cleaningFee + serviceFee : 0;

  // ── Client picker ──────────────────────────────────────────────────
  const [clientMode, setClientMode] = useState<"existing" | "new">("new");
  const [picked, setPicked] = useState<ClientHit | null>(null);

  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientHit[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (clientMode !== "existing") return;
    if (clientSearch.trim().length < 2) {
      setClientResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/clients/search?q=${encodeURIComponent(clientSearch)}`);
        const j = await res.json();
        if (j?.ok) setClientResults(j.clients);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [clientSearch, clientMode]);

  // New-client fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ── Availability check (debounced on dates/property) ───────────────
  const [avail, setAvail] = useState<Avail>({ state: "idle" });
  useEffect(() => {
    if (!propertyId || !checkIn || !checkOut || nights < 1) {
      setAvail({ state: "idle" });
      return;
    }
    setAvail({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/reservations/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, checkIn, checkOut }),
        });
        const j = await res.json();
        if (!j?.ok) {
          setAvail({ state: "idle" });
          return;
        }
        if (j.available) setAvail({ state: "ok" });
        else
          setAvail({
            state: "conflict",
            conflicts: (j.conflicts ?? []).map((c: { reference: string; checkIn: string; checkOut: string }) => ({
              reference: c.reference,
              checkIn: new Date(c.checkIn).toISOString().slice(0, 10),
              checkOut: new Date(c.checkOut).toISOString().slice(0, 10),
            })),
          });
      } catch {
        setAvail({ state: "idle" });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [propertyId, checkIn, checkOut, nights]);

  // ── Submit ─────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formValid = useMemo(() => {
    if (!propertyId || nights < 1) return false;
    if (avail.state === "conflict") return false;
    if (clientMode === "existing") return Boolean(picked);
    return Boolean(firstName.trim() && (phone.trim() || email.trim()));
  }, [propertyId, nights, avail, clientMode, picked, firstName, phone, email]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        propertyId,
        checkIn,
        checkOut,
        guests,
        source,
        notes: notes.trim() || undefined,
        nightlyRate,
        cleaningFee,
        client:
          clientMode === "existing" && picked
            ? { id: picked.id }
            : {
                firstName: firstName.trim(),
                lastName: lastName.trim() || "—",
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
              },
      };
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) {
        setError(j?.error ?? "Création impossible.");
        return;
      }
      router.push(`/admin/reservations/${j.id}`);
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Property */}
        <Card title="Propriété">
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="form-input"
          >
            <option value="">— Choisir une propriété —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {p.area} · €{p.pricePerNight}/nuit
              </option>
            ))}
          </select>
          {property && (
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-cream-50 p-3">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {property.image && (
                  <Image src={property.image} alt={property.title} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-ink">{property.title}</div>
                <div className="text-ink-muted">
                  {property.area} · jusqu&apos;à {property.maxGuests} invités · €
                  {property.pricePerNight}/nuit
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Dates + guests */}
        <Card title="Dates & invités">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Arrivée">
              <input
                type="date"
                className="form-input"
                value={checkIn}
                min={todayISO()}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (new Date(checkOut) <= new Date(e.target.value)) {
                    setCheckOut(addDaysISO(e.target.value, 1));
                  }
                }}
              />
            </Field>
            <Field label="Départ">
              <input
                type="date"
                className="form-input"
                value={checkOut}
                min={addDaysISO(checkIn || todayISO(), 1)}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <Users className="h-4 w-4 text-brand-600" />
              Invités
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300 disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(property?.maxGuests ?? 16, g + 1))}
                disabled={guests >= (property?.maxGuests ?? 16)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Availability indicator */}
          <AvailabilityIndicator avail={avail} nights={nights} />
        </Card>

        {/* Client */}
        <Card title="Client">
          <div className="mb-3 inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setClientMode("new")}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition",
                clientMode === "new" ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              Nouveau
            </button>
            <button
              type="button"
              onClick={() => setClientMode("existing")}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition",
                clientMode === "existing" ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              Existant
            </button>
          </div>

          {clientMode === "new" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom">
                <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Field>
              <Field label="Nom">
                <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Téléphone">
                <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  className="form-input pl-9"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setPicked(null);
                  }}
                  placeholder="Nom, email ou téléphone…"
                />
              </div>
              {searching && <div className="mt-2 text-xs text-ink-soft">Recherche…</div>}
              {clientResults.length > 0 && !picked && (
                <ul className="mt-2 max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                  {clientResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setPicked(c)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-brand-50/50"
                      >
                        <div>
                          <div className="text-sm font-semibold text-ink">
                            {c.firstName} {c.lastName} {c.vip && <span className="text-amber-600">★</span>}
                          </div>
                          <div className="text-[11px] text-ink-soft">
                            {c.email ?? c.phone ?? "—"}
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold text-brand-700">
                          {formatPrice(c.totalSpend)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {picked && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {picked.firstName} {picked.lastName}
                    </div>
                    <div className="text-[11px] text-ink-muted">
                      {picked.email ?? picked.phone ?? "—"} · {formatPrice(picked.totalSpend)} cumulés
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPicked(null)}
                    className="text-ink-muted hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Source + notes */}
        <Card title="Détails">
          <Field label="Canal de réservation">
            <select
              className="form-input"
              value={source}
              onChange={(e) => setSource(e.target.value as BookingSource)}
            >
              {BOOKING_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes (interne)">
            <textarea
              rows={3}
              className="form-input resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Heure d'arrivée, demandes spéciales, transferts, etc."
            />
          </Field>
        </Card>
      </div>

      {/* Right column — pricing summary */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">Récapitulatif</h2>

          <div className="mt-4 space-y-2 text-sm">
            <Row label="Nuits" value={String(nights)} />
            <Field label="Tarif / nuit (€)">
              <input
                type="number"
                className="form-input"
                value={nightlyRate}
                onChange={(e) => setNightlyRate(Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
            <Field label="Frais de ménage (€)">
              <input
                type="number"
                className="form-input"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
            <Row label={`Sous-total (${nights} × €${nightlyRate})`} value={formatPrice(subtotal)} />
            <Row label="Frais de service" value={formatPrice(serviceFee)} />
            <div className="!mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!formValid || saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Création…" : "Créer la réservation"}
          </button>

          <p className="mt-2 text-center text-[11px] text-ink-soft">
            Statut initial : <strong>En attente</strong>. Vous confirmerez après réception du paiement.
          </p>
        </div>
      </aside>

      <style>{`
        .form-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: #0F172A;
          outline: none;
          transition: all 0.15s;
        }
        .form-input::placeholder { color: #94A3B8; }
        .form-input:focus {
          border-color: #FF385C;
          box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.15);
        }
      `}</style>
    </div>
  );
}

function AvailabilityIndicator({ avail, nights }: { avail: Avail; nights: number }) {
  if (nights < 1) {
    return (
      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-ink-muted">
        Sélectionnez des dates valides (au moins 1 nuit).
      </div>
    );
  }
  if (avail.state === "checking") {
    return (
      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-ink-muted">
        Vérification de la disponibilité…
      </div>
    );
  }
  if (avail.state === "ok") {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Disponible — {nights} {nights === 1 ? "nuit" : "nuits"}
      </div>
    );
  }
  if (avail.state === "conflict") {
    return (
      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
        <div className="flex items-center gap-1.5 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Conflit de calendrier
        </div>
        <ul className="mt-1.5 list-disc pl-5">
          {avail.conflicts.map((c) => (
            <li key={c.reference}>
              <span className="font-mono">{c.reference}</span> · {c.checkIn} → {c.checkOut}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
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
