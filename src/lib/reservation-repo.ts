import { prisma } from "./db";
import {
  BLOCKING_STATUSES,
  STATUS_TRANSITIONS,
  type ReservationStatus,
  type BookingSource,
  isStatus,
  isSource,
} from "./reservation-status";

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

// Generate a human-friendly reference: NW-2026-0143. Year-prefixed counter
// based on existing rows. SQLite has no sequences so we count + pad.
async function generateReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `NW-${year}-`;
  const last = await prisma.reservation.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastN = last ? parseInt(last.reference.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastN + 1).padStart(4, "0")}`;
}

// ──────────────────────────────────────────────────────────────────────
// Availability / conflict guard
// ──────────────────────────────────────────────────────────────────────

export type AvailabilityResult =
  | { available: true }
  | { available: false; conflicts: Array<{ id: string; reference: string; checkIn: Date; checkOut: Date; status: string }> };

export async function checkAvailability(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  excludeReservationId?: string,
): Promise<AvailabilityResult> {
  // Half-open interval [checkIn, checkOut). Two reservations conflict iff:
  //   existing.checkIn  <  newCheckOut  AND
  //   existing.checkOut >  newCheckIn
  const conflicts = await prisma.reservation.findMany({
    where: {
      propertyId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      status: { in: BLOCKING_STATUSES as unknown as string[] },
      checkIn:  { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true, reference: true, checkIn: true, checkOut: true, status: true },
    orderBy: { checkIn: "asc" },
  });
  if (conflicts.length === 0) return { available: true };
  return { available: false, conflicts };
}

// ──────────────────────────────────────────────────────────────────────
// Client upsert (auto-CRM)
// ──────────────────────────────────────────────────────────────────────

export type ClientInput = {
  id?: string;            // pick existing
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
};

export async function findOrCreateClient(input: ClientInput) {
  if (input.id) {
    const existing = await prisma.client.findUnique({ where: { id: input.id } });
    if (existing) return existing;
  }

  const email = input.email?.trim().toLowerCase() || undefined;
  const phone = input.phone?.trim() || undefined;

  // Best-effort dedupe — match on email first, fall back to phone.
  if (email) {
    const byEmail = await prisma.client.findFirst({ where: { email } });
    if (byEmail) return byEmail;
  }
  if (phone) {
    const byPhone = await prisma.client.findFirst({ where: { phone } });
    if (byPhone) return byPhone;
  }

  const firstName = (input.firstName || "Guest").trim();
  const lastName = (input.lastName || "—").trim();
  return prisma.client.create({
    data: { firstName, lastName, email, phone, nationality: input.nationality },
  });
}

export async function recomputeClientTotalSpend(clientId: string) {
  const sum = await prisma.reservation.aggregate({
    where: { clientId, status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
    _sum: { total: true },
  });
  await prisma.client.update({
    where: { id: clientId },
    data: { totalSpend: sum._sum.total ?? 0 },
  });
}

// ──────────────────────────────────────────────────────────────────────
// Create / update / cancel
// ──────────────────────────────────────────────────────────────────────

export type CreateReservationInput = {
  propertyId: string;
  client: ClientInput;
  checkIn: string | Date;     // ISO date or Date
  checkOut: string | Date;
  guests?: number;
  source?: BookingSource;
  status?: ReservationStatus;
  nightlyRate?: number;       // override, otherwise pulled from property
  cleaningFee?: number;       // override, otherwise pulled from settings
  serviceFeeRate?: number;    // override, otherwise pulled from settings
  notes?: string;
  specialRequests?: string;
};

export async function createReservation(input: CreateReservationInput) {
  const checkIn  = startOfDay(new Date(input.checkIn));
  const checkOut = startOfDay(new Date(input.checkOut));
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) throw new Error("Le séjour doit durer au moins une nuit.");

  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property) throw new Error("Propriété introuvable.");

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const cleaningFee = input.cleaningFee ?? settings?.cleaningFee ?? 0;
  const serviceFeeRate = input.serviceFeeRate ?? settings?.serviceFeeRate ?? 0;
  const nightlyRate = input.nightlyRate ?? property.pricePerNight;

  const subtotal = nightlyRate * nights;
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const total = subtotal + cleaningFee + serviceFee;

  const status: ReservationStatus = input.status ?? "PENDING";
  const source: BookingSource = input.source ?? "DIRECT";

  // Conflict guard. Skip if status is non-blocking (e.g. creating a
  // pre-cancelled archive row, unusual but allowed).
  if (BLOCKING_STATUSES.includes(status)) {
    const avail = await checkAvailability(input.propertyId, checkIn, checkOut);
    if (!avail.available) {
      const list = avail.conflicts
        .map((c) => `${c.reference} (${c.checkIn.toISOString().slice(0, 10)} → ${c.checkOut.toISOString().slice(0, 10)})`)
        .join(", ");
      throw new Error(`Conflit de calendrier avec : ${list}`);
    }
  }

  const client = await findOrCreateClient(input.client);
  const reference = await generateReference();

  const reservation = await prisma.reservation.create({
    data: {
      reference,
      propertyId: property.id,
      clientId: client.id,
      status,
      source,
      checkIn,
      checkOut,
      nights,
      guests: input.guests ?? 2,
      nightlyRate,
      cleaningFee,
      serviceFee,
      total,
      currency: property.currency,
      notes: input.notes ?? null,
      specialRequests: input.specialRequests ?? null,
    },
    include: { property: true, client: true },
  });

  await recomputeClientTotalSpend(client.id);
  return reservation;
}

export type UpdateReservationInput = Partial<{
  status: ReservationStatus;
  source: BookingSource;
  checkIn: string | Date;
  checkOut: string | Date;
  guests: number;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  notes: string | null;
  specialRequests: string | null;
}>;

export async function updateReservation(id: string, patch: UpdateReservationInput) {
  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) throw new Error("Réservation introuvable.");

  // Status transition guard
  if (patch.status && patch.status !== existing.status) {
    if (!isStatus(existing.status)) throw new Error("Statut actuel invalide.");
    const allowed = STATUS_TRANSITIONS[existing.status as ReservationStatus] ?? [];
    if (!allowed.includes(patch.status)) {
      throw new Error(`Transition non autorisée: ${existing.status} → ${patch.status}.`);
    }
  }
  if (patch.source && !isSource(patch.source)) throw new Error("Source invalide.");

  const newStatus: ReservationStatus = (patch.status as ReservationStatus) ?? (existing.status as ReservationStatus);
  const checkIn = patch.checkIn ? startOfDay(new Date(patch.checkIn)) : existing.checkIn;
  const checkOut = patch.checkOut ? startOfDay(new Date(patch.checkOut)) : existing.checkOut;
  const nights = nightsBetween(checkIn, checkOut);

  // Conflict re-check if dates moved or status moves into blocking.
  const datesChanged = checkIn.getTime() !== existing.checkIn.getTime() || checkOut.getTime() !== existing.checkOut.getTime();
  const becomesBlocking = BLOCKING_STATUSES.includes(newStatus) && !BLOCKING_STATUSES.includes(existing.status as ReservationStatus);
  if (datesChanged || becomesBlocking) {
    const avail = await checkAvailability(existing.propertyId, checkIn, checkOut, existing.id);
    if (!avail.available) {
      throw new Error("Conflit de calendrier — un autre séjour occupe ces dates.");
    }
  }

  const nightlyRate = patch.nightlyRate ?? existing.nightlyRate;
  const cleaningFee = patch.cleaningFee ?? existing.cleaningFee;
  const serviceFee = patch.serviceFee ?? existing.serviceFee;
  const subtotal = nightlyRate * nights;
  const total = subtotal + cleaningFee + serviceFee;

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: newStatus,
      source: patch.source ?? existing.source,
      checkIn,
      checkOut,
      nights,
      guests: patch.guests ?? existing.guests,
      nightlyRate,
      cleaningFee,
      serviceFee,
      total,
      notes: patch.notes === undefined ? existing.notes : patch.notes,
      specialRequests: patch.specialRequests === undefined ? existing.specialRequests : patch.specialRequests,
    },
    include: { property: true, client: true },
  });

  await recomputeClientTotalSpend(existing.clientId);
  return updated;
}

export async function cancelReservation(id: string, reason?: string) {
  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) throw new Error("Réservation introuvable.");
  if (existing.status === "CANCELLED") return existing;

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: reason ?? null,
    },
    include: { property: true, client: true },
  });
  await recomputeClientTotalSpend(existing.clientId);
  return updated;
}

// ──────────────────────────────────────────────────────────────────────
// Reads
// ──────────────────────────────────────────────────────────────────────

export type ListFilters = {
  status?: ReservationStatus | "ALL";
  source?: BookingSource | "ALL";
  propertyId?: string;
  query?: string;       // matches ref / client name / email
  from?: Date;          // checkIn >= from
  to?: Date;            // checkIn <= to
  take?: number;
  skip?: number;
};

export async function listReservations(filters: ListFilters = {}) {
  const where: Record<string, unknown> = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.source && filters.source !== "ALL") where.source = filters.source;
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.from || filters.to) {
    where.checkIn = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }
  if (filters.query) {
    const q = filters.query.trim();
    where.OR = [
      { reference: { contains: q } },
      { client: { firstName: { contains: q } } },
      { client: { lastName: { contains: q } } },
      { client: { email: { contains: q } } },
      { client: { phone: { contains: q } } },
      { property: { titleFr: { contains: q } } },
    ];
  }
  return prisma.reservation.findMany({
    where,
    orderBy: [{ checkIn: "desc" }],
    include: {
      property: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
      client: true,
    },
    take: filters.take ?? 100,
    skip: filters.skip ?? 0,
  });
}

export async function getReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      property: { include: { images: { orderBy: { position: "asc" } } } },
      client: true,
    },
  });
}

// Calendar window — pulls every reservation that overlaps [from, to].
export async function listReservationsInWindow(from: Date, to: Date) {
  return prisma.reservation.findMany({
    where: {
      status: { in: BLOCKING_STATUSES as unknown as string[] },
      checkIn:  { lt: to },
      checkOut: { gt: from },
    },
    include: {
      property: { select: { id: true, titleFr: true, type: true, area: true } },
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ propertyId: "asc" }, { checkIn: "asc" }],
  });
}
