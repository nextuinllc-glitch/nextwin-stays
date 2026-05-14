"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Receipt,
  Film,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Initial = {
  heroSubtitleFr: string;
  heroSubtitleEn: string;
  heroSubtitleAr: string;
  heroTaglineFr: string;
  heroTaglineEn: string;
  heroTaglineAr: string;
  heroImage: string;
  heroVideoDesktop: string | null;
  heroVideoMobile: string | null;
  heroPosterDesktop: string | null;
  heroPosterMobile: string | null;
  whatsappNumber: string;
  email: string;
  phone: string;
  addressLine: string;
  footerBlurbFr: string;
  footerBlurbEn: string;
  footerBlurbAr: string;
  cleaningFee: number;
  serviceFeeRate: number;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [data, setData] = useState<Initial>(initial);
  const [tab, setTab] = useState<"fr" | "en" | "ar">("fr");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof Initial>(key: K, value: Initial[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Hero copy */}
        <Card title="Hero (page d'accueil)" icon={<Sparkles className="h-4 w-4 text-brand-700" />}>
          <div className="mb-4 inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold">
            {(["fr", "en", "ar"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setTab(l)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 uppercase transition",
                  tab === l ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          {tab === "fr" && (
            <>
              <Field label="Sous-titre du hero (FR)">
                <input
                  className="form-input"
                  value={data.heroSubtitleFr}
                  onChange={(e) => update("heroSubtitleFr", e.target.value)}
                  placeholder="Laissez vide pour masquer le sous-titre."
                />
              </Field>
              <Field label="Étiquette éditoriale (FR)">
                <input
                  className="form-input"
                  value={data.heroTaglineFr}
                  onChange={(e) => update("heroTaglineFr", e.target.value)}
                  placeholder="Maisons de Marrakech"
                />
                <p className="mt-1 text-[11px] text-ink-soft">
                  Petite ligne en majuscules sous « NEXTWIN · STAY », encadrée par deux traits.
                  Laissez vide pour la masquer.
                </p>
              </Field>
            </>
          )}
          {tab === "en" && (
            <>
              <Field label="Hero subtitle (EN)">
                <input
                  className="form-input"
                  value={data.heroSubtitleEn}
                  onChange={(e) => update("heroSubtitleEn", e.target.value)}
                  placeholder="Leave empty to hide the subtitle."
                />
              </Field>
              <Field label="Editorial tagline (EN)">
                <input
                  className="form-input"
                  value={data.heroTaglineEn}
                  onChange={(e) => update("heroTaglineEn", e.target.value)}
                  placeholder="Houses of Marrakech"
                />
              </Field>
            </>
          )}
          {tab === "ar" && (
            <>
              <Field label="عنوان البطل (AR)">
                <input
                  dir="rtl"
                  className="form-input"
                  value={data.heroSubtitleAr}
                  onChange={(e) => update("heroSubtitleAr", e.target.value)}
                />
              </Field>
              <Field label="السطر التحريري (AR)">
                <input
                  dir="rtl"
                  className="form-input"
                  value={data.heroTaglineAr}
                  onChange={(e) => update("heroTaglineAr", e.target.value)}
                  placeholder="منازل مراكش"
                />
              </Field>
            </>
          )}

        </Card>

        {/* Hero videos — desktop landscape + mobile portrait. Browser
            picks via <source media> on the public site. */}
        <Card
          title="Vidéo du hero"
          icon={<Film className="h-4 w-4 text-brand-700" />}
        >
          <p className="mb-4 text-xs text-ink-muted">
            Téléversez deux fichiers MP4 / WebM (100 MB max chacun). Le
            navigateur charge la version mobile en dessous de 768 px et la
            version paysage au-dessus. Si aucune vidéo n&apos;est définie,
            l&apos;image du hero ci-dessus sert de fond.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <VideoSlot
              kind="desktop"
              label="Desktop · paysage"
              hint="Recommandé : 1920×1080, 8–15 s en boucle"
              value={data.heroVideoDesktop}
              poster={data.heroPosterDesktop}
              onChange={(url, poster) => {
                update("heroVideoDesktop", url);
                update("heroPosterDesktop", poster);
              }}
            />
            <VideoSlot
              kind="mobile"
              label="Mobile · portrait"
              hint="Recommandé : 1080×1920, fichier plus léger"
              value={data.heroVideoMobile}
              poster={data.heroPosterMobile}
              onChange={(url, poster) => {
                update("heroVideoMobile", url);
                update("heroPosterMobile", poster);
              }}
            />
          </div>
        </Card>

        {/* Contact */}
        <Card title="Coordonnées" icon={<Phone className="h-4 w-4 text-brand-700" />}>
          <Field label="Numéro WhatsApp">
            <input
              className="form-input"
              value={data.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              placeholder="+212600000000"
            />
            <p className="mt-1 text-[11px] text-ink-soft">
              Utilisé sur la page de paiement « Finaliser sur WhatsApp ».
            </p>
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="email"
                  className="form-input pl-9"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </Field>
            <Field label="Téléphone fixe">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <input
                  className="form-input pl-9"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </Field>
          </div>
          <Field label="Adresse">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                className="form-input pl-9"
                value={data.addressLine}
                onChange={(e) => update("addressLine", e.target.value)}
              />
            </div>
          </Field>
        </Card>

        {/* Footer copy */}
        <Card title="Footer" icon={<Globe className="h-4 w-4 text-brand-700" />}>
          <div className="mb-4 inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold">
            {(["fr", "en", "ar"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setTab(l)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 uppercase transition",
                  tab === l ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          {tab === "fr" && (
            <Field label="Texte du footer (FR)">
              <textarea
                rows={3}
                className="form-input resize-y"
                value={data.footerBlurbFr}
                onChange={(e) => update("footerBlurbFr", e.target.value)}
              />
            </Field>
          )}
          {tab === "en" && (
            <Field label="Footer blurb (EN)">
              <textarea
                rows={3}
                className="form-input resize-y"
                value={data.footerBlurbEn}
                onChange={(e) => update("footerBlurbEn", e.target.value)}
              />
            </Field>
          )}
          {tab === "ar" && (
            <Field label="نبذة التذييل (AR)">
              <textarea
                dir="rtl"
                rows={3}
                className="form-input resize-y"
                value={data.footerBlurbAr}
                onChange={(e) => update("footerBlurbAr", e.target.value)}
              />
            </Field>
          )}
        </Card>

        {/* Fees */}
        <Card title="Frais de séjour" icon={<Receipt className="h-4 w-4 text-brand-700" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Frais de ménage (€) par séjour">
              <input
                type="number"
                min={0}
                className="form-input"
                value={data.cleaningFee}
                onChange={(e) => update("cleaningFee", Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
            <Field label={`Frais de service (${(data.serviceFeeRate * 100).toFixed(1)}%)`}>
              <input
                type="number"
                step="0.005"
                min={0}
                max={1}
                className="form-input"
                value={data.serviceFeeRate}
                onChange={(e) =>
                  update("serviceFeeRate", Math.min(1, Math.max(0, Number(e.target.value) || 0)))
                }
              />
              <p className="mt-1 text-[11px] text-ink-soft">
                Décimal : 0.07 = 7%. Appliqué au sous-total nuits.
              </p>
            </Field>
          </div>
          <div className="rounded-xl bg-cream-50 p-3 text-[11px] text-ink-muted">
            Exemple : 5 nuits × €240 = €1 200 + ménage €{data.cleaningFee} + service €
            {Math.round(1200 * data.serviceFeeRate)} = <strong className="text-ink">
              €{(1200 + data.cleaningFee + Math.round(1200 * data.serviceFeeRate)).toLocaleString("fr-FR")}
            </strong>
          </div>
        </Card>
      </div>

      {/* Save sidebar */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">Enregistrer</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Les changements s&apos;appliquent immédiatement au site public et à la page de paiement.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
          {saved && !error && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              ✓ Paramètres enregistrés
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
          </button>
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

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-4 inline-flex items-center gap-2 font-display text-lg font-semibold text-ink">
        {icon}
        {title}
      </h2>
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

// Single upload slot — owns its own busy state so the two slots can upload
// concurrently without coupling. Posts to /api/admin/upload/video and
// hands the resulting video URL + auto-extracted poster URL back via
// onChange. Clearing sends nulls for both upstream so the settings
// PATCH wipes the columns together.
function VideoSlot({
  kind,
  label,
  hint,
  value,
  poster,
  onChange,
}: {
  kind: "desktop" | "mobile";
  label: string;
  hint: string;
  value: string | null;
  poster: string | null;
  onChange: (videoUrl: string | null, posterUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/admin/upload/video", {
        method: "POST",
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? "Échec de l'envoi");
        return;
      }
      onChange(j.src as string, (j.poster as string | null) ?? null);
    } catch {
      setErr("Erreur réseau");
    } finally {
      setBusy(false);
      // Allow re-uploading the same file after a clear without confusing
      // the input — resetting `value` is the standard trick.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          {label}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 transition hover:text-rose-700"
          >
            <Trash2 className="h-3 w-3" />
            Supprimer
          </button>
        )}
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {value ? (
          // Muted preview so the admin can confirm the upload landed
          // without the page becoming a soundboard.
          <video
            key={value}
            src={value}
            muted
            playsInline
            controls
            preload="metadata"
            className="h-32 w-full object-cover bg-black"
          />
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-ink-soft">
            Aucune vidéo
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-ink-soft">{hint}</p>
      {value && (
        <p className="mt-1 text-[11px] font-medium text-emerald-700">
          {poster ? "✓ Aperçu (poster) auto-généré" : "Aperçu non disponible"}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 transition",
            busy ? "opacity-60" : "hover:bg-brand-50",
          )}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {busy ? "Envoi…" : value ? "Remplacer" : "Téléverser"}
        </button>
      </div>

      {err && <p className="mt-2 text-[11px] text-rose-600">{err}</p>}
    </div>
  );
}
