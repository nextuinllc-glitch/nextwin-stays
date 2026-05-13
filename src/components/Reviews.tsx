"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, X, Search, PenLine, Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  getReviewsForSlug,
  type Review,
} from "@/lib/reviews-data";
import {
  getPublicSupabase,
  loadPendingReviewIds,
  savePendingReviewId,
} from "@/lib/supabase-public";

// Synthesised per-category scores — Airbnb shows Cleanliness / Accuracy /
// Check-in / Communication / Location / Value as separate fives. We
// store the i18n key and resolve the label at render time so the
// modal translates with the user's selected locale.
const CATEGORY_KEYS = [
  "cleanliness",
  "accuracy",
  "checkin",
  "communication",
  "location",
  "value",
] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

function jitter(rating: number, i: number) {
  const offsets = [0, -0.02, 0.03, -0.04, 0.02, -0.01];
  const v = Math.min(5, Math.max(0, rating + (offsets[i] ?? 0)));
  return v.toFixed(2);
}

// 5/4/3/2/1 distribution synthesised from the overall rating. With an
// average ≥ 4.8 we put ~80% in the 5-star bucket and taper down — a
// passable Airbnb-style histogram given we don't have per-review stars
// in aggregated form.
function ratingDistribution(rating: number) {
  if (rating >= 4.8) return [80, 14, 4, 1, 1];
  if (rating >= 4.5) return [65, 22, 8, 3, 2];
  if (rating >= 4.0) return [45, 30, 15, 7, 3];
  return [30, 30, 25, 10, 5];
}

type Props = {
  // Either pass the slug (preferred — the component pulls reviews from
  // the JSON map itself) or pass a ready-made reviews array (used by
  // tests / Storybook). Both forms are valid; the slug wins when set.
  slug?: string;
  reviews?: Review[];
  // Property title used in the "Leave a review" WhatsApp prefill so
  // the concierge knows which listing the submission is for. Falls
  // back to the slug when omitted.
  propertyTitle?: string;
};

// Shape of a Supabase Review row (matches the Prisma model). Subset of
// the columns; we only fetch what we display.
type SupabaseReviewRow = {
  id: string;
  propertySlug: string;
  author: string;
  origin: string | null;
  body: string;
  rating: number;
  status: string;
  createdAt: string;
};

function rowToReview(
  row: SupabaseReviewRow,
  opts: { dateLocale: string; stayKindLabel: string },
): Review {
  return {
    author: row.author,
    initials: (row.author[0] ?? "?").toUpperCase(),
    authorImage: null,
    origin: row.origin ?? "",
    date: new Date(row.createdAt).toLocaleDateString(opts.dateLocale, {
      month: "long",
      year: "numeric",
    }),
    stayKind: opts.stayKindLabel,
    rating: row.rating,
    body: row.body,
    avatarBg: "#FFE2E8",
  };
}

// Maps the i18n locale to a JS-friendly date-locale tag used by
// `toLocaleDateString`. Falls back to fr-FR (the brand's primary locale).
const DATE_LOCALE: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar",
};

export function Reviews({ slug, reviews: reviewsProp, propertyTitle }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Reviews submitted from THIS browser whose IDs we cached in
  // localStorage. We refetch them on mount + after every submit so the
  // status updates the moment the admin approves/denies them.
  const [myPendingReviews, setMyPendingReviews] = useState<Review[]>([]);
  // Tracks how many times the user has submitted a review on this
  // page-load — bumping this triggers a refetch of the pending list.
  const [refetchKey, setRefetchKey] = useState(0);

  // Resolve the review array once per render. Memoising means we don't
  // re-read the JSON for every state change (open/expanded). The empty
  // array fallback keeps the component safe to mount before a slug is
  // wired up.
  const reviews = useMemo<Review[]>(() => {
    if (reviewsProp) return reviewsProp;
    if (slug) return getReviewsForSlug(slug);
    return [];
  }, [slug, reviewsProp]);

  const reviewCount = reviews.length;
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  // Lock the page scroll while either the full-reviews modal OR the
  // "Leave a review" form is open so the backdrop doesn't double-scroll
  // the content underneath.
  useEffect(() => {
    if (!open && !formOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, formOpen]);

  // Fetch this browser's submitted reviews (by id from localStorage)
  // and surface any that are still pending OR were approved since the
  // last visit. We filter to the current slug so a review left on a
  // different listing doesn't leak in here.
  useEffect(() => {
    if (!slug) return;
    const ids = loadPendingReviewIds();
    if (ids.length === 0) {
      setMyPendingReviews([]);
      return;
    }
    const supabase = getPublicSupabase();
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("Review")
        .select("id, propertySlug, author, origin, body, rating, status, createdAt")
        .in("id", ids);
      if (cancelled || error || !data) return;
      const opts = {
        dateLocale: DATE_LOCALE[locale] ?? "fr-FR",
        stayKindLabel: t.reviews.form.stayKindRecent,
      };
      const mine = (data as SupabaseReviewRow[])
        .filter((r) => r.propertySlug === slug && r.status === "pending")
        .map((r) => rowToReview(r, opts));
      setMyPendingReviews(mine);
    })();
    return () => {
      cancelled = true;
    };
    // Locale / t intentionally not in deps — they only affect the
    // display formatting of the SAME data, so re-running the network
    // fetch on every locale switch would be wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, refetchKey]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (reviewCount === 0) return null;

  const isGuestFavourite = averageRating >= 4.8;
  const distribution = ratingDistribution(averageRating);

  return (
    <section>
      {/* ───── Hero: wreath + big rating + "Guest favorite" badge.
          Only the inline section renders this — the modal repeats it
          at the top of the overlay. */}
      {isGuestFavourite ? (
        <RatingHero
          rating={averageRating}
          title={t.reviews.guestFavourite}
          description={t.reviews.guestFavouriteDescription}
        />
      ) : (
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-ink text-ink" />
          <h2 className="font-display text-2xl font-semibold text-ink">
            {averageRating.toFixed(2)} · {reviewCount} {t.reviews.reviewsLabel}
          </h2>
        </div>
      )}

      {/* ───── Pending submissions from THIS browser. Shown above the
          public list so the submitter sees "yes, your review went
          through, it's just awaiting moderation". Disappears when the
          admin approves (the row's status flips to 'approved' and the
          RLS filter excludes it from the pending query). */}
      {myPendingReviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {myPendingReviews.map((r, i) => (
            <div
              key={r.author + r.date + i}
              className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"
            >
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                <Clock className="h-3 w-3" />
                {t.reviews.pendingBadge}
              </div>
              <ReviewCard review={r} isExpanded showFullBody onToggle={() => {}} />
            </div>
          ))}
        </div>
      )}

      {/* ───── Inline reviews — horizontal swipe carousel on mobile so
          the detail page doesn't grow with every review. Each card
          takes ~85% of the viewport and snaps from the left edge; the
          row gets `no-scrollbar` so the native scrollbar doesn't
          intrude on the design. On ≥sm the layout flips to a regular
          2-column editorial grid where vertical scroll is fine. */}
      <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 no-scrollbar sm:hidden">
        {reviews.map((r, i) => (
          <div key={r.author + r.date + i} className="w-[85%] shrink-0 snap-start">
            <ReviewCard
              review={r}
              isExpanded={expanded.has(r.author + r.date + i)}
              onToggle={() => toggle(r.author + r.date + i)}
            />
          </div>
        ))}
      </div>
      <div className="mt-8 hidden grid-cols-1 gap-x-12 gap-y-8 sm:grid sm:grid-cols-2">
        {reviews.slice(0, 4).map((r, i) => (
          <ReviewCard
            key={r.author + r.date + i}
            review={r}
            isExpanded={expanded.has(r.author + r.date + i)}
            onToggle={() => toggle(r.author + r.date + i)}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-ghost !rounded-lg !border-ink !text-ink"
        >
          {t.reviews.showAll.replace("{n}", String(reviewCount))}
        </button>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="btn-ghost !rounded-lg !border-ink !text-ink"
        >
          <PenLine className="h-4 w-4" />
          {t.reviews.leaveReviewCta}
        </button>
      </div>

      {/* ───── Full-reviews modal — Airbnb's signature pattern: the
          rating hero stays pinned at the top, then the bar-graph
          breakdown, then per-category averages, then every review in
          the data set scrollable beneath. */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close reviews"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-ink">
              {reviewCount} {t.reviews.reviewsLabel}
            </span>
            <span className="w-10" aria-hidden />
          </header>

          <div className="container-narrow py-10">
            {isGuestFavourite && (
              <RatingHero
                rating={averageRating}
                title={t.reviews.guestFavourite}
                description={t.reviews.guestFavouriteDescription}
              />
            )}

            <div className="mt-8 grid grid-cols-1 gap-8 border-y border-gray-200 py-8 sm:grid-cols-[200px_1fr]">
              <div>
                <div className="text-sm font-semibold text-ink">
                  {t.reviews.overallRating}
                </div>
                <div className="mt-3 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars, i) => (
                    <div key={stars} className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="w-2 text-right tabular-nums">{stars}</span>
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-ink"
                          style={{ width: `${distribution[i]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {CATEGORY_KEYS.map((key, i) => (
                  <div
                    key={key}
                    className="border-l border-gray-200 pl-4 first:border-l-0 first:pl-0 sm:border-l sm:pl-4"
                  >
                    <div className="text-xs text-ink-muted">
                      {t.reviews.categories[key]}
                    </div>
                    <div className="mt-1 text-base font-semibold text-ink">
                      {jitter(averageRating, i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink">
                {reviewCount} {t.reviews.reviewsLabel}
              </h3>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-ink transition hover:bg-gray-50"
                aria-label="Search reviews"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-6 divide-y divide-gray-100">
              {reviews.map((r, i) => (
                <li key={r.author + r.date + i} className="py-6">
                  <ReviewCard review={r} isExpanded showFullBody onToggle={() => {}} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ───── Leave-a-review form — opened from the inline "Laisser un
          avis" button. Submission inserts a pending row in Supabase and
          stashes the id in localStorage so the submitter can keep
          seeing their pending review until the admin approves it. */}
      {formOpen && slug && (
        <ReviewForm
          propertySlug={slug}
          propertyTitle={propertyTitle ?? slug}
          onClose={() => setFormOpen(false)}
          onSubmitted={() => {
            // Bump the refetch key so the pending-review effect fires
            // again and the new card appears immediately, without the
            // user having to refresh.
            setRefetchKey((k) => k + 1);
          }}
        />
      )}
    </section>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function RatingHero({
  rating,
  title,
  description,
}: {
  rating: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-baseline justify-center gap-4">
        <span aria-hidden className="text-4xl leading-none sm:text-5xl">
          🌿
        </span>
        <span className="font-display text-5xl font-bold tracking-tight text-ink sm:text-6xl">
          {rating.toFixed(1)}
        </span>
        <span aria-hidden className="scale-x-[-1] text-4xl leading-none sm:text-5xl">
          🌿
        </span>
      </div>
      <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p>
    </div>
  );
}

function ReviewCard({
  review: r,
  isExpanded,
  showFullBody,
  onToggle,
}: {
  review: Review;
  isExpanded: boolean;
  showFullBody?: boolean;
  onToggle: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = r.authorImage && !imgFailed;
  const showShowMore = !showFullBody && r.body.length > 180;
  return (
    <article className="space-y-2">
      <div className="flex items-center gap-3">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.authorImage ?? ""}
            alt={r.author}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-ink"
            style={{ backgroundColor: r.avatarBg ?? "#F0F0F0" }}
            aria-hidden
          >
            {r.initials}
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">{r.author}</div>
          {r.origin && (
            <div className="text-[13px] text-ink-muted">{r.origin}</div>
          )}
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
        {r.date && (
          <>
            <span aria-hidden>·</span>
            <span>{r.date}</span>
          </>
        )}
        {r.stayKind && (
          <>
            <span aria-hidden>·</span>
            <span>{r.stayKind}</span>
          </>
        )}
      </div>

      <p
        className={cn(
          "text-[14px] leading-relaxed text-ink",
          !isExpanded && !showFullBody && "line-clamp-3",
        )}
      >
        {r.body}
      </p>
      {showShowMore && (
        <ToggleReadMore isExpanded={isExpanded} onClick={onToggle} />
      )}
    </article>
  );
}

// Tiny wrapper so the read-more button can grab the i18n strings
// without having to thread `t` through every ReviewCard prop. Lives
// just below ReviewCard so the locale lookup happens at render time.
function ToggleReadMore({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[14px] font-semibold text-ink underline underline-offset-2 transition hover:text-brand-700"
    >
      {isExpanded ? t.reviews.showLess : t.reviews.showMore}
    </button>
  );
}

// ─── Leave-a-review form ─────────────────────────────────────────────

// Same set of categories as the rating-breakdown summary above, so the
// average reads as the row-by-row composition of the user's choices.
// Labels come from i18n at render time (see FORM_CATEGORY_KEYS below).
const FORM_CATEGORY_KEYS = [
  "cleanliness",
  "accuracy",
  "checkin",
  "communication",
  "location",
  "value",
] as const;

type FormCategoryKey = (typeof FORM_CATEGORY_KEYS)[number];

function ReviewForm({
  propertySlug,
  propertyTitle,
  onClose,
  onSubmitted,
}: {
  propertySlug: string;
  propertyTitle: string;
  onClose: () => void;
  // Fires after a successful insert so the parent <Reviews> can refresh
  // its "your pending review" banner without a full page reload.
  onSubmitted: (id: string) => void;
}) {
  const { t } = useI18n();
  // Each category starts at zero (un-set). Submit gate requires every
  // category to be ≥ 1 so we don't end up storing a 0/5 score. The
  // overall is computed live as an average across the six categories.
  const [ratings, setRatings] = useState<Record<FormCategoryKey, number>>(() =>
    Object.fromEntries(FORM_CATEGORY_KEYS.map((k) => [k, 0])) as Record<FormCategoryKey, number>,
  );
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allRated = FORM_CATEGORY_KEYS.every((k) => ratings[k] >= 1);
  const valid =
    !submitting && allRated && name.trim().length >= 2 && body.trim().length >= 20;

  const overall =
    Object.values(ratings).reduce((s, v) => s + v, 0) / FORM_CATEGORY_KEYS.length;

  const setOne = (key: FormCategoryKey, value: number) =>
    setRatings((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!valid) return;
    const supabase = getPublicSupabase();
    if (!supabase) {
      setErrorMessage(t.reviews.form.errorMissingConfig);
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    // Generate id + updatedAt on the client. The Prisma model defaults
    // them via `@default(cuid())` and `@updatedAt`, which are Prisma-
    // client-side only — when we INSERT through Supabase's REST API
    // (PostgREST), neither default fires, so the columns end up NULL
    // and Postgres rejects the row. Generating them here keeps Supabase
    // happy without needing a new migration.
    const now = new Date().toISOString();
    const newId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const { data, error } = await supabase
      .from("Review")
      .insert({
        id: newId,
        propertySlug,
        author: name.trim(),
        origin: origin.trim() || null,
        body: body.trim(),
        rating: Math.round(overall),
        categoryRatings: JSON.stringify(ratings),
        status: "pending",
        updatedAt: now,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      setErrorMessage(error?.message ?? t.reviews.form.errorGeneric);
      return;
    }
    // Persist the new id so this browser can keep seeing the pending
    // card until the concierge approves or denies it.
    savePendingReviewId(data.id);
    onSubmitted(data.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.search.close}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-ink">
          {t.reviews.leaveReviewCta}
        </span>
        <span className="w-10" aria-hidden />
      </header>

      <div className="container-narrow py-8">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          {t.reviews.form.title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t.reviews.form.subtitle}</p>
        <p className="sr-only">{propertyTitle}</p>

        {/* Per-category star rows — 5 clickable stars each. The current
            value fills its star + every star to its left so the bar
            reads as a "fill to here" meter rather than a single picked
            star. */}
        <div className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200">
          {FORM_CATEGORY_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 px-4 py-4"
            >
              <div className="text-sm font-semibold text-ink">
                {t.reviews.categories[key]}
              </div>
              <StarPicker
                value={ratings[key]}
                onChange={(v) => setOne(key, v)}
                ariaLabelPrefix={t.reviews.categories[key]}
              />
            </div>
          ))}
        </div>

        {/* Live overall + a hint when the user hasn't filled every row. */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3">
          <span className="text-sm font-semibold text-ink">
            {t.reviews.overallRating}
          </span>
          <span className="text-base font-bold tabular-nums text-ink">
            {allRated ? overall.toFixed(1) : "—"}
            <span className="ml-1 text-sm font-normal text-ink-muted">/ 5</span>
          </span>
        </div>

        {/* Identity + free-form review body. */}
        <div className="mt-6 space-y-4">
          <FormField label={t.reviews.form.firstName}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label={t.reviews.form.city}>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label={t.reviews.form.reviewLabel}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder={t.reviews.form.reviewPlaceholder}
              className="form-input resize-none"
            />
            <p className="mt-1 text-[11px] text-ink-soft">
              {t.reviews.form.remainingChars.replace(
                "{n}",
                String(Math.max(0, 20 - body.trim().length)),
              )}
            </p>
          </FormField>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid}
            className={cn(
              "btn-primary justify-self-stretch",
              !valid && "cursor-not-allowed opacity-50",
            )}
          >
            {submitting ? t.reviews.form.submitting : t.reviews.form.submit}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-ghost !rounded-lg !border-ink !text-ink disabled:opacity-50"
          >
            {t.reviews.form.cancel}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-ink-soft">
          {t.reviews.form.submittedNote}
        </p>
      </div>

      {/* Local CSS for the form inputs — re-used by both <input> and
          <textarea> so the focus state is consistent across the form. */}
      <style>{`
        .form-input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          padding: 0.625rem 0.875rem;
          font-size: 0.9375rem;
          color: #222222;
          outline: none;
          transition: all 0.15s;
        }
        .form-input::placeholder { color: #B0B0B0; }
        .form-input:focus {
          border-color: #222222;
          box-shadow: 0 0 0 3px rgba(34, 34, 34, 0.12);
        }
      `}</style>
    </div>
  );
}

function StarPicker({
  value,
  onChange,
  ariaLabelPrefix,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabelPrefix: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${ariaLabelPrefix} : ${n} étoile${n > 1 ? "s" : ""}`}
          className="p-0.5 transition hover:scale-110"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              n <= value ? "fill-ink text-ink" : "text-gray-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
