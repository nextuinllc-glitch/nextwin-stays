"use client";

import {
  Home,
  Maximize,
  Layers,
  Calendar,
  Hammer,
  Sparkles,
  Compass,
  Sofa,
  Car,
  Mountain,
  FileCheck,
  CalendarClock,
} from "lucide-react";
import type { Property } from "@/lib/properties";

type Props = {
  property: Property;
};

/**
 * Structured "facts" grid on the property detail page. Adapts to the
 * property TYPE (apartment shows étage, terrain shows landStatus, etc.)
 * so each category surfaces exactly the fields a Moroccan buyer/renter
 * expects to see at a glance (modelled on Avito + Mubawab conventions).
 *
 * SHORT_STAY listings already surface capacity (guests + bedrooms +
 * bathrooms) in the title meta row and rely on the booking calendar,
 * not on real-estate facts. The Caractéristiques block is only useful
 * for SALE + RENT_LONG, so we early-return for short-stay listings.
 */
export function PropertySpecs({ property }: Props) {
  const kind = property.listingKind ?? "SHORT_STAY";
  if (kind === "SHORT_STAY") return null;

  // Each spec is a label + value + optional icon. The order is editorial,
  // not alphabetical: most-glanced facts first.
  const specs: Array<{ icon: React.ReactNode; label: string; value: string | number }> = [];

  // Always-relevant when present
  if (property.surfaceM2) {
    specs.push({
      icon: <Maximize className="h-4 w-4" />,
      label: "Surface habitable",
      value: `${property.surfaceM2} m²`,
    });
  }
  if (property.landSurfaceM2) {
    specs.push({
      icon: <Mountain className="h-4 w-4" />,
      label: "Surface terrain",
      value: `${property.landSurfaceM2.toLocaleString("fr-FR")} m²`,
    });
  }

  // Apartments / bureaux / magasins use floor; villas + riads have stories.
  if (property.floor != null) {
    const floorLabel =
      property.totalFloors != null && property.totalFloors > 0
        ? `${property.floor}${getOrdinalSuffix(property.floor)} sur ${property.totalFloors}`
        : property.floor === 0
          ? "Rez-de-chaussée"
          : `${property.floor}${getOrdinalSuffix(property.floor)} étage`;
    specs.push({
      icon: <Layers className="h-4 w-4" />,
      label: "Étage",
      value: floorLabel,
    });
  }

  // Capacity row for residential types only
  const residentialTypes = ["villa", "riad", "apartment"];
  if (residentialTypes.includes(property.type)) {
    if (property.bedrooms > 0) {
      specs.push({
        icon: <Home className="h-4 w-4" />,
        label: "Chambres",
        value: property.bedrooms,
      });
    }
    if (property.salons) {
      specs.push({
        icon: <Sofa className="h-4 w-4" />,
        label: "Salons",
        value: property.salons,
      });
    }
  }

  if (property.apartmentSubtype && property.type === "apartment") {
    specs.push({
      icon: <Home className="h-4 w-4" />,
      label: "Type",
      value: property.apartmentSubtype,
    });
  }

  if (property.condition) {
    specs.push({
      icon: <Sparkles className="h-4 w-4" />,
      label: "État",
      value: property.condition,
    });
  }
  if (property.standing) {
    specs.push({
      icon: <Sparkles className="h-4 w-4" />,
      label: "Standing",
      value: property.standing,
    });
  }
  if (property.yearBuilt) {
    specs.push({
      icon: <Calendar className="h-4 w-4" />,
      label: "Année",
      value: property.yearBuilt,
    });
  }
  if (property.furnished != null) {
    specs.push({
      icon: <Sofa className="h-4 w-4" />,
      label: "Meublé",
      value: property.furnished ? "Oui" : "Non",
    });
  }
  if (property.parkingSpaces != null && property.parkingSpaces > 0) {
    specs.push({
      icon: <Car className="h-4 w-4" />,
      label: "Parking",
      value: `${property.parkingSpaces} place${property.parkingSpaces > 1 ? "s" : ""}`,
    });
  }
  if (property.orientation) {
    specs.push({
      icon: <Compass className="h-4 w-4" />,
      label: "Orientation",
      value: property.orientation,
    });
  }

  // Terrain-specific
  if (property.type === "terrain") {
    if (property.landStatus) {
      specs.push({
        icon: <FileCheck className="h-4 w-4" />,
        label: "Titre",
        value: property.landStatus,
      });
    }
    if (property.landZoning) {
      specs.push({
        icon: <FileCheck className="h-4 w-4" />,
        label: "Zonage",
        value: property.landZoning,
      });
    }
  }

  // Bureau / magasin: ceiling height
  if (
    (property.type === "bureau" || property.type === "magasin") &&
    property.ceilingHeight != null
  ) {
    specs.push({
      icon: <Hammer className="h-4 w-4" />,
      label: "Hauteur sous plafond",
      value: `${property.ceilingHeight} m`,
    });
  }

  // Long-term rental specifics
  if (property.listingKind === "RENT_LONG") {
    if (property.securityDeposit != null && property.securityDeposit > 0) {
      specs.push({
        icon: <Hammer className="h-4 w-4" />,
        label: "Caution",
        value: `${property.securityDeposit} mois`,
      });
    }
    if (property.monthlyCharges != null && property.monthlyCharges > 0) {
      const currency = property.currency ?? "EUR";
      specs.push({
        icon: <Hammer className="h-4 w-4" />,
        label: "Charges",
        value: `${property.monthlyCharges.toLocaleString("fr-FR")} ${currency} / mois`,
      });
    }
  }

  if (property.availability) {
    specs.push({
      icon: <CalendarClock className="h-4 w-4" />,
      label: "Disponibilité",
      value: property.availability,
    });
  }

  if (specs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-cream-50/60 p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
        Caractéristiques
      </h2>
      <span aria-hidden className="mt-3 block h-px w-12 bg-brand-500/40" />
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
        {specs.map((s) => (
          <div key={s.label} className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              {s.icon}
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                {s.label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{s.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getOrdinalSuffix(n: number) {
  if (n === 1) return "er";
  return "ème";
}
