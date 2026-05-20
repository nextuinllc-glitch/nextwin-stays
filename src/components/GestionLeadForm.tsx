"use client";

import { useState } from "react";
import { AlertCircle, Check, Send } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const AREAS = [
  "Guéliz",
  "Hivernage",
  "Palmeraie",
  "Médina",
  "Targa",
  "Agdal",
  "Route de l'Ourika",
  "Route de Fès",
  "Route d'Amizmiz",
];

/**
 * Owner intake form for /gestion. Submits a structured "owner brief" as
 * an Inquiry with kind=MANAGEMENT so the admin queue can filter property-
 * management leads from buyer/renter leads. All labels read from the
 * i18n bundle so FR / EN / AR all work.
 */
export function GestionLeadForm() {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    propertyType: "villa",
    area: "Palmeraie",
    bedrooms: "",
    service: "both",
    listed: "",
    notes: "",
    name: "",
    email: "",
    phone: "",
  });

  const PROPERTY_TYPES = [
    { value: "riad", label: t.gestion.typeRiad },
    { value: "villa", label: t.gestion.typeVilla },
    { value: "apartment", label: t.gestion.typeApartment },
    { value: "terrain", label: t.gestion.typeTerrain },
    { value: "bureau", label: t.gestion.typeBureau },
    { value: "magasin", label: t.gestion.typeMagasin },
    { value: "autre", label: t.gestion.typeOther },
  ];

  const SERVICES = [
    { value: "short", label: t.gestion.serviceShort },
    { value: "long", label: t.gestion.serviceLong },
    { value: "both", label: t.gestion.serviceBoth },
    { value: "advice", label: t.gestion.serviceAdvice },
  ];

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function buildMessage(): string {
    // Always submit the structured brief in French - the admin queue is
    // FR-first, and a single language keeps the back-office consistent
    // regardless of which locale the visitor used.
    const lines: string[] = ["[Demande de gestion locative]"];
    const typeLabelMap: Record<string, string> = {
      riad: "Riad",
      villa: "Villa",
      apartment: "Appartement",
      terrain: "Terrain",
      bureau: "Bureau",
      magasin: "Magasin",
      autre: "Autre",
    };
    const serviceLabelMap: Record<string, string> = {
      short: "Court séjour (Airbnb, Booking)",
      long: "Location longue durée",
      both: "Les deux",
      advice: "Je découvre",
    };
    lines.push(`Bien : ${typeLabelMap[form.propertyType] ?? form.propertyType}`);
    lines.push(`Quartier : ${form.area}`);
    if (form.bedrooms) lines.push(`Chambres : ${form.bedrooms}`);
    lines.push(`Service souhaité : ${serviceLabelMap[form.service] ?? form.service}`);
    if (form.listed.trim()) lines.push(`Annonces existantes : ${form.listed.trim()}`);
    if (form.notes.trim()) {
      lines.push("");
      lines.push("Précisions :");
      lines.push(form.notes.trim());
    }
    return lines.join("\n");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);

    if (!form.name.trim()) {
      setStatus("error");
      setErrorMsg(t.gestion.formNameRequired);
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setStatus("error");
      setErrorMsg(t.gestion.formContactRequired);
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyTitle: "Demande de gestion locative",
          kind: "MANAGEMENT",
          source: "CONTACT",
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          message: buildMessage(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setErrorMsg(json?.error ?? t.gestion.formError);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg(t.gestion.formNetworkError);
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-10">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink">
          {t.gestion.formSuccessTitle}
        </h3>
        <p className="mt-3 text-sm text-ink-muted sm:text-base">
          {t.gestion.formSuccessBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-600">
        {t.gestion.formPropertySection}
      </span>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.gestion.formTypeLabel}>
          <select
            value={form.propertyType}
            onChange={(e) => update("propertyType", e.target.value)}
            className={inputClass}
          >
            {PROPERTY_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.gestion.formAreaLabel}>
          <select
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
            className={inputClass}
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.gestion.formBedroomsLabel}>
          <input
            inputMode="numeric"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
            placeholder="3"
            className={inputClass}
          />
        </Field>
        <Field label={t.gestion.formServiceLabel}>
          <select
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
            className={inputClass}
          >
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t.gestion.formListedLabel}>
        <input
          value={form.listed}
          onChange={(e) => update("listed", e.target.value)}
          placeholder={t.gestion.formListedPlaceholder}
          className={inputClass}
        />
      </Field>
      <Field label={t.gestion.formNotesLabel}>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder={t.gestion.formNotesPlaceholder}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <span className="mt-8 block text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-600">
        {t.gestion.formContactSection}
      </span>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={t.gestion.formNameLabel}>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t.gestion.formNamePlaceholder}
            className={inputClass}
          />
        </Field>
        <Field label={t.gestion.formEmailLabel}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t.gestion.formEmailPlaceholder}
            className={inputClass}
          />
        </Field>
        <Field label={t.gestion.formPhoneLabel}>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder={t.gestion.formPhonePlaceholder}
            className={inputClass}
          />
        </Field>
      </div>

      {errorMsg && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-cream-50 transition hover:bg-brand-600 disabled:opacity-60"
        >
          {status === "sending" ? t.gestion.formSubmitting : t.gestion.formSubmit}
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
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
