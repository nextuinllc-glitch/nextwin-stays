import Link from "next/link";
import {
  Home,
  Plus,
  Eye,
  Layers,
  CalendarDays,
  LogIn,
  LogOut as LogOutIcon,
  Clock,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { STATUS_BADGE, STATUS_LABEL_FR, type ReservationStatus } from "@/lib/reservation-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function AdminDashboard() {
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(new Date(today.getTime() + 86_400_000));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const [
    propertyCount,
    publishedCount,
    byType,
    pendingCount,
    confirmedCount,
    todayCheckIns,
    todayCheckOuts,
    monthRevenueAgg,
    monthBookingCount,
    upcomingPending,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { published: true } }),
    prisma.property.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.reservation.findMany({
      where: {
        checkIn: { gte: today, lt: tomorrow },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
      },
      include: { property: { select: { titleFr: true, area: true } }, client: true },
      orderBy: { checkIn: "asc" },
      take: 8,
    }),
    prisma.reservation.findMany({
      where: {
        checkOut: { gte: today, lt: tomorrow },
        status: { in: ["CHECKED_IN", "CONFIRMED"] },
      },
      include: { property: { select: { titleFr: true, area: true } }, client: true },
      orderBy: { checkOut: "asc" },
      take: 8,
    }),
    prisma.reservation.aggregate({
      where: {
        checkIn: { gte: monthStart, lt: monthEnd },
        status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      },
      _sum: { total: true },
    }),
    prisma.reservation.count({
      where: {
        checkIn: { gte: monthStart, lt: monthEnd },
        status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      },
    }),
    prisma.reservation.findMany({
      where: { status: "PENDING", checkIn: { gte: today } },
      include: { property: { select: { titleFr: true } }, client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const typeCounts: Record<string, number> = {};
  for (const row of byType) typeCounts[row.type] = row._count._all;

  const monthRevenue = monthRevenueAgg._sum.total ?? 0;

  return (
    <div>
      {/* Command-deck banner — full-bleed navy gradient with the page title +
          today's KPIs floating on top. Distinguishes the read-only overview
          from the white-surface editing pages. */}
      <section className="relative -mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 px-4 pb-6 pt-6 text-white shadow-lg sm:-mx-6 sm:px-6 sm:pb-8 sm:pt-8">
        {/* Subtle grid pattern for texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Subtle radial highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl"
        />

        <header className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/20 backdrop-blur">
              Pilote
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tableau de bord
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Aujourd&apos;hui{" "}
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(today)}
            </p>
          </div>
          <Link
            href="/admin/reservations/new"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            <Plus className="h-4 w-4" />
            Nouvelle réservation
          </Link>
        </header>

        {/* KPIs — semi-transparent tiles on the navy band */}
        <div className="relative mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DarkStat
            label="Revenu du mois"
            value={formatPrice(monthRevenue)}
            subtitle={`${monthBookingCount} réservations`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <DarkStat
            label="Arrivées aujourd'hui"
            value={String(todayCheckIns.length)}
            icon={<LogIn className="h-4 w-4" />}
          />
          <DarkStat
            label="Départs aujourd'hui"
            value={String(todayCheckOuts.length)}
            icon={<LogOutIcon className="h-4 w-4" />}
          />
          <DarkStat
            label="En attente"
            value={String(pendingCount)}
            subtitle={`${confirmedCount} confirmées`}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Today's lists + pending requests */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="Arrivées aujourd'hui"
          empty="Aucune arrivée prévue."
          icon={<LogIn className="h-4 w-4 text-sky-600" />}
          link={{ href: "/admin/reservations?status=CONFIRMED", label: "Voir toutes" }}
        >
          {todayCheckIns.map((r) => (
            <Item
              key={r.id}
              href={`/admin/reservations/${r.id}`}
              title={`${r.client.firstName} ${r.client.lastName}`}
              subtitle={`${r.property.titleFr} · ${r.property.area}`}
              right={`${r.guests} inv.`}
              status={r.status as ReservationStatus}
            />
          ))}
        </Panel>

        <Panel
          title="Départs aujourd'hui"
          empty="Aucun départ prévu."
          icon={<LogOutIcon className="h-4 w-4 text-amber-600" />}
          link={{ href: "/admin/reservations?status=CHECKED_IN", label: "Voir tous" }}
        >
          {todayCheckOuts.map((r) => (
            <Item
              key={r.id}
              href={`/admin/reservations/${r.id}`}
              title={`${r.client.firstName} ${r.client.lastName}`}
              subtitle={`${r.property.titleFr} · ${r.property.area}`}
              right={formatPrice(r.total)}
              status={r.status as ReservationStatus}
            />
          ))}
        </Panel>

        <Panel
          title="Demandes en attente"
          empty="Aucune demande en attente."
          icon={<Clock className="h-4 w-4 text-rose-600" />}
          link={{ href: "/admin/reservations?status=PENDING", label: "Tout voir" }}
        >
          {upcomingPending.map((r) => (
            <Item
              key={r.id}
              href={`/admin/reservations/${r.id}`}
              title={`${r.client.firstName} ${r.client.lastName}`}
              subtitle={`${r.property.titleFr}`}
              right={formatPrice(r.total)}
              status="PENDING"
            />
          ))}
        </Panel>
      </div>

      {/* Property breakdown + quick links */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">Catalogue</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat label="Propriétés" value={propertyCount} icon={<Home className="h-3.5 w-3.5" />} />
            <MiniStat label="Publiées" value={publishedCount} icon={<Eye className="h-3.5 w-3.5" />} />
            <MiniStat label="Riads" value={typeCounts.riad ?? 0} icon={<Layers className="h-3.5 w-3.5" />} />
            <MiniStat
              label="Villas + Apparts"
              value={(typeCounts.villa ?? 0) + (typeCounts.apartment ?? 0)}
              icon={<Layers className="h-3.5 w-3.5" />}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink">Actions rapides</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickLink
              href="/admin/calendar"
              icon={<CalendarDays className="h-4 w-4" />}
              title="Ouvrir le calendrier"
              body="Vue maître mensuelle, glissez sur une cellule libre pour ajouter."
            />
            <QuickLink
              href="/admin/reservations"
              icon={<ClipboardListIcon />}
              title="Toutes les réservations"
              body="Liste complète avec filtres par statut, source et propriété."
            />
            <QuickLink
              href="/admin/properties"
              icon={<Home className="h-4 w-4" />}
              title="Gérer les propriétés"
              body="Ajouter, modifier, téléverser des photos, dépublier."
            />
            <QuickLink
              href="/admin/settings"
              icon={<TrendingUp className="h-4 w-4" />}
              title="Paramètres du site"
              body="WhatsApp, contact, frais de ménage et de service."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipboardListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  );
}

const ACCENT: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  brand: "bg-brand-50 text-brand-700",
};

function Stat({
  label,
  value,
  subtitle,
  icon,
  accent = "brand",
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full", ACCENT[accent] ?? ACCENT.brand)}>
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">{value}</div>
      {subtitle && <div className="mt-0.5 text-[11px] text-ink-soft">{subtitle}</div>}
    </div>
  );
}

// KPI tile styled for the navy hero band — translucent white with white text.
function DarkStat({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">{value}</div>
      {subtitle && <div className="mt-0.5 text-[11px] text-white/60">{subtitle}</div>}
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-cream-50/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        <span className="text-brand-700">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function Panel({
  title,
  empty,
  icon,
  link,
  children,
}: {
  title: string;
  empty: string;
  icon: React.ReactNode;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const empty_ = Array.isArray(children) ? children.length === 0 : !children;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          {icon}
          {title}
        </h3>
        {link && (
          <Link href={link.href} className="text-[11px] font-semibold text-brand-700 hover:underline">
            {link.label} →
          </Link>
        )}
      </div>
      {empty_ ? (
        <p className="mt-4 text-xs italic text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-50">{children}</ul>
      )}
    </div>
  );
}

function Item({
  href,
  title,
  subtitle,
  right,
  status,
}: {
  href: string;
  title: string;
  subtitle: string;
  right: string;
  status: ReservationStatus;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 py-2.5 transition hover:bg-brand-50/30"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{title}</div>
          <div className="truncate text-[11px] text-ink-muted">{subtitle}</div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              STATUS_BADGE[status],
            )}
          >
            {STATUS_LABEL_FR[status]}
          </span>
          <span className="text-[11px] font-semibold text-ink">{right}</span>
        </div>
      </Link>
    </li>
  );
}

function QuickLink({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/40"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          {icon}
        </span>
        <span className="font-semibold text-ink group-hover:text-brand-700">{title}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{body}</p>
    </Link>
  );
}
