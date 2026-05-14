"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, Heart, Compass } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { pickField, pickImage, type PageContentMap } from "@/lib/page-content-schema";

type Props = {
  pageContent?: PageContentMap;
};

// Stock fallbacks — only used when the admin has never touched the
// field. An explicit clear in the admin (empty string) overrides
// these to null and hides the cell entirely. See `pickImage`.
const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=2400&q=80";
const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80",
] as const;

export function AboutContent({ pageContent }: Props) {
  const { t, locale } = useI18n();
  const get = (key: string, fallback: string) =>
    pickField(pageContent, key, locale, fallback);
  const getImg = (key: string, fallback: string | null) =>
    pickImage(pageContent, key, fallback);

  const heroImage = getImg("heroImage", FALLBACK_HERO_IMAGE);
  const galleryImages: Array<string | null> = [
    getImg("galleryImage1", FALLBACK_GALLERY[0]),
    getImg("galleryImage2", FALLBACK_GALLERY[1]),
    getImg("galleryImage3", FALLBACK_GALLERY[2]),
    getImg("galleryImage4", FALLBACK_GALLERY[3]),
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-ink">
        {heroImage && (
          <div className="absolute inset-0 opacity-50">
            <Image
              src={heroImage}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
          </div>
        )}
        <div className="container-page relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur">
              {get("heroEyebrow", t.about.heroEyebrow)}
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {get("heroTitle", t.about.heroTitle)}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              {get("heroSubtitle", t.about.heroSubtitle)}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {get("storyTitle", t.about.storyTitle)}
            </h2>
            <div className="prose prose-sm mt-5 max-w-prose text-ink-muted sm:prose-base">
              <p>{get("storyP1", t.about.storyP1)}</p>
              <p>{get("storyP2", t.about.storyP2)}</p>
              <p>{get("storyP3", t.about.storyP3)}</p>
            </div>
          </div>

          {/* Story-section gallery — four slots managed from the admin
              Pages editor. Each slot's aspect ratio is fixed so the
              staggered layout stays visually balanced; an empty slot
              renders nothing (rather than a stock fallback) so an
              intentional clear in the admin actually hides the cell. */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              {galleryImages[0] && (
                <GalleryCell src={galleryImages[0]} aspect="aspect-[3/4]" />
              )}
              {galleryImages[1] && (
                <GalleryCell src={galleryImages[1]} aspect="aspect-square" />
              )}
            </div>
            <div className="translate-y-10 space-y-3">
              {galleryImages[2] && (
                <GalleryCell src={galleryImages[2]} aspect="aspect-square" />
              )}
              {galleryImages[3] && (
                <GalleryCell src={galleryImages[3]} aspect="aspect-[3/4]" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50/70">
        <div className="container-page py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {get("pillarsTitle", t.about.pillarsTitle)}
            </h2>
            <p className="mt-3 text-sm text-ink-muted sm:text-base">
              {get("pillarsSubtitle", t.about.pillarsSubtitle)}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Pillar
              icon={<Compass className="h-5 w-5" />}
              title={get("pillar1Title", t.about.pillar1Title)}
              body={get("pillar1Body", t.about.pillar1Body)}
            />
            <Pillar
              icon={<Sparkles className="h-5 w-5" />}
              title={get("pillar2Title", t.about.pillar2Title)}
              body={get("pillar2Body", t.about.pillar2Body)}
            />
            <Pillar
              icon={<Heart className="h-5 w-5" />}
              title={get("pillar3Title", t.about.pillar3Title)}
              body={get("pillar3Body", t.about.pillar3Body)}
            />
            <Pillar
              icon={<ShieldCheck className="h-5 w-5" />}
              title={get("pillar4Title", t.about.pillar4Title)}
              body={get("pillar4Body", t.about.pillar4Body)}
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/properties" className="btn-primary">
              {get("seeStaysCta", t.about.seeStaysCta)}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function GalleryCell({ src, aspect }: { src: string; aspect: "aspect-[3/4]" | "aspect-square" }) {
  return (
    <div className={`${aspect} overflow-hidden rounded-2xl`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
