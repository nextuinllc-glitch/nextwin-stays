import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: "EUR" | "USD" | "MAD" = "EUR") {
  if (currency === "MAD") {
    // French-style thousands separator + " MAD" suffix - the convention used
    // by Moroccan real-estate listings (e.g. "12 500 000 MAD").
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} MAD`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact MAD format for large sale prices (e.g. "12,5 M MAD").
 * Falls back to the standard format below 1,000.
 */
export function formatPriceShort(amount: number, currency: "EUR" | "USD" | "MAD" = "MAD") {
  if (currency === "MAD") {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M MAD`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} K MAD`;
    }
  }
  return formatPrice(amount, currency);
}

export function formatDateRange(from: Date | null, to: Date | null) {
  if (!from || !to) return "";
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  return `${fmt.format(from)} – ${fmt.format(to)}`;
}

export function nightsBetween(from: Date | null, to: Date | null) {
  if (!from || !to) return 0;
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
