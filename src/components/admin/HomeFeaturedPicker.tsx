"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  KeyRound,
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Option = {
  slug: string;
  title: string;
  area: string;
  city: string;
  type: string;
};

type Slot = "shortStay" | "rentLong" | "sale";

type Initial = {
  shortStaySlug: string;
  rentLongSlug: string;
  saleSlug: string;
};

const SLOT_CHROME: Record<
  Slot,
  { heading: string; subtitle: string; icon: React.ReactNode; accent: string }
> = {
  shortStay: {
    heading: "Court séjour",
    subtitle: "Carte mise en avant dans la section « Court séjour ».",
    icon: <BedDouble className="h-4 w-4" />,
    accent: "bg-sky-100 text-sky-700",
  },
  rentLong: {
    heading: "Long durée",
    subtitle: "Carte mise en avant dans la section « Long durée ».",
    icon: <KeyRound className="h-4 w-4" />,
    accent: "bg-amber-100 text-amber-700",
  },
  sale: {
    heading: "Acheter",
    subtitle: "Carte mise en avant dans la section « Acheter ».",
    icon: <Building2 className="h-4 w-4" />,
    accent: "bg-emerald-100 text-emerald-700",
  },
};

const TYPE_LABEL: Record<string, string> = {
  riad: "Riad",
  villa: "Villa",
  apartment: "Appartement",
  terrain: "Terrain",
  bureau: "Bureau",
  magasin: "Magasin",
  commercial: "Commercial",
};

export function HomeFeaturedPicker({
  initial,
  options,
}: {
  initial: Initial;
  options: { shortStay: Option[]; rentLong: Option[]; sale: Option[] };
}) {
  const router = useRouter();
  const [data, setData] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (slot: Slot, value: string) => {
    setSaved(false);
    setError(null);
    if (slot === "shortStay") setData((d) => ({ ...d, shortStaySlug: value }));
    if (slot === "rentLong") setData((d) => ({ ...d, rentLongSlug: value }));
    if (slot === "sale") setData((d) => ({ ...d, saleSlug: value }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send null when empty so the column gets nulled out and the
          // home page falls back to the auto-pick logic.
          homeFeaturedShortStaySlug: data.shortStaySlug || null,
          homeFeaturedRentLongSlug: data.rentLongSlug || null,
          homeFeaturedSaleSlug: data.saleSlug || null,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        setError(j?.error ?? "Sauvegarde impossible");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PickerCard
        slot="shortStay"
        value={data.shortStaySlug}
        options={options.shortStay}
        onChange={(v) => update("shortStay", v)}
      />
      <PickerCard
        slot="rentLong"
        value={data.rentLongSlug}
        options={options.rentLong}
        onChange={(v) => update("rentLong", v)}
      />
      <PickerCard
        slot="sale"
        value={data.saleSlug}
        options={options.sale}
        onChange={(v) => update("sale", v)}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink-muted">
          {saved && (
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Sélection enregistrée. La page d&apos;accueil reflète déjà vos choix.
            </span>
          )}
          {error && (
            <span className="inline-flex items-center gap-2 text-rose-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
          )}
          {!saved && !error && (
            <span>
              Laissez « Sélection automatique » pour reprendre la première fiche publiée.
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Enregistrement…" : "Enregistrer la sélection"}
        </button>
      </div>
    </div>
  );
}

function PickerCard({
  slot,
  value,
  options,
  onChange,
}: {
  slot: Slot;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  const chrome = SLOT_CHROME[slot];
  const selected = options.find((o) => o.slug === value);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${chrome.accent}`}
        >
          {chrome.icon}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{chrome.heading}</h2>
          <p className="text-xs text-ink-muted">{chrome.subtitle}</p>
        </div>
      </header>

      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          Bien sélectionné
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Sélection automatique (premier publié)</option>
          {options.length === 0 && (
            <option value="" disabled>
              Aucun bien publié dans cette catégorie
            </option>
          )}
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.title} - {TYPE_LABEL[o.type] ?? o.type} - {o.area}, {o.city}
            </option>
          ))}
        </select>
        {selected && (
          <p className="mt-2 text-xs text-ink-soft">
            Slug: <span className="font-mono">{selected.slug}</span>
          </p>
        )}
      </div>
    </section>
  );
}
