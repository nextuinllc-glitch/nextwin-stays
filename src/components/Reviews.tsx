"use client";

import { Star } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

type Review = {
  author: string;
  initials: string;
  // Years on the platform — Airbnb's signature "X ans sur NEXTWIN" line.
  yearsOnPlatform: number;
  date: string;
  // "Séjour d'une nuit" / "Séjour de quelques nuits" — Airbnb tags how
  // long the trip was right next to the date.
  stayKind: string;
  rating: number;
  body: string;
  // Optional avatar background colour so each card feels distinct without
  // needing real photos.
  avatarBg?: string;
};

// Sample reviews — original NEXTWIN copy, structured to mirror Airbnb's
// review card data shape (years on platform + stay length tag).
const SAMPLE_REVIEWS: Review[] = [
  {
    author: "Camille",
    initials: "C",
    yearsOnPlatform: 7,
    date: "mars 2026",
    stayKind: "Séjour d'une nuit",
    rating: 5,
    body:
      "Séjour absolument parfait ! ✨ Le logement était impeccable, conforme à la description et très agréable à vivre. Tout était propre, bien équipé et pensé jusqu'au moindre détail. L'hôte nous attendait à minuit avec du thé à la menthe.",
    avatarBg: "#FFE2E8",
  },
  {
    author: "Abderrahman",
    initials: "A",
    yearsOnPlatform: 8,
    date: "il y a 3 jours",
    stayKind: "Séjour de quelques nuits",
    rating: 5,
    body:
      "Séjour exceptionnel dans ce magnifique duplex à l'architecture à couper le souffle. Les photos représentent parfaitement l'appartement : élégant, très propre et fonctionnel. Conciergerie réactive, à recommander.",
    avatarBg: "#E0F0FF",
  },
  {
    author: "Ilona",
    initials: "I",
    yearsOnPlatform: 7,
    date: "il y a 1 semaine",
    stayKind: "Séjour d'une nuit",
    rating: 5,
    body:
      "Un séjour absolument incroyable ! Le logement est encore plus beau que sur les photos : décoration soignée, ambiance chaleureuse et équipements au top. À refaire sans hésiter.",
    avatarBg: "#FFEED1",
  },
  {
    author: "Sonia",
    initials: "S",
    yearsOnPlatform: 7,
    date: "il y a 3 semaines",
    stayKind: "Séjour de quelques nuits",
    rating: 5,
    body:
      "Bon accueil. Hôte réactif. Logement qui correspond aux photos et proche de commerces à pied. Je recommande et merci encore pour cet accueil chaleureux — nous referons appel à NEXTWIN.",
    avatarBg: "#E5E1FF",
  },
  {
    author: "Valentin",
    initials: "V",
    yearsOnPlatform: 1,
    date: "février 2026",
    stayKind: "Séjour de quelques nuits",
    rating: 5,
    body:
      "Logement propre, très bien décoré et pratique pour 6 personnes. Notre hôte a été réactif du début jusqu'à la fin pour les transferts, l'arrivée, le départ et pendant le séjour. Top.",
    avatarBg: "#D7F5DB",
  },
  {
    author: "Manon",
    initials: "M",
    yearsOnPlatform: 3,
    date: "décembre 2025",
    stayKind: "Séjour de quelques nuits",
    rating: 5,
    body:
      "Le logement était impeccable et idéalement situé. La literie était vraiment confortable, ce qui est rare à Marrakech, et nous avons beaucoup apprécié l'accueil personnalisé du concierge.",
    avatarBg: "#F0F0F0",
  },
];

type Props = {
  rating: number;
  reviewCount: number;
};

export function Reviews({ rating, reviewCount }: Props) {
  const { t } = useI18n();

  return (
    <section>
      {/* Top rating headline — Airbnb-style "★ 4,97 · 58 commentaires" */}
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 fill-ink text-ink" />
        <h2 className="font-display text-2xl font-semibold text-ink">
          {rating.toFixed(2)} · {reviewCount} {t.reviews.reviewsLabel}
        </h2>
      </div>

      {/* Two-column review grid — matches Airbnb's listing layout exactly:
          avatar + name + years subline, then row of 5 stars + date + stay
          kind, then the review body capped at ~3 lines visually. */}
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
        {SAMPLE_REVIEWS.map((r) => (
          <article key={r.author + r.date} className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold text-ink"
                style={{ backgroundColor: r.avatarBg ?? "#F0F0F0" }}
                aria-hidden
              >
                {r.initials}
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-ink">{r.author}</div>
                <div className="text-[13px] text-ink-muted">
                  {r.yearsOnPlatform} {r.yearsOnPlatform === 1 ? "an" : "ans"} sur NEXTWIN
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-muted">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < r.rating
                        ? "h-3 w-3 fill-ink text-ink"
                        : "h-3 w-3 text-gray-200"
                    }
                  />
                ))}
              </div>
              <span aria-hidden>·</span>
              <span>{r.date}</span>
              <span aria-hidden>·</span>
              <span>{r.stayKind}</span>
            </div>

            <p className="text-[14px] leading-relaxed text-ink line-clamp-3">{r.body}</p>
            <button
              type="button"
              className="text-[14px] font-semibold text-ink underline underline-offset-2 transition hover:text-brand-700"
            >
              Lire la suite
            </button>
          </article>
        ))}
      </div>

      <button type="button" className="btn-ghost mt-8 !rounded-lg !border-ink !text-ink">
        {t.reviews.showAll.replace("{n}", String(reviewCount))}
      </button>
    </section>
  );
}
