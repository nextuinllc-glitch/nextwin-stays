"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  // Always render up to 4 secondary tiles. If the property has fewer than 5
  // images we fall back to repeating from the start so the right-hand 2x2
  // grid never has empty cells.
  const secondaryTiles = Array.from({ length: 4 }, (_, i) => {
    const idx = (i + 1) % images.length;
    return { ...images[idx], _idx: idx };
  });

  return (
    <>
      {/* Mobile hero gets a generous square (1:1) aspect so the photo
          actually fills the viewport like a hotel-app card. Desktop
          keeps the magazine-spread layout: hero takes 2 of 4 cols and
          stretches both rows, so it grows naturally with the secondary
          2×2 tile grid next to it (taller min-height to give it heft). */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:min-h-[520px]">
        <button
          onClick={() => openAt(0)}
          className="relative col-span-4 row-span-2 aspect-square overflow-hidden md:col-span-2 md:aspect-auto"
        >
          <Image
            src={images[0].src}
            alt={images[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition hover:scale-[1.02]"
          />
        </button>
        {secondaryTiles.map((img, i) => (
          <button
            key={i}
            onClick={() => openAt(img._idx)}
            className="relative hidden aspect-square overflow-hidden md:block"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="25vw"
              className="object-cover transition hover:scale-[1.02]"
            />
            {i === 3 && images.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                +{images.length - 5} photos
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => openAt(0)}
          className="btn-ghost"
        >
          <Grid2x2 className="h-4 w-4" />
          <span>{t.detail.viewAllPhotos.replace("{n}", String(images.length))}</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm font-medium">
              {index + 1} / {images.length}
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
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % images.length)}
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
