"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
};

// Menara / Airbnb-style wordmark — pure typography, no graphic, no
// subtitle. Two-tone split: "NEXTWIN" in the magenta brand colour,
// "STAY" in ink (or white over hero photos). The `light` variant flips
// the ink half to white so the mark stays readable when laid over the
// hero video / dark imagery.
export function Logo({ className, variant = "default" }: LogoProps) {
  const inkTone = variant === "light" ? "text-white" : "text-ink";

  return (
    <Link
      href="/"
      aria-label="NEXTWIN STAY"
      className={cn(
        "inline-flex items-baseline gap-1.5 font-display text-xl font-extrabold tracking-tight sm:text-2xl",
        className,
      )}
    >
      <span className="text-brand-500">NEXTWIN</span>
      <span className={inkTone}>STAY</span>
    </Link>
  );
}
