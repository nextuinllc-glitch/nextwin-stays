/**
 * Skeleton shown the instant a visitor taps a property card, while the
 * server is still fetching the detail page's data. Mirrors the rough
 * shape of the rendered detail (back link, gallery placeholder, title
 * block, info column, sidebar widget) so the layout doesn't jump when
 * the real content swaps in.
 *
 * Next.js automatically streams this on navigation, replacing it as
 * soon as the server-rendered page is ready. Perceived performance
 * goes from "blank tab for 1-3s" to "page structure appears
 * immediately and fills in".
 */
export default function Loading() {
  return (
    <div className="container-page py-6 sm:py-8">
      {/* Back link placeholder */}
      <div className="h-5 w-32 animate-pulse rounded-full bg-cream-100" />

      {/* Gallery placeholder - 6:7 portrait on mobile, 4-col magazine
          spread on desktop. Same heights as the real Gallery so the
          page doesn't reflow when the real content arrives. */}
      <div className="mt-4 grid gap-2 md:grid-cols-4 md:grid-rows-2">
        <div className="aspect-[6/7] w-full animate-pulse rounded-3xl bg-cream-100 md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[520px]" />
        <div className="hidden aspect-square w-full animate-pulse rounded-3xl bg-cream-100 md:block" />
        <div className="hidden aspect-square w-full animate-pulse rounded-3xl bg-cream-100 md:block" />
        <div className="hidden aspect-square w-full animate-pulse rounded-3xl bg-cream-100 md:block" />
        <div className="hidden aspect-square w-full animate-pulse rounded-3xl bg-cream-100 md:block" />
      </div>

      {/* Title block + sidebar widget */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="h-9 w-3/4 animate-pulse rounded-md bg-cream-100" />
          <div className="h-5 w-1/2 animate-pulse rounded-md bg-cream-100" />
          <div className="h-px w-full bg-cream-200" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded-md bg-cream-100" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-cream-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-cream-100" />
          </div>
        </div>
        <div className="hidden h-96 animate-pulse rounded-2xl bg-cream-100 lg:block" />
      </div>
    </div>
  );
}
