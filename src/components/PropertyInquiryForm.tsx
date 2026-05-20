"use client";

import { useState } from "react";
import { Check, Phone, Mail, MessageCircle, AlertCircle, Send } from "lucide-react";
import type { Property } from "@/lib/properties";
import { formatPrice, formatPriceShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  property: Property;
  // WhatsApp number to surface as a quick-action alongside the form.
  // Defaults to the Marrakech business line; pass to override.
  whatsappPhoneIntl?: string; // digits only, no +
};

/**
 * Sidebar widget used on SALE and RENT_LONG property detail pages in place
 * of the BookingWidget (which is SHORT_STAY only). Captures a lead via the
 * Inquiry table and surfaces WhatsApp + phone shortcuts.
 *
 * Three states: idle, sending, success. On success the form swaps for a
 * confirmation panel so the visitor knows the message went through.
 */
export function PropertyInquiryForm({
  property,
  whatsappPhoneIntl = "212600000000",
}: Props) {
  const isSale = property.listingKind === "SALE";
  const kindLabel = isSale ? "À la vente" : "Location longue durée";

  const price = isSale
    ? property.salePrice
    : property.listingKind === "RENT_LONG"
      ? property.monthlyRent
      : property.pricePerNight;
  const priceSuffix = isSale ? "" : property.listingKind === "RENT_LONG" ? " / mois" : "";
  const currency = (property.currency ?? "EUR") as "EUR" | "USD" | "MAD";

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message:
      `Bonjour, je suis intéressé(e) par le bien "${property.title}" (réf. ${property.slug}). ` +
      `Merci de me recontacter pour plus d'informations.`,
  });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);

    if (!form.name.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Nom et message requis.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setStatus("error");
      setErrorMsg("Email ou téléphone requis.");
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertySlug: property.slug,
          propertyTitle: property.title,
          kind: property.listingKind,
          source: "DETAIL",
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          message: form.message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setErrorMsg(json?.error ?? "Envoi impossible. Réessayez.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Erreur réseau. Réessayez.");
      setStatus("error");
    }
  }

  const whatsappHref = `https://wa.me/${whatsappPhoneIntl}?text=${encodeURIComponent(
    `Bonjour, je suis intéressé par "${property.title}" sur Nextwin.ma. Pouvez-vous m'envoyer plus d'infos ?`,
  )}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-7">
      {/* Header: price + kind label */}
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
            {kindLabel}
          </div>
          <div className="mt-2 font-display text-2xl font-semibold text-ink">
            {price
              ? isSale
                ? formatPriceShort(price, currency)
                : `${formatPrice(price, currency)}${priceSuffix}`
              : "Prix sur demande"}
          </div>
        </div>
      </div>

      <div className="my-5 h-px bg-gray-100" />

      {status === "success" ? (
        <SuccessPanel propertyTitle={property.title} />
      ) : (
        <>
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Nom complet"
                required
                value={form.name}
                onChange={onChange("name")}
                placeholder="Votre nom"
              />
              <Field
                label="Téléphone"
                type="tel"
                value={form.phone}
                onChange={onChange("phone")}
                placeholder="+212 ..."
              />
            </div>
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              placeholder="vous@exemple.com"
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={onChange("message")}
                className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {status === "error" && errorMsg && (
              <div className="flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition",
                status === "sending" ? "opacity-60" : "hover:bg-brand-700",
              )}
            >
              {status === "sending" ? "Envoi…" : (<>Envoyer ma demande<Send className="h-4 w-4" /></>)}
            </button>
            <p className="text-[11px] leading-relaxed text-ink-soft">
              Un conseiller Nextwin vous répond sous 24 h ouvrées.
            </p>
          </form>

          <div className="my-5 h-px bg-gray-100" />

          {/* Quick-action shortcuts. Both visible on every viewport - the
              WhatsApp button is the dominant CTA in Morocco for property
              leads, so we give it equal weight to the form submit. */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 transition hover:bg-emerald-100"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <a
              href={`tel:+${whatsappPhoneIntl}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink hover:bg-gray-50"
            >
              <Phone className="h-3.5 w-3.5" />
              Appeler
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

function SuccessPanel({ propertyTitle }: { propertyTitle: string }) {
  return (
    <div className="rounded-xl bg-emerald-50 p-5 text-center">
      <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-emerald-900">
        Demande envoyée
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-emerald-800">
        Merci pour votre intérêt pour <span className="font-semibold">{propertyTitle}</span>. Un
        conseiller Nextwin vous recontacte sous 24 h ouvrées.
      </p>
      <a
        href="mailto:contact@nextwin.ma"
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 hover:underline"
      >
        <Mail className="h-3 w-3" />
        contact@nextwin.ma
      </a>
    </div>
  );
}
