"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  initial: boolean;
};

// Inline switch that posts to /api/admin/properties/[id]/publish.
// Optimistic — the badge flips instantly; if the request fails we revert
// and surface the error in a tiny tooltip via title.
export function PublishToggle({ id, initial }: Props) {
  const router = useRouter();
  const [published, setPublished] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const flip = async () => {
    if (busy) return;
    const next = !published;
    setBusy(true);
    setErr(null);
    setPublished(next); // optimistic
    try {
      const res = await fetch(`/api/admin/properties/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        setPublished(!next); // revert
        setErr(j?.error ?? "Échec");
      } else {
        // Refresh the server component so counts in the filter pills update.
        startTransition(() => router.refresh());
      }
    } catch {
      setPublished(!next);
      setErr("Erreur réseau");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      disabled={busy}
      title={err ?? (published ? "Cliquer pour dépublier" : "Cliquer pour publier")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
        published
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
          : "border-gray-200 bg-white text-ink-soft hover:border-gray-300 hover:text-ink",
        busy && "opacity-60",
        err && "border-rose-300 bg-rose-50 text-rose-700",
      )}
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : published ? (
        <Eye className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}
      {published ? "Publié" : "Brouillon"}
    </button>
  );
}
