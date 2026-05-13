"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Grid2x2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type Img = { src: string; alt: string };

type Props = {
  images: Img[];
};

export function Gallery({ images }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // `index` is shared between the lightbox and the mobile swipe carousel
  // so opening the fullscreen from a swiped position lands on the same
  // photo the user was last looking at, not back at photo 0.
  const [index, setIndex] = useState(0);
  const total = images.length;

  // Mobile swipe-gesture bookkeeping — mirrors the PropertyCard pattern.
  // Tapping the photo opens the lightbox, swiping it cycles through
  // without opening the fullscreen.
  const touchStartXRef = useRef<number | null>(null);
  const swipedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, total]);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  // Mobile-only handlers — desktop has the 2×2 magazine spread instead.
  const SWIPE_THRESHOLD = 40;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    swipedRef.current = false;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    if (startX == null || total <= 1) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX == null) return;
    const dx = endX - startX;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      swipedRef.current = true;
      if (dx > 0) setIndex((i) => (i - 1 + total) % total);
      else setIndex((i) => (i + 1) % total);
    }
    touchStartXRef.current = null;
  };
  const handleImageTap = () => {
    // A real tap opens the lightbox; a swipe-then-release flips the flag
    // first so we know not to open. Reset for the next interaction.
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    openAt(index);
  };

  // Desktop magazine spread — always uses image[0] as the hero plus 4
  // fixed thumbnails. Repeating from the start when total < 5 so the
  // 2×2 grid never has empty cells.
  const secondaryTiles = Array.from({ length: 4 }, (_, i) => {
    const idx = (i + 1) % total;
    return { ...images[idx], _idx: idx };
  });

  return (
    <>
      {/* ─── MOBILE: swipeable single-image carousel ─── */}
      <div className="md:hidden">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageTap}
          // Subtle portrait (6:7) — taller than a square but smaller
          // than 4:5, so the next section is comfortably visible at
          // the fold. Swipe gesture is the only navigation affordance;
          // the counter pill is the only on-image UI.
          className="relative aspect-[6/7] w-full overflow-hidden rounded-3xl bg-gray-100 touch-pan-y"
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}

          {/* Position counter — bottom-right pill, mirrors the lightbox
              counter so users know how many photos are left to swipe. */}
          {total > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
              {index + 1} / {total}
            </span>
          )}
        </div>
      </div>

      {/* ─── DESKTOP: magazine 2×2 spread ─── */}
      <div className="hidden grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid md:min-h-[520px]">
        <button
          onClick={() => openAt(0)}
          className="relative col-span-2 row-span-2 overflow-hidden"
        >
          <Image
            src={images[0].src}
            alt={images[0].alt}
            fill
            sizes="50vw"
            priority
            className="object-cover transition hover:scale-[1.02]"
          />
        </button>
        {secondaryTiles.map((img, i) => (
          <button
            key={i}
            onClick={() => openAt(img._idx)}
            className="relative aspect-square overflow-hidden"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="25vw"
              className="object-cover transition hover:scale-[1.02]"
            />
            {i === 3 && total > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                +{total - 5} photos
              </span>
            )}
          </button>
        ))}
      </div>

      {/* "View all photos" CTA — visible on every breakpoint as the
          escape hatch from the inline view into the fullscreen lightbox. */}
      <div className="mt-3 flex justify-end">
        <button onClick={() => openAt(index)} className="btn-ghost">
          <Grid2x2 className="h-4 w-4" />
          <span>{t.detail.viewAllPhotos.replace("{n}", String(total))}</span>
        </button>
      </div>

      {/* ─── LIGHTBOX: fullscreen carousel ─── */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm font-medium">
              {index + 1} / {total}
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              onClick={() => setIndex((i) => (i - 1 + total) % total)}
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % total)}
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mx-auto flex max-w-full gap-2 overflow-x-auto p-4 no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-md ring-2 transition",
                  i === index ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.src} alt={img.alt} fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
