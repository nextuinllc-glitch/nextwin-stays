import { prisma } from "@/lib/db";
import { TeamAdmin } from "@/components/admin/TeamAdmin";

export const dynamic = "force-dynamic";

// Specialty in the DB is a plain string column (mirrors Property.listingKind);
// narrow it here to the enum the admin form expects, dropping any
// unrecognised value back to null so a typo can't break the UI.
type Specialty = "SHORT_STAY" | "RENT_LONG" | "SALE" | null;
function narrowSpecialty(s: string | null): Specialty {
  if (s === "SHORT_STAY" || s === "RENT_LONG" || s === "SALE") return s;
  return null;
}

export default async function AdminTeamPage() {
  const rows = await prisma.teamMember.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  const team = rows.map((r) => ({ ...r, specialty: narrowSpecialty(r.specialty) }));

  return (
    <div>
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Notre équipe</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ajoutez ou modifiez les membres de l&apos;équipe affichés sur la page «&nbsp;À propos&nbsp;».
          Une photo, un rôle court, une bio de 1 à 3 phrases et un WhatsApp suffisent.
        </p>
      </header>

      <div className="mt-6">
        <TeamAdmin initial={team} />
      </div>
    </div>
  );
}
