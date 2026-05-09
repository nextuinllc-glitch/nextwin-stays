"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  CalendarDays,
  Users,
  ShieldCheck,
  Clock,
  Building2,
  Banknote,
  MapPin,
  Star,
  Check,
  Lock,
  MessageCircle,
} from "lucide-react";
import type { Property } from "@/lib/properties";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPE_BADGE_CLASS } from "@/lib/properties";
import { cn, formatPrice, nightsBetween } from "@/lib/utils";
import { Logo } from "./Logo";

type Initial = {
  from: string | null;
  to: string | null;
  guests: number;
};

type Props = {
  property: Property;
  initial: Initial;
};

type PaymentMethod = "bank" | "cash";

const SERVICE_FEE_RATE = 0.07;
const CLEANING_FEE = 45;

// Concierge WhatsApp number used for finalising bookings — replace with the
// real Marrakech ops number in production.
const CONCIERGE_PHONE = "+212600000000";

export function CheckoutForm({ property, initial }: Props) {
  const fromDate = useMemo(() => (initial.from ? new Date(initial.from) : null), [initial.from]);
  const toDate = useMemo(() => (initial.to ? new Date(initial.to) : null), [initial.to]);
  const nights = nightsBetween(fromDate, toDate);
  const subtotal = property.pricePerNight * Math.max(nights, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = nights ? subtotal + CLEANING_FEE + serviceFee : property.pricePerNight;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("bank");

  const formValid =
    fullName.trim().length >= 2 && phone.trim().length >= 6 && nights > 0;

  const fmtDate = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d)
      : "—";

  const buildMessage = () => {
    const lines = [
      "Bonjour NEXTWIN,",
      "",
      "Je souhaite réserver :",
      "",
      `🏡 ${property.title}`,
      `📍 ${property.area}, ${property.city}`,
      `📅 ${fmtDate(fromDate)} → ${fmtDate(toDate)}  (${nights} ${nights === 1 ? "nuit" : "nuits"})`,
      `👥 ${initial.guests} ${initial.guests === 1 ? "invité" : "invités"}`,
      "",
      `💳 Mode de paiement : ${payment === "bank" ? "Virement bancaire" : "Espèces à l'arrivée"}`,
      `💰 Total : ${formatPrice(total)}  (logement + ménage + service)`,
      "",
      `👤 ${fullName}`,
      `📱 ${phone}`,
    ];
    if (message.trim()) {
      lines.push("", `📝 ${message.trim()}`);
    }
    lines.push("", "Merci de me confirmer la disponibilité.");
    return lines.join("\n");
  };

  const whatsappHref = `https://wa.me/${CONCIERGE_PHONE.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(buildMessage())}`;

  return (
    <>
      {/* Isolated brand strip — replaces the global header on the checkout flow */}
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Logo />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            <Lock className="h-3 w-3" />
            Sécurisé
          </span>
        </div>
      </div>

      <div className="container-page py-6 pb-32 sm:py-8 lg:pb-10">
        <Link
          href={`/properties/${property.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Retour à la propriété
        </Link>

        <header className="mt-3 max-w-2xl">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Confirmez votre réservation
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Aucun débit. Notre conciergerie confirme sur WhatsApp en moins d&apos;une heure.
          </p>
        </header>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          {/* Personal info — minimal: name + phone + optional message */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
            <h2 className="font-display text-xl font-semibold text-ink">
              Vos coordonnées
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Utilisées uniquement pour confirmer cette réservation.
            </p>

            <div className="mt-4 space-y-3">
              <Field label="Nom complet">
                <input
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Yasmine El Idrissi"
                  autoComplete="name"
                />
              </Field>
              <Field label="Téléphone (avec indicatif)">
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Message (facultatif)">
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Heure d'arrivée, occasion spéciale, demandes particulières…"
                />
              </Field>
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">
              Mode de paiement
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Aucun débit en ligne. Vous payez après confirmation de l&apos;hôte.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PaymentTile
                active={payment === "bank"}
                onClick={() => setPayment("bank")}
                icon={<Building2 className="h-5 w-5" />}
                title="Virement bancaire"
                body="Coordonnées bancaires envoyées par WhatsApp après confirmation. Acompte de 30%, solde à l'arrivée."
              />
              <PaymentTile
                active={payment === "cash"}
                onClick={() => setPayment("cash")}
                icon={<Banknote className="h-5 w-5" />}
                title="Espèces à l'arrivée"
                body="Réglez en EUR ou MAD à la remise des clés. Aucun frais supplémentaire."
              />
            </div>

            <div className="mt-6 rounded-xl bg-brand-50/60 p-4 text-xs leading-relaxed text-brand-800">
              <strong className="font-semibold">Comment ça marche :</strong>
              <ol className="mt-1.5 list-decimal pl-5">
                <li>Vous nous envoyez votre demande sur WhatsApp.</li>
                <li>Notre conciergerie confirme la disponibilité sous une heure.</li>
                <li>Vous recevez un récapitulatif officiel et les détails de paiement.</li>
              </ol>
            </div>
          </section>

          {/* Trust + agreement */}
          <section>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Trust
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Annulation gratuite"
                value="jusqu'à 7 jours avant"
              />
              <Trust
                icon={<Clock className="h-4 w-4" />}
                label="Réponse rapide"
                value="moins d'une heure"
              />
              <Trust
                icon={<Lock className="h-4 w-4" />}
                label="Vos données"
                value="chiffrées & privées"
              />
            </div>

            {/* WhatsApp finalize CTA — desktop / tablet */}
            <a
              href={formValid ? whatsappHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!formValid}
              onClick={(e) => {
                if (!formValid) e.preventDefault();
              }}
              className={cn(
                "mt-5 hidden w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-semibold text-white shadow-md transition lg:flex",
                formValid
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "cursor-not-allowed bg-gray-300",
              )}
            >
              <MessageCircle className="h-5 w-5" />
              Finaliser sur WhatsApp
              <span aria-hidden>→</span>
            </a>
            <p className="mt-2 hidden text-center text-[11px] text-ink-soft lg:block">
              En cliquant, vous acceptez nos{" "}
              <Link href="#" className="text-brand-700 underline-offset-2 hover:underline">
                conditions
              </Link>{" "}
              et la{" "}
              <Link href="#" className="text-brand-700 underline-offset-2 hover:underline">
                confidentialité
              </Link>
              . Aucun débit avant confirmation.
            </p>
          </section>
        </div>

        {/* Right: booking summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-widget">
            <div className="flex gap-4 border-b border-gray-100 p-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={property.images[0].src}
                  alt={property.images[0].alt}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <span
                  className={cn(
                    "absolute left-1.5 top-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide",
                    PROPERTY_TYPE_BADGE_CLASS[property.type],
                  )}
                >
                  {PROPERTY_TYPE_LABEL[property.type]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-sm font-semibold text-ink">
                  {property.title}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
                  <MapPin className="h-3 w-3" />
                  {property.area}, {property.city}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-ink">
                  <Star className="h-3 w-3 fill-ink text-ink" />
                  {property.rating.toFixed(2)}
                  <span className="font-normal text-ink-soft">({property.reviewCount})</span>
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-3 p-4">
                <CalendarDays className="h-4 w-4 text-brand-600" />
                <div className="flex-1 text-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Séjour
                  </div>
                  <div className="font-medium text-ink">
                    {fmtDate(fromDate)} → {fmtDate(toDate)}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {nights} {nights === 1 ? "nuit" : "nuits"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <Users className="h-4 w-4 text-brand-600" />
                <div className="flex-1 text-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Invités
                  </div>
                  <div className="font-medium text-ink">
                    {initial.guests} {initial.guests === 1 ? "invité" : "invités"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 p-4 text-sm">
              <Row
                label={`${formatPrice(property.pricePerNight)} × ${nights} ${nights === 1 ? "nuit" : "nuits"}`}
                value={formatPrice(subtotal)}
              />
              <Row label="Frais de ménage" value={formatPrice(CLEANING_FEE)} />
              <Row label="Frais de service" value={formatPrice(serviceFee)} />
              <div className="!mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 bg-cream-50/60 p-4 text-[11px] text-ink-muted">
              <p className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Aucun débit pour le moment
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Annulation gratuite jusqu&apos;à 7 jours avant
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Identité de l&apos;hôte vérifiée
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA — total + WhatsApp finalize */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-ink">{formatPrice(total)}</div>
            <div className="text-[11px] text-ink-muted">
              {nights > 0 ? (
                <>Total · {nights} {nights === 1 ? "nuit" : "nuits"}</>
              ) : (
                <>Sélectionnez vos dates</>
              )}
            </div>
          </div>
          <a
            href={formValid ? whatsappHref : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!formValid}
            onClick={(e) => {
              if (!formValid) e.preventDefault();
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition",
              formValid ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-gray-300",
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Finaliser sur WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          padding: 0.7rem 0.875rem;
          font-size: 0.875rem;
          color: #0F172A;
          outline: none;
          transition: all 0.18s;
        }
        .form-input::placeholder { color: #94A3B8; }
        .form-input:focus {
          /* Marrakech terracotta — same as the brand-500 token. Inline
             so the scoped style still works in print mode without
             Tailwind utility classes loaded. */
          border-color: #B85432;
          box-shadow: 0 0 0 3px rgba(184, 84, 50, 0.18);
        }
      `}</style>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
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

function Trust({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <div className="text-xs">
        <div className="font-semibold text-ink">{label}</div>
        <div className="text-ink-muted">{value}</div>
      </div>
    </div>
  );
}

function PaymentTile({
  active,
  onClick,
  icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border bg-white p-4 text-left transition",
        active
          ? "border-brand-600 ring-2 ring-brand-600/15"
          : "border-gray-200 hover:border-gray-300",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            active ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">{title}</div>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{body}</p>
        </div>
      </div>
      {active && (
        <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
