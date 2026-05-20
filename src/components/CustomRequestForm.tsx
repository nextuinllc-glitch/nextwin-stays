"use client";

import { useState } from "react";
import { Check, AlertCircle, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "SALE" | "RENT_LONG";

type Props = {
  // The page that hosts the form passes its own kind so the lead lands
  // in the admin queue tagged appropriately (SALE on /acheter, RENT_LONG
  // on /louer).
  kind: Kind;
};

const PROPERTY_TYPES = [
  { value: "any",        label: "Tous types" },
  { value: "villa",      label: "Villa" },
  { value: "riad",       label: "Riad" },
  { value: "apartment",  label: "Appartement" },
  { value: "terrain",    label: "Terrain" },
  { value: "bureau",     label: "Bureau" },
  { value: "magasin",    label: "Magasin" },
];

const AREAS = [
  "Toute la ville",
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
 * Bottom-of-page conversion: visitor describes what they're looking for
 * and our team works the brief manually. Boxed-card editorial layout with
 * two clear section eyebrows ("Vos critères" + "Pour vous recontacter")
 * so the form reads as a structured intake, not a casual contact form.
 *
 * Submission posts to /api/inquiries with the criteria stitched into the
 * message so the admin queue can read it as a tidy summary.
 */
export function CustomRequestForm({ kind }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    propertyType: "any",
    area: "Toute la ville",
    budgetMin: "",
    budgetMax: "",
    bedrooms: "",
    surfaceMin: "",
    notes: "",
    name: "",
    email: "",
    phone: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function buildMessage(): string {
    // Stitch the structured criteria into a single human-readable block.
    // The admin queue stores everything in `message`; this format keeps it
    // skimmable when read in the back-office UI.
    const lines: string[] = ["[Demande personnalisée]"];
    const t = PROPERTY_TYPES.find((p) => p.value === form.propertyType)?.label ?? form.propertyType;
    lines.push(`Type recherché : ${t}`);
    lines.push(`Quartier souhaité : ${form.area}`);
    if (form.budgetMin || form.budgetMax) {
      lines.push(
        `Budget : ${form.budgetMin || "—"} – ${form.budgetMax || "—"} MAD`
        + (kind === "RENT_LONG" ? " / mois" : ""),
      );
    }
    if (form.bedrooms) lines.push(`Chambres : à partir de ${form.bedrooms}`);
    if (form.surfaceMin) lines.push(`Surface : à partir de ${form.surfaceMin} m²`);
    if (form.notes.trim()) {
      lines.push("");
      lines.push("Notes du client :");
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
      setErrorMsg("Votre nom est requis.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setStatus("error");
      setErrorMsg("Email ou téléphone requis pour vous recontacter.");
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // No propertySlug - this is a "find me something" brief, not
          // a question about a specific listing. The admin recognises it
          // by the "[Demande personnalisée]" prefix in the message.
          propertyTitle:
            kind === "SALE"
              ? "Demande personnalisée - Achat"
              : "Demande personnalisée - Location longue durée",
          kind,
          source: "DETAIL",
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          message: buildMessage(),
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

  const kindLabel = kind === "SALE" ? "achat" : "location";
  const budgetSuffix = kind === "RENT_LONG" ? " / mois" : "";

  // Reusable input class so the form fields stay consistent across rows.
  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <section className="bg-cream-100">
      <div className="container-page py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Editorial header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
              Demande personnalisée
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Vous ne trouvez pas votre bien ?
            </h2>
            <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Dites-nous ce que vous recherchez pour votre projet d&apos;{kindLabel}. Notre équipe
              prospecte son réseau privé, vous propose des biens qui correspondent vraiment,
              et vous accompagne jusqu&apos;à la signature.
            </p>
          </div>

          {status === "success" ? (
            <SuccessPanel kindLabel={kindLabel} />
          ) : (
            <form
              onSubmit={submit}
              className="mt-10 rounded-2xl border border-cream-300 bg-white p-6 shadow-card sm:p-10"
              noValidate
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
                <Sparkles className="h-3.5 w-3.5" />
                Vos critères
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Type de bien">
                  <select
                    className={inputClass}
                    value={form.propertyType}
                    onChange={(e) => update("propertyType", e.target.value)}
                  >
                    {PROPERTY_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Quartier souhaité">
                  <select
                    className={inputClass}
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                  >
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`Budget min (MAD${budgetSuffix})`}>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="ex. 2 000 000"
                    value={form.budgetMin}
                    onChange={(e) => update("budgetMin", e.target.value)}
                  />
                </Field>
                <Field label={`Budget max (MAD${budgetSuffix})`}>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="ex. 8 000 000"
                    value={form.budgetMax}
                    onChange={(e) => update("budgetMax", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Chambres min">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="ex. 3"
                    value={form.bedrooms}
                    onChange={(e) => update("bedrooms", e.target.value)}
                  />
                </Field>
                <Field label="Surface min (m²)">
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="ex. 200"
                    value={form.surfaceMin}
                    onChange={(e) => update("surfaceMin", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Précisions (optionnel)">
                  <textarea
                    rows={4}
                    className={cn(inputClass, "resize-none")}
                    placeholder="Détails utiles : style architectural, équipements indispensables, contraintes de financement, calendrier, etc."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-8 border-t border-cream-300 pt-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Pour vous recontacter
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Nom complet *">
                    <input
                      required
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="vous@exemple.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </Field>
                  <Field label="Téléphone">
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="+212 ..."
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {status === "error" && errorMsg && (
                <div className="mt-5 flex items-start gap-2 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                <p className="text-[11px] leading-relaxed text-ink-soft sm:max-w-xs">
                  Notre équipe vous répond sous 24 h ouvrées avec une première sélection
                  taillée à votre brief.
                </p>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 transition",
                    status === "sending" ? "opacity-60" : "hover:bg-brand-600",
                  )}
                >
                  {status === "sending" ? "Envoi…" : (
                    <>
                      Envoyer ma demande
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SuccessPanel({ kindLabel }: { kindLabel: string }) {
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold text-emerald-900">
        Brief reçu. Merci.
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-emerald-800">
        Un conseiller Nextwin examine votre projet d&apos;{kindLabel}, prospecte son réseau
        privé, et vous recontacte sous 24 h ouvrées avec une première sélection ciblée.
      </p>
    </div>
  );
}
