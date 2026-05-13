"use client";

import { useState } from "react";
import { Check, X, Trash2, Clock, RotateCcw, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Subset of the Prisma `Review` columns we actually render. Kept in
// sync with prisma/schema.prisma — fields not displayed here are
// dropped so the SSR payload stays slim.
type ReviewRow = {
  id: string;
  propertySlug: string;
  author: string;
  origin: string | null;
  body: string;
  rating: number;
  categoryRatings: string;
  authorImage: string | null;
  status: string;
  createdAt: Date | string;
};

type Props = {
  initialReviews: ReviewRow[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  approved: "Publié",
  denied: "Refusé",
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  denied: "bg-gray-100 text-gray-600",
};

export function ReviewsQueue({ initialReviews }: Props) {
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "denied">(
    initialReviews.some((r) => r.status === "pending") ? "pending" : "all",
  );

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    denied: reviews.filter((r) => r.status === "denied").length,
  };

  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  // PATCH the status and patch the local row in place so the queue
  // updates without a full refetch. On error we revert visually and
  // surface the message via alert (admin-only, no UI polish needed).
  const setStatus = async (id: string, status: "approved" | "denied" | "pending") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.error ?? "Échec de la mise à jour");
        return;
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet avis définitivement ?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.error ?? "Échec de la suppression");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter tabs — count badges so the admin sees the backlog size
          at a glance without expanding each section. */}
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "denied", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
              filter === f
                ? "border-ink bg-ink text-white"
                : "border-gray-200 bg-white text-ink hover:border-gray-300",
            )}
          >
            <span>
              {f === "all" ? "Tous" : STATUS_LABEL[f]}
            </span>
            <span
              className={cn(
                "text-xs",
                filter === f ? "text-white/80" : "text-ink-soft",
              )}
            >
              ({counts[f]})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-base font-semibold text-ink">
            Aucun avis dans cette catégorie.
          </p>
          <p className="mt-1.5 text-sm text-ink-muted">
            Les avis soumis par les voyageurs apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <ReviewRowCard
              key={r.id}
              row={r}
              busy={busyId === r.id}
              onApprove={() => setStatus(r.id, "approved")}
              onDeny={() => setStatus(r.id, "denied")}
              onRequeue={() => setStatus(r.id, "pending")}
              onDelete={() => remove(r.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewRowCard({
  row,
  busy,
  onApprove,
  onDeny,
  onRequeue,
  onDelete,
}: {
  row: ReviewRow;
  busy: boolean;
  onApprove: () => void;
  onDeny: () => void;
  onRequeue: () => void;
  onDelete: () => void;
}) {
  let categories: Record<string, number> = {};
  try {
    categories = JSON.parse(row.categoryRatings || "{}");
  } catch {
    categories = {};
  }
  const created = new Date(row.createdAt);
  const createdLabel = created.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-ink">{row.author}</span>
            {row.origin && (
              <span className="text-sm text-ink-muted">· {row.origin}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1 font-mono">
              <Star className="h-3 w-3 fill-ink text-ink" />
              {row.rating}/5
            </span>
            <span>·</span>
            <span>{row.propertySlug}</span>
            <span>·</span>
            <span>{createdLabel}</span>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
            STATUS_TONE[row.status],
          )}
        >
          {row.status === "pending" && <Clock className="h-3 w-3" />}
          {row.status === "approved" && <Check className="h-3 w-3" />}
          {row.status === "denied" && <X className="h-3 w-3" />}
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
        {row.body}
      </p>

      {Object.keys(categories).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
          {Object.entries(categories).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span className="font-semibold capitalize text-ink">{k}</span>
              <span>{v}/5</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {row.status !== "approved" && (
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Publier
          </button>
        )}
        {row.status !== "denied" && (
          <button
            type="button"
            onClick={onDeny}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Refuser
          </button>
        )}
        {row.status !== "pending" && (
          <button
            type="button"
            onClick={onRequeue}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Remettre en attente
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Supprimer
        </button>
      </div>
    </li>
  );
}
