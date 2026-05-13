import { prisma } from "@/lib/db";
import { ReviewsQueue } from "@/components/admin/ReviewsQueue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Avis · Admin",
};

export default async function AdminReviewsPage() {
  // Pending first (so the moderation backlog is at the top), then
  // approved + denied. Same ordering the API endpoint produces; we
  // fetch directly here to avoid a needless round-trip through the
  // network on first render.
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
  rows.sort((a, b) => {
    const order = (s: string) =>
      s === "pending" ? 0 : s === "approved" ? 1 : 2;
    return order(a.status) - order(b.status);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Avis</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Modérez les avis soumis par les voyageurs avant publication.
        </p>
      </div>

      <ReviewsQueue initialReviews={rows} />
    </div>
  );
}
