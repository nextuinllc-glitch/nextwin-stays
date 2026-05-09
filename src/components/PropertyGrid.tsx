import { PropertyCard } from "./PropertyCard";
import type { Property } from "@/lib/properties";

type Props = {
  properties: Property[];
  title?: string;
  subtitle?: string;
  cta?: { href: string; label: string };
};

export function PropertyGrid({ properties, title, subtitle, cta }: Props) {
  if (!properties.length) {
    return (
      <div className="container-page py-16 text-center text-ink-muted">
        No properties match your search yet — try adjusting your dates or filters.
      </div>
    );
  }

  return (
    <section className="container-page py-12 sm:py-16">
      {(title || subtitle) && (
        <header className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          {title && (
            <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-700 sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="max-w-xl text-sm text-ink-muted sm:text-base">{subtitle}</p>
          )}
          {cta && (
            <a
              href={cta.href}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              {cta.label}
              <span aria-hidden>→</span>
            </a>
          )}
        </header>
      )}

      <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p, i) => (
          <PropertyCard key={p.slug} property={p} priority={i < 3} />
        ))}
      </div>
    </section>
  );
}
