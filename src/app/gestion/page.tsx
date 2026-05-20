import { GestionContent } from "@/components/GestionContent";

export const metadata = {
  title: "Gestion locative — Nextwin Immobilier",
  description:
    "Confiez la gestion de votre bien à Marrakech à Nextwin Immobilier. Mise en ligne, sélection des voyageurs, accueil, ménage et maintenance.",
};

export default function GestionPage() {
  // Thin server wrapper - the full pitch lives in GestionContent so it
  // can read the active locale from I18nProvider on the client.
  return <GestionContent />;
}
