import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
        404
      </span>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-muted">
        That page either moved or never existed. Let&apos;s get you back to a stay you&apos;ll
        actually book.
      </p>
      <Link href="/" className="btn-primary mt-7">
        Back home
      </Link>
    </div>
  );
}
