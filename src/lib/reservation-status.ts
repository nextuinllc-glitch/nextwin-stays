// Canonical status / source constants for reservations. Stored as plain
// strings in SQLite (Prisma enums emulated as text aren't enforced at the
// DB level on SQLite anyway). The const arrays below are the source of
// truth for filters, validators, and the UI status pill colors.

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const BOOKING_SOURCES = [
  "DIRECT",
  "AIRBNB",
  "BOOKING",
  "EXPEDIA",
  "OTHER",
] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

// Statuses that block the calendar (i.e. count toward double-booking guard).
// CANCELLED + NO_SHOW free the dates.
export const BLOCKING_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
];

// Allowed transitions per status. UI only shows actions that resolve to one
// of these targets, and the API enforces them too.
export const STATUS_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["COMPLETED", "CANCELLED"],
  COMPLETED:  [],
  CANCELLED:  [],
  NO_SHOW:    [],
};

// Tailwind classes per status — used by pills in the list, detail header,
// calendar bars. Keep in sync with the legend.
export const STATUS_BADGE: Record<ReservationStatus, string> = {
  PENDING:    "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED:  "bg-emerald-100 text-emerald-800 border-emerald-200",
  CHECKED_IN: "bg-sky-100 text-sky-800 border-sky-200",
  COMPLETED:  "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED:  "bg-rose-100 text-rose-700 border-rose-200",
  NO_SHOW:    "bg-rose-50 text-rose-600 border-rose-200",
};

// Bar color on the master calendar — solid blocks, distinct from the pill
// colors so the calendar doesn't look pastel.
export const STATUS_BAR: Record<ReservationStatus, string> = {
  PENDING:    "bg-amber-500/85 text-white",
  CONFIRMED:  "bg-emerald-600/90 text-white",
  CHECKED_IN: "bg-sky-600/90 text-white",
  COMPLETED:  "bg-slate-500/80 text-white",
  CANCELLED:  "bg-rose-500/40 text-white line-through",
  NO_SHOW:    "bg-rose-500/40 text-white",
};

export const STATUS_LABEL_FR: Record<ReservationStatus, string> = {
  PENDING:    "En attente",
  CONFIRMED:  "Confirmée",
  CHECKED_IN: "Arrivée",
  COMPLETED:  "Terminée",
  CANCELLED:  "Annulée",
  NO_SHOW:    "Non-présentation",
};

export const SOURCE_LABEL: Record<BookingSource, string> = {
  DIRECT:  "Direct",
  AIRBNB:  "Airbnb",
  BOOKING: "Booking.com",
  EXPEDIA: "Expedia",
  OTHER:   "Autre",
};

export function isStatus(v: unknown): v is ReservationStatus {
  return typeof v === "string" && (RESERVATION_STATUSES as readonly string[]).includes(v);
}
export function isSource(v: unknown): v is BookingSource {
  return typeof v === "string" && (BOOKING_SOURCES as readonly string[]).includes(v);
}
