"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronLeft, Save, Trash2, Upload, X, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageRow = { id?: string; src: string; alt: string; position: number };

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
  pricePerNight: number;
  currency: string;
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
  pricePerNight: 150,
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
};

const TYPES = [
  { value: "riad", label: "Riad" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Appartement" },
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
};

export function PropertyEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<PropertyEditorInitial>(initial ?? EMPTY);
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
      router.push("/admin/properties");
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
      router.push("/admin/properties");
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
              <Field label="Invités">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix / nuit (€)">
                <input
                  type="number"
                  className="form-input"
                  value={data.pricePerNight}
                  onChange={(e) => update("pricePerNight", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Note">
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={data.rating}
                  onChange={(e) => update("rating", Number(e.target.value) || 0)}
                />
              </Field>
            </div>
          </Card>

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
