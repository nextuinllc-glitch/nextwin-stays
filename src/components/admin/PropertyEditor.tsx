"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronLeft, Save, Trash2, Upload, X, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageRow = { id?: string; src: string; alt: string; position: number };

export type ListingKind = "SHORT_STAY" | "RENT_LONG" | "SALE";

export type PropertyEditorInitial = {
  id?: string;
  slug: string;
  type: string;
  area: string;
  city: string;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  // Listing kind drives which price field is canonical + which public flow
  // (booking vs. inquiry) is shown.
  listingKind: ListingKind;
  pricePerNight: number;     // SHORT_STAY canonical price (minor units)
  monthlyRent: number | null;  // RENT_LONG canonical price
  salePrice: number | null;   // SALE canonical price
  surfaceM2: number | null;   // floor area in m² (real estate)
  currency: string;          // "EUR" | "MAD"
  titleFr: string;
  titleEn: string;
  titleAr: string;
  shortDescriptionFr: string;
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionAr: string;
  amenities: string[];
  highlights: string[];
  hostName: string;
  hostYears: number;
  published: boolean;
  images: ImageRow[];
  // Privacy-zone location: optional lat/lng + radius in metres. Leave both
  // null to hide the map section on the public page.
  latitude: number | null;
  longitude: number | null;
  locationRadius: number;
  // House rule overrides — admin can edit these per-property.
  ruleCheckIn: string;
  ruleCheckOut: string;
  rulePets: string;
  ruleSmoking: string;
  ruleAdditional: string;
  // -------- Real-estate structured fields (SALE / RENT_LONG) ---------
  landSurfaceM2: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  condition: string | null;       // Neuf / Bon état / À rénover / Jamais habité
  standing: string | null;        // Haut standing / Standing moyen / Économique
  orientation: string | null;     // Sud / Sud-Est / Nord / ...
  furnished: boolean | null;
  parkingSpaces: number | null;
  // Terrain
  landStatus: string | null;
  landZoning: string | null;
  // Rental
  securityDeposit: number | null; // months
  monthlyCharges: number | null;  // minor units
  agencyFeeMonths: number | null; // months
  // Commercial
  ceilingHeight: number | null;   // metres
  // Universal extras (Avito-style)
  salons: number | null;
  apartmentSubtype: string | null;
  availability: string | null;
};

const EMPTY: PropertyEditorInitial = {
  slug: "",
  type: "riad",
  area: "Medina",
  city: "Marrakech",
  rating: 4.85,
  reviewCount: 0,
  guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  listingKind: "SHORT_STAY",
  pricePerNight: 150,
  monthlyRent: null,
  salePrice: null,
  surfaceM2: null,
  currency: "EUR",
  titleFr: "",
  titleEn: "",
  titleAr: "",
  shortDescriptionFr: "",
  shortDescriptionEn: "",
  shortDescriptionAr: "",
  descriptionFr: "",
  descriptionEn: "",
  descriptionAr: "",
  amenities: [],
  highlights: [],
  hostName: "NEXTWIN",
  hostYears: 1,
  published: true,
  images: [],
  latitude: null,
  longitude: null,
  locationRadius: 200,
  ruleCheckIn: "À partir de 15h00",
  ruleCheckOut: "Avant 11h00",
  rulePets: "Sur demande",
  ruleSmoking: "Interdit à l'intérieur",
  ruleAdditional: "",
  // Real-estate fields default to null - admin fills them when relevant.
  landSurfaceM2: null,
  floor: null,
  totalFloors: null,
  yearBuilt: null,
  condition: null,
  standing: null,
  orientation: null,
  furnished: null,
  parkingSpaces: null,
  landStatus: null,
  landZoning: null,
  securityDeposit: null,
  monthlyCharges: null,
  agencyFeeMonths: null,
  ceilingHeight: null,
  salons: null,
  apartmentSubtype: null,
  availability: null,
};

const TYPES = [
  { value: "riad",       label: "Riad" },
  { value: "villa",      label: "Villa" },
  { value: "apartment",  label: "Appartement" },
  { value: "terrain",    label: "Terrain" },
  { value: "bureau",     label: "Bureau" },
  { value: "magasin",    label: "Magasin" },
  { value: "commercial", label: "Commercial" },
];

const LISTING_KINDS: { value: ListingKind; label: string; tagline: string }[] = [
  { value: "SHORT_STAY", label: "Court séjour", tagline: "Location à la nuit, calendrier de réservations." },
  { value: "RENT_LONG",  label: "Longue durée", tagline: "Bail mensuel, formulaire de demande." },
  { value: "SALE",       label: "À la vente",   tagline: "Prix de vente unique, formulaire de demande." },
];

const COMMON_AMENITIES = [
  "Pool",
  "Heated pool",
  "Salt-water pool",
  "Plunge pool",
  "Air conditioning",
  "Wi-Fi",
  "Full kitchen",
  "BBQ",
  "Free parking",
  "Hammam",
  "Rooftop terrace",
  "Private terrace",
  "Garden",
  "Vegetable garden",
  "Breakfast included",
  "Daily housekeeping",
  "Concierge",
  "Self check-in",
  "Workspace",
  "Washer",
  "Tennis court",
  "Optional chef",
];

type Props = {
  mode: "create" | "edit";
  initial?: PropertyEditorInitial;
  // When `mode === "create"` and the route was hit with `?kind=SALE` etc.,
  // the editor opens pre-set to that kind so admins coming from
  // /admin/acheter or /admin/louer don't have to switch it manually.
  presetKind?: ListingKind;
};

export function PropertyEditor({ mode, initial, presetKind }: Props) {
  const router = useRouter();
  const [data, setData] = useState<PropertyEditorInitial>(() => {
    if (initial) return initial;
    // Start from EMPTY but apply kind-specific defaults so new sale/rent
    // listings get MAD as the default currency and don't carry over the
    // SHORT_STAY pricePerNight default of €150.
    if (presetKind === "SALE") {
      return { ...EMPTY, listingKind: "SALE", pricePerNight: 0, currency: "MAD", guests: 0 };
    }
    if (presetKind === "RENT_LONG") {
      return { ...EMPTY, listingKind: "RENT_LONG", pricePerNight: 0, currency: "MAD" };
    }
    return EMPTY;
  });
  const [tab, setTab] = useState<"fr" | "en" | "ar">("fr");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAmenity, setNewAmenity] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const update = <K extends keyof PropertyEditorInitial>(key: K, value: PropertyEditorInitial[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...data };
      if (!payload.slug && payload.titleFr) payload.slug = slugify(payload.titleFr);
      const res = await fetch(
        mode === "create" ? "/api/admin/properties" : `/api/admin/properties/${data.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Sauvegarde impossible");
        return;
      }
      // Redirect back to the kind-scoped admin list so the editor flow
      // stays self-contained per section.
      const target =
        data.listingKind === "SALE"
          ? "/admin/acheter"
          : data.listingKind === "RENT_LONG"
            ? "/admin/louer"
            : "/admin/court-sejour";
      router.push(target);
      router.refresh();
    } catch (e) {
      setError("Erreur réseau, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data.id) return;
    if (!confirm("Supprimer définitivement cette propriété ?")) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/properties/${data.id}`, { method: "DELETE" });
      const target =
        data.listingKind === "SALE"
          ? "/admin/acheter"
          : data.listingKind === "RENT_LONG"
            ? "/admin/louer"
            : "/admin/court-sejour";
      router.push(target);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newImages: ImageRow[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const j = await res.json().catch(() => ({}));
        if (j?.ok && j?.src) {
          newImages.push({
            src: j.src,
            alt: file.name.replace(/\.[^.]+$/, ""),
            position: data.images.length + newImages.length,
          });
        }
      }
      setData((d) => ({ ...d, images: [...d.images, ...newImages] }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setData((d) => ({ ...d, images: d.images.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i })) }));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const next = [...data.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    next.forEach((img, i) => (img.position = i));
    setData((d) => ({ ...d, images: next }));
  };

  const addAmenity = (label: string) => {
    const v = label.trim();
    if (!v || data.amenities.includes(v)) return;
    setData((d) => ({ ...d, amenities: [...d.amenities, v] }));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Retour aux propriétés
        </Link>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !data.titleFr}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement…" : mode === "create" ? "Créer" : "Enregistrer"}
          </button>
        </div>
      </div>

      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        {mode === "create" ? "Nouvelle propriété" : data.titleFr || "Modifier la propriété"}
      </h1>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Multilingual content */}
          <Card title="Contenu multilingue">
            <div className="mb-4 inline-flex rounded-full border border-gray-200 bg-white p-1">
              {(["fr", "en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setTab(l)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
                    tab === l ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {tab === "fr" && (
              <>
                <Field label="Titre (FR)">
                  <input
                    className="form-input"
                    value={data.titleFr}
                    onChange={(e) => update("titleFr", e.target.value)}
                    placeholder="Riad au cœur de la médina"
                  />
                </Field>
                <Field label="Description courte (FR)">
                  <input
                    className="form-input"
                    value={data.shortDescriptionFr}
                    onChange={(e) => update("shortDescriptionFr", e.target.value)}
                  />
                </Field>
                <Field label="Description complète (FR)">
                  <textarea
                    rows={6}
                    className="form-input resize-y"
                    value={data.descriptionFr}
                    onChange={(e) => update("descriptionFr", e.target.value)}
                  />
                </Field>
              </>
            )}
            {tab === "en" && (
              <>
                <Field label="Title (EN)">
                  <input
                    className="form-input"
                    value={data.titleEn}
                    onChange={(e) => update("titleEn", e.target.value)}
                  />
                </Field>
                <Field label="Short description (EN)">
                  <input
                    className="form-input"
                    value={data.shortDescriptionEn}
                    onChange={(e) => update("shortDescriptionEn", e.target.value)}
                  />
                </Field>
                <Field label="Full description (EN)">
                  <textarea
                    rows={6}
                    className="form-input resize-y"
                    value={data.descriptionEn}
                    onChange={(e) => update("descriptionEn", e.target.value)}
                  />
                </Field>
              </>
            )}
            {tab === "ar" && (
              <>
                <Field label="العنوان (AR)">
                  <input
                    dir="rtl"
                    className="form-input"
                    value={data.titleAr}
                    onChange={(e) => update("titleAr", e.target.value)}
                  />
                </Field>
                <Field label="وصف مختصر (AR)">
                  <input
                    dir="rtl"
                    className="form-input"
                    value={data.shortDescriptionAr}
                    onChange={(e) => update("shortDescriptionAr", e.target.value)}
                  />
                </Field>
                <Field label="الوصف الكامل (AR)">
                  <textarea
                    dir="rtl"
                    rows={6}
                    className="form-input resize-y"
                    value={data.descriptionAr}
                    onChange={(e) => update("descriptionAr", e.target.value)}
                  />
                </Field>
              </>
            )}
          </Card>

          {/* Images */}
          <Card title="Photos">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/40 p-6 text-center"
            >
              <Upload className="mx-auto h-6 w-6 text-ink-soft" />
              <p className="mt-2 text-sm text-ink-muted">
                Glissez-déposez des images ou
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Téléversement…" : "Téléverser depuis l'ordinateur"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <p className="mt-2 text-[11px] text-ink-soft">JPG / PNG / WebP — 5 MB max par image</p>
            </div>

            {data.images.length > 0 && (
              <ul className="mt-4 space-y-2">
                {data.images.map((img, i) => (
                  <li
                    key={`${img.src}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2"
                  >
                    <button
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      className="text-ink-soft transition hover:text-ink disabled:opacity-30"
                      aria-label="Monter"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={img.src} alt={img.alt} fill sizes="80px" className="object-cover" />
                    </div>
                    <input
                      className="form-input flex-1 !py-1.5 !text-xs"
                      value={img.alt}
                      placeholder="Description (alt)"
                      onChange={(e) => {
                        const next = [...data.images];
                        next[i] = { ...next[i], alt: e.target.value };
                        update("images", next);
                      }}
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50"
                      aria-label="Supprimer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Amenities */}
          <Card title="Équipements & atouts">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {data.amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {a}
                  <button
                    onClick={() => update("amenities", data.amenities.filter((x) => x !== a))}
                    className="text-brand-700/60 hover:text-brand-700"
                    aria-label={`Retirer ${a}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="form-input flex-1"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity(newAmenity);
                    setNewAmenity("");
                  }
                }}
                placeholder="Ajouter un équipement et appuyer sur Entrée"
              />
              <button
                onClick={() => {
                  addAmenity(newAmenity);
                  setNewAmenity("");
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-ink hover:border-brand-300"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold text-brand-700 hover:underline">
                Choisir parmi les équipements courants
              </summary>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_AMENITIES.filter((a) => !data.amenities.includes(a)).map((a) => (
                  <button
                    key={a}
                    onClick={() => addAmenity(a)}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-ink-muted hover:border-brand-300 hover:text-brand-700"
                  >
                    + {a}
                  </button>
                ))}
              </div>
            </details>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink">Atouts (3 puces sur la page)</h3>
              <div className="mt-2 space-y-1.5">
                {data.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="form-input flex-1 !text-xs"
                      value={h}
                      onChange={(e) => {
                        const next = [...data.highlights];
                        next[i] = e.target.value;
                        update("highlights", next);
                      }}
                    />
                    <button
                      onClick={() => update("highlights", data.highlights.filter((_, x) => x !== i))}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="form-input flex-1 !text-xs"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newHighlight.trim()) {
                        update("highlights", [...data.highlights, newHighlight.trim()]);
                        setNewHighlight("");
                      }
                    }
                  }}
                  placeholder="Ajouter un atout"
                />
                <button
                  onClick={() => {
                    if (newHighlight.trim()) {
                      update("highlights", [...data.highlights, newHighlight.trim()]);
                      setNewHighlight("");
                    }
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-ink hover:border-brand-300"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Type d'annonce">
            <p className="-mt-2 mb-3 text-[11px] text-ink-soft">
              Détermine le formulaire public (réservation ou demande) et le
              champ de prix utilisé.
            </p>
            <div className="grid gap-2">
              {LISTING_KINDS.map((k) => {
                const active = data.listingKind === k.value;
                return (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => {
                      // Reset price defaults when switching kind so stale
                      // values don't bleed across modes.
                      const next: Partial<PropertyEditorInitial> = { listingKind: k.value };
                      if (k.value === "SALE") {
                        next.currency = data.currency === "EUR" ? "MAD" : data.currency;
                        next.pricePerNight = 0;
                      } else if (k.value === "RENT_LONG") {
                        next.currency = data.currency === "EUR" ? "MAD" : data.currency;
                        next.pricePerNight = 0;
                      }
                      setData((d) => ({ ...d, ...next }));
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-left text-sm transition",
                      active
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                        : "border-gray-200 bg-white hover:border-brand-300",
                    )}
                  >
                    <div className="font-semibold text-ink">{k.label}</div>
                    <div className="text-[11px] text-ink-soft">{k.tagline}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Publication">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
              <input
                type="checkbox"
                checked={data.published}
                onChange={(e) => update("published", e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="text-sm font-medium text-ink">Publié</span>
            </label>
            <Field label="Slug (URL)">
              <input
                className="form-input"
                value={data.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="riad-au-coeur-medina"
              />
            </Field>
          </Card>

          <Card title="Détails">
            <Field label="Type">
              <select
                className="form-input"
                value={data.type}
                onChange={(e) => update("type", e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quartier">
                <input className="form-input" value={data.area} onChange={(e) => update("area", e.target.value)} />
              </Field>
              <Field label="Ville">
                <input className="form-input" value={data.city} onChange={(e) => update("city", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* "Invités" only really applies to SHORT_STAY (max occupancy
                  for a booking). Keep it visible for all kinds so existing
                  data isn't lost, but skip it for terrain. */}
              <Field label={data.listingKind === "SHORT_STAY" ? "Invités" : "Capacité"}>
                <input
                  type="number"
                  className="form-input"
                  value={data.guests}
                  onChange={(e) => update("guests", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Chambres">
                <input
                  type="number"
                  className="form-input"
                  value={data.bedrooms}
                  onChange={(e) => update("bedrooms", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="SdB">
                <input
                  type="number"
                  className="form-input"
                  value={data.bathrooms}
                  onChange={(e) => update("bathrooms", Number(e.target.value) || 0)}
                />
              </Field>
            </div>

            <Field label="Surface (m²)">
              <input
                type="number"
                className="form-input"
                placeholder="ex. 220"
                value={data.surfaceM2 ?? ""}
                onChange={(e) =>
                  update("surfaceM2", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </Field>
            {/* Price field swaps to match the listing kind. The currency is
                a separate selector so EUR vs MAD is explicit. */}
            <div className="grid grid-cols-2 gap-3">
              {data.listingKind === "SHORT_STAY" && (
                <Field label={`Prix / nuit (${data.currency})`}>
                  <input
                    type="number"
                    className="form-input"
                    value={data.pricePerNight}
                    onChange={(e) => update("pricePerNight", Number(e.target.value) || 0)}
                  />
                </Field>
              )}
              {data.listingKind === "RENT_LONG" && (
                <Field label={`Loyer mensuel (${data.currency})`}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="ex. 22 000"
                    value={data.monthlyRent ?? ""}
                    onChange={(e) =>
                      update("monthlyRent", e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </Field>
              )}
              {data.listingKind === "SALE" && (
                <Field label={`Prix de vente (${data.currency})`}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="ex. 12 500 000"
                    value={data.salePrice ?? ""}
                    onChange={(e) =>
                      update("salePrice", e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </Field>
              )}
              <Field label="Devise">
                <select
                  className="form-input"
                  value={data.currency}
                  onChange={(e) => update("currency", e.target.value)}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="MAD">MAD (DH)</option>
                </select>
              </Field>
            </div>
            <Field label="Note">
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={data.rating}
                onChange={(e) => update("rating", Number(e.target.value) || 0)}
              />
            </Field>
          </Card>

          {/* Caractéristiques - structured real-estate fields modelled
              after Avito.ma + Mubawab.ma. The visible field set adapts to
              property.type so admins only see what's relevant (e.g. terrain
              shows titre foncier + zonage, apartments show étage, bureaux
              show ceiling height). All fields are optional. */}
          {data.listingKind !== "SHORT_STAY" && (
            <Card title="Caractéristiques">
              <p className="-mt-2 mb-3 text-[11px] text-ink-soft">
                Les champs montrés ici s&apos;adaptent au type de bien sélectionné
                ci-dessus. Remplissez ce qui s&apos;applique.
              </p>

              {/* Surfaces - habitable for everyone; terrain for villas + terrains */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Surface habitable (m²)">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="ex. 220"
                    value={data.surfaceM2 ?? ""}
                    onChange={(e) => update("surfaceM2", e.target.value === "" ? null : Number(e.target.value))}
                  />
                </Field>
                {(data.type === "villa" || data.type === "terrain" || data.type === "riad") && (
                  <Field label="Surface terrain (m²)">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ex. 1200"
                      value={data.landSurfaceM2 ?? ""}
                      onChange={(e) => update("landSurfaceM2", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                )}
              </div>

              {/* Étage row - apartments, bureaux, magasins */}
              {(data.type === "apartment" || data.type === "bureau" || data.type === "magasin") && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Étage">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0 = RdC"
                      value={data.floor ?? ""}
                      onChange={(e) => update("floor", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                  {data.type === "apartment" && (
                    <Field label="Étages totaux">
                      <input
                        type="number"
                        className="form-input"
                        placeholder="ex. 6"
                        value={data.totalFloors ?? ""}
                        onChange={(e) => update("totalFloors", e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </Field>
                  )}
                </div>
              )}

              {/* Salons + Apartment subtype - residential only */}
              {(data.type === "villa" || data.type === "riad" || data.type === "apartment") && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Salons">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ex. 2"
                      value={data.salons ?? ""}
                      onChange={(e) => update("salons", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                  {data.type === "apartment" && (
                    <Field label="Sous-type">
                      <select
                        className="form-input"
                        value={data.apartmentSubtype ?? ""}
                        onChange={(e) => update("apartmentSubtype", e.target.value || null)}
                      >
                        <option value="">Standard</option>
                        <option value="Studio">Studio</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Triplex">Triplex</option>
                        <option value="Loft">Loft</option>
                      </select>
                    </Field>
                  )}
                </div>
              )}

              {/* État + Standing + Année - all real-estate */}
              {data.type !== "terrain" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="État">
                    <select
                      className="form-input"
                      value={data.condition ?? ""}
                      onChange={(e) => update("condition", e.target.value || null)}
                    >
                      <option value="">Non précisé</option>
                      <option value="Neuf">Neuf</option>
                      <option value="Jamais habité">Jamais habité</option>
                      <option value="Bon état">Bon état</option>
                      <option value="À rénover">À rénover</option>
                    </select>
                  </Field>
                  <Field label="Standing">
                    <select
                      className="form-input"
                      value={data.standing ?? ""}
                      onChange={(e) => update("standing", e.target.value || null)}
                    >
                      <option value="">Non précisé</option>
                      <option value="Haut standing">Haut standing</option>
                      <option value="Standing moyen">Standing moyen</option>
                      <option value="Économique">Économique</option>
                    </select>
                  </Field>
                </div>
              )}
              {data.type !== "terrain" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Année de construction">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ex. 2018"
                      value={data.yearBuilt ?? ""}
                      onChange={(e) => update("yearBuilt", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Orientation">
                    <select
                      className="form-input"
                      value={data.orientation ?? ""}
                      onChange={(e) => update("orientation", e.target.value || null)}
                    >
                      <option value="">Non précisé</option>
                      <option value="Nord">Nord</option>
                      <option value="Sud">Sud</option>
                      <option value="Est">Est</option>
                      <option value="Ouest">Ouest</option>
                      <option value="Nord-Est">Nord-Est</option>
                      <option value="Nord-Ouest">Nord-Ouest</option>
                      <option value="Sud-Est">Sud-Est</option>
                      <option value="Sud-Ouest">Sud-Ouest</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Parking + meublé - residential + commercial */}
              {data.type !== "terrain" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Places de parking">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ex. 2"
                      value={data.parkingSpaces ?? ""}
                      onChange={(e) => update("parkingSpaces", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Meublé">
                    <select
                      className="form-input"
                      value={data.furnished == null ? "" : data.furnished ? "yes" : "no"}
                      onChange={(e) =>
                        update("furnished", e.target.value === "" ? null : e.target.value === "yes")
                      }
                    >
                      <option value="">Non précisé</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Terrain-specific */}
              {data.type === "terrain" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Titre foncier">
                    <select
                      className="form-input"
                      value={data.landStatus ?? ""}
                      onChange={(e) => update("landStatus", e.target.value || null)}
                    >
                      <option value="">Non précisé</option>
                      <option value="Titré">Titré</option>
                      <option value="En cours de titrement">En cours de titrement</option>
                      <option value="Réquisition">Réquisition</option>
                      <option value="Non titré">Non titré</option>
                    </select>
                  </Field>
                  <Field label="Zonage">
                    <select
                      className="form-input"
                      value={data.landZoning ?? ""}
                      onChange={(e) => update("landZoning", e.target.value || null)}
                    >
                      <option value="">Non précisé</option>
                      <option value="Lot de villa">Lot de villa</option>
                      <option value="Immeuble">Immeuble</option>
                      <option value="Constructible R+1">Constructible R+1</option>
                      <option value="Constructible R+2">Constructible R+2</option>
                      <option value="Agricole">Agricole</option>
                      <option value="Industriel">Industriel</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Touristique">Touristique</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Bureau / magasin specific */}
              {(data.type === "bureau" || data.type === "magasin") && (
                <Field label="Hauteur sous plafond (m)">
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="ex. 3.2"
                    value={data.ceilingHeight ?? ""}
                    onChange={(e) => update("ceilingHeight", e.target.value === "" ? null : Number(e.target.value))}
                  />
                </Field>
              )}

              {/* Long-term rental specifics */}
              {data.listingKind === "RENT_LONG" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Caution (mois)">
                      <input
                        type="number"
                        className="form-input"
                        placeholder="ex. 2"
                        value={data.securityDeposit ?? ""}
                        onChange={(e) => update("securityDeposit", e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Frais d'agence (mois)">
                      <input
                        type="number"
                        step="0.5"
                        className="form-input"
                        placeholder="ex. 1"
                        value={data.agencyFeeMonths ?? ""}
                        onChange={(e) => update("agencyFeeMonths", e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </Field>
                  </div>
                  <Field label={`Charges mensuelles (${data.currency})`}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ex. 500"
                      value={data.monthlyCharges ?? ""}
                      onChange={(e) => update("monthlyCharges", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                </>
              )}

              {/* Disponibilité - always shown */}
              <Field label="Disponibilité">
                <input
                  className="form-input"
                  placeholder="Immédiate, sept. 2026, etc."
                  value={data.availability ?? ""}
                  onChange={(e) => update("availability", e.target.value || null)}
                />
              </Field>
            </Card>
          )}

          <Card title="Hôte">
            <Field label="Prénom de l'hôte">
              <input className="form-input" value={data.hostName} onChange={(e) => update("hostName", e.target.value)} />
            </Field>
            <Field label="Années d'expérience">
              <input
                type="number"
                className="form-input"
                value={data.hostYears}
                onChange={(e) => update("hostYears", Number(e.target.value) || 0)}
              />
            </Field>
          </Card>

          <Card title="Emplacement">
            <p className="-mt-2 mb-3 text-[11px] text-ink-soft">
              La carte publique affiche un cercle de zone, jamais l&apos;adresse exacte.
              Laissez vide pour masquer la section.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input
                  type="number"
                  step="0.00001"
                  className="form-input"
                  placeholder="31.6295"
                  value={data.latitude ?? ""}
                  onChange={(e) =>
                    update("latitude", e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="0.00001"
                  className="form-input"
                  placeholder="-7.9811"
                  value={data.longitude ?? ""}
                  onChange={(e) =>
                    update("longitude", e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              </Field>
            </div>
            <Field label={`Rayon de la zone (mètres) — ${data.locationRadius} m`}>
              <input
                type="range"
                min={100}
                max={500}
                step={50}
                value={data.locationRadius}
                onChange={(e) => update("locationRadius", Number(e.target.value) || 200)}
                className="w-full accent-brand-600"
              />
            </Field>
            {data.latitude != null && data.longitude != null && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=16/${data.latitude}/${data.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-brand-700 underline-offset-2 hover:underline"
              >
                Vérifier sur OpenStreetMap →
              </a>
            )}
          </Card>

          <Card title="Règles de la maison">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Arrivée">
                <input
                  className="form-input"
                  value={data.ruleCheckIn}
                  onChange={(e) => update("ruleCheckIn", e.target.value)}
                />
              </Field>
              <Field label="Départ">
                <input
                  className="form-input"
                  value={data.ruleCheckOut}
                  onChange={(e) => update("ruleCheckOut", e.target.value)}
                />
              </Field>
              <Field label="Animaux">
                <input
                  className="form-input"
                  value={data.rulePets}
                  onChange={(e) => update("rulePets", e.target.value)}
                />
              </Field>
              <Field label="Tabac">
                <input
                  className="form-input"
                  value={data.ruleSmoking}
                  onChange={(e) => update("ruleSmoking", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Informations complémentaires (facultatif)">
              <textarea
                rows={3}
                className="form-input resize-y"
                value={data.ruleAdditional}
                onChange={(e) => update("ruleAdditional", e.target.value)}
                placeholder="Caution, climatisation incluse, accès parking, …"
              />
            </Field>
          </Card>
        </div>
      </div>

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
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
