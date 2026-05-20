import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { LayoutDashboard, Home, LogOut, Settings as SettingsIcon, Globe, CalendarDays, ClipboardList, FileText, Star, Building2, KeyRound, BedDouble, Sparkles, Users } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata = {
  title: "Admin · NEXTWIN",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Login page renders its own shell.
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  if (path.endsWith("/admin/login")) {
    return <>{children}</>;
  }

  const { valid } = await getCurrentSession();
  if (!valid) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white md:flex">
        <Link
          href="/admin"
          className="flex h-16 items-center gap-2 border-b border-gray-100 px-5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold text-ink">NEXTWIN</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
              Admin
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-5 p-3">
          {/* Pilotage — overview / command center */}
          <NavGroup label="Pilotage">
            <NavItem
              href="/admin"
              icon={<LayoutDashboard className="h-4 w-4" />}
              accent="navy"
            >
              Tableau de bord
            </NavItem>
          </NavGroup>

          {/* Catalogue - split per listing kind. Each section is its own
              kind-scoped admin so the editor flow, filter chips, and pricing
              column adapt to whether it's a sale, long-term rental, or
              short-stay listing. */}
          <NavGroup label="Catalogue">
            <NavItem
              href="/admin/acheter"
              icon={<Building2 className="h-4 w-4" />}
              accent="emerald"
            >
              Acheter
            </NavItem>
            <NavItem
              href="/admin/louer"
              icon={<KeyRound className="h-4 w-4" />}
              accent="amber"
            >
              Louer
            </NavItem>
            <NavItem
              href="/admin/court-sejour"
              icon={<BedDouble className="h-4 w-4" />}
              accent="sky"
            >
              Court séjour
            </NavItem>
            <NavItem
              href="/admin/featured"
              icon={<Sparkles className="h-4 w-4" />}
              accent="navy"
            >
              Sélection Accueil
            </NavItem>
          </NavGroup>

          {/* Opérations - day-to-day booking work (court séjour only) */}
          <NavGroup label="Opérations">
            <NavItem
              href="/admin/calendar"
              icon={<CalendarDays className="h-4 w-4" />}
              accent="sky"
            >
              Calendrier
            </NavItem>
            <NavItem
              href="/admin/reservations"
              icon={<ClipboardList className="h-4 w-4" />}
              accent="emerald"
            >
              Réservations
            </NavItem>
            <NavItem
              href="/admin/reviews"
              icon={<Star className="h-4 w-4" />}
              accent="amber"
            >
              Avis
            </NavItem>
          </NavGroup>

          {/* Configuration - site-wide settings */}
          <NavGroup label="Configuration">
            <NavItem
              href="/admin/pages"
              icon={<FileText className="h-4 w-4" />}
              accent="navy"
            >
              Pages
            </NavItem>
            <NavItem
              href="/admin/team"
              icon={<Users className="h-4 w-4" />}
              accent="emerald"
            >
              Équipe
            </NavItem>
            <NavItem
              href="/admin/settings"
              icon={<SettingsIcon className="h-4 w-4" />}
              accent="slate"
            >
              Paramètres
            </NavItem>
          </NavGroup>
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            href="/"
            className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:bg-gray-50 hover:text-ink"
          >
            <Globe className="h-4 w-4" />
            Voir le site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

// Per-accent classes — each section in the sidebar gets its own hue so the
// eye can scan the nav like a colour-coded index instead of a flat list.
const ACCENT_TILE: Record<string, string> = {
  navy: "bg-brand-100 text-brand-700 group-hover:bg-brand-600 group-hover:text-white",
  sky: "bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white",
  emerald: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
  amber: "bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white",
  slate: "bg-slate-100 text-slate-700 group-hover:bg-slate-600 group-hover:text-white",
};

const ACCENT_HOVER: Record<string, string> = {
  navy: "hover:bg-brand-50 hover:text-brand-700",
  sky: "hover:bg-sky-50 hover:text-sky-700",
  emerald: "hover:bg-emerald-50 hover:text-emerald-700",
  amber: "hover:bg-amber-50 hover:text-amber-700",
  slate: "hover:bg-slate-50 hover:text-slate-700",
};

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  accent = "slate",
  children,
}: {
  href: string;
  icon: React.ReactNode;
  accent?: keyof typeof ACCENT_TILE;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-muted transition ${ACCENT_HOVER[accent]}`}
    >
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${ACCENT_TILE[accent]}`}
      >
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </Link>
  );
}
