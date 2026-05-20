"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Save,
  Trash2,
  Upload,
  Loader2,
  Pencil,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

type Specialty = "SHORT_STAY" | "RENT_LONG" | "SALE" | null;

const SPECIALTY_LABEL: Record<Exclude<Specialty, null>, string> = {
  SHORT_STAY: "Court séjour",
  RENT_LONG: "Long durée",
  SALE: "Achat",
};

type TeamMemberRow = {
  id: number;
  slug: string;
  name: string;
  roleFr: string;
  roleEn: string | null;
  roleAr: string | null;
  bioFr: string;
  bioEn: string | null;
  bioAr: string | null;
  photoUrl: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  specialty: Specialty;
  position: number;
  published: boolean;
};

type Draft = Omit<TeamMemberRow, "id"> & { id?: number };

const EMPTY_DRAFT: Draft = {
  slug: "",
  name: "",
  roleFr: "",
  roleEn: null,
  roleAr: null,
  bioFr: "",
  bioEn: null,
  bioAr: null,
  photoUrl: null,
  whatsapp: null,
  email: null,
  phone: null,
  specialty: null,
  position: 0,
  published: true,
};

export function TeamAdmin({ initial }: { initial: TeamMemberRow[] }) {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMemberRow[]>(initial);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const refresh = () => {
    setStatus(null);
    router.refresh();
  };

  const startNew = () => {
    setEditing({ ...EMPTY_DRAFT, position: team.length });
  };

  const startEdit = (m: TeamMemberRow) => {
    setEditing({ ...m });
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce membre ? Cette action est définitive.")) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j?.ok) {
      setStatus({ kind: "err", msg: j?.error ?? "Suppression impossible" });
      return;
    }
    setTeam((t) => t.filter((m) => m.id !== id));
    setStatus({ kind: "ok", msg: "Membre supprimé." });
    refresh();
  };

  const move = async (m: TeamMemberRow, direction: -1 | 1) => {
    const sorted = [...team].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((x) => x.id === m.id);
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;
    // Swap the two positions in place. Send both PATCH requests so the
    // server reflects the new ordering and the next refresh shows them
    // in the chosen order.
    const a = sorted[idx];
    const b = sorted[target];
    const pa = a.position;
    const pb = b.position;
    setTeam((t) =>
      t.map((x) => (x.id === a.id ? { ...x, position: pb } : x.id === b.id ? { ...x, position: pa } : x)),
    );
    await Promise.all([
      fetch(`/api/admin/team/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: pb }),
      }),
      fetch(`/api/admin/team/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: pa }),
      }),
    ]);
    refresh();
  };

  const togglePublished = async (m: TeamMemberRow) => {
    const next = !m.published;
    setTeam((t) => t.map((x) => (x.id === m.id ? { ...x, published: next } : x)));
    await fetch(`/api/admin/team/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: next }),
    });
    refresh();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter un membre
        </button>
        {status && (
          <span
            className={`inline-flex items-center gap-2 text-sm ${
              status.kind === "ok" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {status.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {status.msg}
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {[...team]
          .sort((a, b) => a.position - b.position)
          .map((m, idx, arr) => (
            <li
              key={m.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <Avatar name={m.name} photoUrl={m.photoUrl} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-lg font-semibold text-ink">{m.name}</span>
                  <span className="font-mono text-[11px] text-ink-soft">/{m.slug}</span>
                  {m.specialty && (
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                      {SPECIALTY_LABEL[m.specialty]}
                    </span>
                  )}
                  {!m.published && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Masqué
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-ink-muted">{m.roleFr || <em>Rôle non renseigné</em>}</div>
                {m.bioFr && (
                  <p className="mt-1 line-clamp-2 text-[13px] text-ink-soft">{m.bioFr}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <IconButton onClick={() => move(m, -1)} disabled={idx === 0} title="Monter">
                  <ChevronUp className="h-4 w-4" />
                </IconButton>
                <IconButton onClick={() => move(m, 1)} disabled={idx === arr.length - 1} title="Descendre">
                  <ChevronDown className="h-4 w-4" />
                </IconButton>
                <button
                  type="button"
                  onClick={() => togglePublished(m)}
                  className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold transition ${
                    m.published
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-gray-200 bg-white text-ink-muted hover:bg-gray-50"
                  }`}
                >
                  {m.published ? "Publié" : "Brouillon"}
                </button>
                <IconButton onClick={() => startEdit(m)} title="Modifier">
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton onClick={() => remove(m.id)} title="Supprimer" danger>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        {team.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-ink-muted">
            Aucun membre pour le moment. Cliquez sur «&nbsp;Ajouter un membre&nbsp;» pour commencer.
          </li>
        )}
      </ul>

      {editing && (
        <EditorDialog
          draft={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setTeam((t) =>
              isNew ? [...t, saved] : t.map((x) => (x.id === saved.id ? saved : x)),
            );
            setEditing(null);
            setStatus({ kind: "ok", msg: isNew ? "Membre ajouté." : "Membre mis à jour." });
            refresh();
          }}
          onError={(msg) => setStatus({ kind: "err", msg })}
        />
      )}
    </div>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-cream-100 ring-1 ring-gray-200">
      {photoUrl ? (
        <Image src={photoUrl} alt={name} fill sizes="64px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-xl font-semibold text-brand-700">
          {initial}
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
          : "border-gray-200 text-ink-muted hover:bg-gray-50 hover:text-ink"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function EditorDialog({
  draft,
  onClose,
  onSaved,
  onError,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: (saved: TeamMemberRow, isNew: boolean) => void;
  onError: (msg: string) => void;
}) {
  const [data, setData] = useState<Draft>(draft);
  const [tab, setTab] = useState<"fr" | "en" | "ar">("fr");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = data.id === undefined;

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (j?.ok && j?.src) {
        update("photoUrl", j.src);
      } else {
        onError(j?.error ?? "Upload impossible");
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    if (!data.name.trim()) {
      onError("Le nom est requis.");
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? "/api/admin/team" : `/api/admin/team/${data.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        onError(j?.error ?? "Sauvegarde impossible");
        return;
      }
      onSaved(j.member as TeamMemberRow, isNew);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              {isNew ? "Nouveau membre" : `Modifier ${data.name || "le membre"}`}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Les champs FR sont obligatoires&nbsp;; EN et AR sont des traductions optionnelles.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-gray-50"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <Avatar name={data.name || "?"} photoUrl={data.photoUrl} />
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => upload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {data.photoUrl ? "Changer la photo" : "Ajouter une photo"}
              </button>
              {data.photoUrl && (
                <button
                  type="button"
                  onClick={() => update("photoUrl", null)}
                  className="inline-flex items-center gap-2 text-xs text-rose-700 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Retirer la photo
                </button>
              )}
            </div>
          </div>

          {/* Identité */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom (prénom seulement)">
              <input
                value={data.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Abdou"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="Slug (optionnel)">
              <input
                value={data.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="abdou"
                disabled={!isNew}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50 disabled:text-ink-soft"
              />
            </Field>
          </div>

          {/* Spécialité - assigne le membre à l'une des trois catégories.
              Affiche un badge sur la carte publique et facilite la
              prise de contact ciblée par le visiteur. */}
          <Field label="Spécialité (catégorie d'expertise)">
            <select
              value={data.specialty ?? ""}
              onChange={(e) =>
                update("specialty", (e.target.value || null) as Draft["specialty"])
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Aucune (généraliste)</option>
              <option value="SHORT_STAY">Court séjour</option>
              <option value="RENT_LONG">Long durée</option>
              <option value="SALE">Achat</option>
            </select>
          </Field>

          {/* Locale tabs for role + bio */}
          <div>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-semibold">
              {(["fr", "en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setTab(l)}
                  className={`rounded-full px-3.5 py-1.5 uppercase transition ${
                    tab === l ? "bg-brand-600 text-white" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-4">
              <Field label={`Rôle (${tab.toUpperCase()})`}>
                <input
                  value={
                    tab === "fr"
                      ? data.roleFr
                      : tab === "en"
                        ? data.roleEn ?? ""
                        : data.roleAr ?? ""
                  }
                  onChange={(e) => {
                    if (tab === "fr") update("roleFr", e.target.value);
                    if (tab === "en") update("roleEn", e.target.value);
                    if (tab === "ar") update("roleAr", e.target.value);
                  }}
                  placeholder="Fondateur, conseil & sélection"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </Field>
              <Field label={`Bio (${tab.toUpperCase()})`}>
                <textarea
                  rows={4}
                  value={
                    tab === "fr"
                      ? data.bioFr
                      : tab === "en"
                        ? data.bioEn ?? ""
                        : data.bioAr ?? ""
                  }
                  onChange={(e) => {
                    if (tab === "fr") update("bioFr", e.target.value);
                    if (tab === "en") update("bioEn", e.target.value);
                    if (tab === "ar") update("bioAr", e.target.value);
                  }}
                  placeholder="1 à 3 phrases qui posent la personne et son rôle dans Nextwin."
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="WhatsApp (digits)">
              <input
                value={data.whatsapp ?? ""}
                onChange={(e) => update("whatsapp", e.target.value || null)}
                placeholder="212661234567"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="Téléphone">
              <input
                value={data.phone ?? ""}
                onChange={(e) => update("phone", e.target.value || null)}
                placeholder="+212 6 12 34 56 78"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={data.email ?? ""}
                onChange={(e) => update("email", e.target.value || null)}
                placeholder="abdou@nextwin.ma"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </Field>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-gray-100 p-5">
          <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={data.published}
              onChange={(e) => update("published", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Visible sur le site public
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Enregistrement…" : isNew ? "Créer le membre" : "Enregistrer"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
