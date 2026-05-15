// Schema-driven field definitions for the three editable pages.
// Used by:
//   • the admin editor (renders one input per field per language)
//   • the public pages (resolves the right value at render time:
//     admin-edit → fallback to FR admin-edit → fallback to i18n
//     dictionary default)
//
// Adding a new field is one entry here + one usage on the public
// page. No migration needed — JSON.

export type Field = {
  /** Stable JSON key, never user-facing. */
  key: string;
  /** Field label in the admin form (English — admin UI only). */
  label: string;
  /** Hint shown under the input. */
  hint?: string;
  /** Single-line vs multi-line input vs image upload. Image fields are
   *  not localised — the URL is stored under the `.fr` slot only and
   *  rendered the same way on every locale. The Pages editor hides
   *  language tabs for these fields. */
  type: "text" | "textarea" | "image";
  /** Group label — fields with the same group render as a card. */
  group: string;
};

export type PageKey = "home" | "about" | "contact";

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Page d'accueil",
  about: "À propos",
  contact: "Contactez-nous",
};

export const PAGE_SCHEMAS: Record<PageKey, Field[]> = {
  home: [
    { key: "sectionEyebrow", label: "Petite ligne au-dessus du titre", hint: "Ex. \"Marrakech · Locations d'exception\"", type: "text", group: "Properties section" },
    { key: "sectionTitle", label: "Titre de la section principale", type: "text", group: "Properties section" },
    { key: "seeAllCta", label: "CTA \"Voir toutes les propriétés\"", hint: "Pilule outline sous la grille", type: "text", group: "Properties section" },
    { key: "bookingSimpleTitle", label: "Titre du bloc \"Booking made simple\"", type: "text", group: "Booking simple" },
    { key: "bookingSimpleSubtitle", label: "Sous-titre", type: "textarea", group: "Booking simple" },
    { key: "stepCuratedTitle", label: "Étape 1 — Titre", type: "text", group: "Steps" },
    { key: "stepCuratedBody", label: "Étape 1 — Description", type: "textarea", group: "Steps" },
    { key: "stepCancelTitle", label: "Étape 2 — Titre", type: "text", group: "Steps" },
    { key: "stepCancelBody", label: "Étape 2 — Description", type: "textarea", group: "Steps" },
    { key: "stepConciergeTitle", label: "Étape 3 — Titre", type: "text", group: "Steps" },
    { key: "stepConciergeBody", label: "Étape 3 — Description", type: "textarea", group: "Steps" },
  ],
  about: [
    { key: "heroEyebrow", label: "Eyebrow (petit texte au-dessus du titre)", type: "text", group: "Hero" },
    { key: "heroTitle", label: "Titre principal", type: "textarea", group: "Hero" },
    { key: "heroSubtitle", label: "Sous-titre", type: "textarea", group: "Hero" },
    { key: "heroImage", label: "Image de fond — Hero", hint: "Recommandé : 2400×1600, paysage", type: "image", group: "Hero" },
    { key: "storyTitle", label: "Titre — section histoire", type: "text", group: "Story" },
    { key: "storyP1", label: "Paragraphe 1", type: "textarea", group: "Story" },
    { key: "storyP2", label: "Paragraphe 2", type: "textarea", group: "Story" },
    { key: "storyP3", label: "Paragraphe 3", type: "textarea", group: "Story" },
    { key: "galleryImage1", label: "Galerie — Image 1 (portrait)", hint: "Vide = la cellule est masquée", type: "image", group: "Story" },
    { key: "galleryImage2", label: "Galerie — Image 2 (carré)", hint: "Vide = la cellule est masquée", type: "image", group: "Story" },
    { key: "galleryImage3", label: "Galerie — Image 3 (carré)", hint: "Vide = la cellule est masquée", type: "image", group: "Story" },
    { key: "galleryImage4", label: "Galerie — Image 4 (portrait)", hint: "Vide = la cellule est masquée", type: "image", group: "Story" },
    { key: "pillarsTitle", label: "Titre — section piliers", type: "text", group: "Pillars" },
    { key: "pillarsSubtitle", label: "Sous-titre", type: "textarea", group: "Pillars" },
    { key: "pillar1Title", label: "Pilier 1 — Titre", type: "text", group: "Pillars" },
    { key: "pillar1Body", label: "Pilier 1 — Description", type: "textarea", group: "Pillars" },
    { key: "pillar2Title", label: "Pilier 2 — Titre", type: "text", group: "Pillars" },
    { key: "pillar2Body", label: "Pilier 2 — Description", type: "textarea", group: "Pillars" },
    { key: "pillar3Title", label: "Pilier 3 — Titre", type: "text", group: "Pillars" },
    { key: "pillar3Body", label: "Pilier 3 — Description", type: "textarea", group: "Pillars" },
    { key: "pillar4Title", label: "Pilier 4 — Titre", type: "text", group: "Pillars" },
    { key: "pillar4Body", label: "Pilier 4 — Description", type: "textarea", group: "Pillars" },
    { key: "seeStaysCta", label: "CTA bas de page", type: "text", group: "CTA" },
  ],
  contact: [
    { key: "title", label: "Titre principal", type: "text", group: "Header" },
    { key: "subtitle", label: "Sous-titre", type: "textarea", group: "Header" },
    { key: "whatsapp", label: "WhatsApp — libellé", type: "text", group: "Cards" },
    { key: "whatsappCta", label: "WhatsApp — CTA", type: "text", group: "Cards" },
    { key: "email", label: "Email — libellé", type: "text", group: "Cards" },
    { key: "emailCta", label: "Email — CTA", type: "text", group: "Cards" },
    { key: "phone", label: "Téléphone — libellé", type: "text", group: "Cards" },
    { key: "phoneCta", label: "Téléphone — CTA", type: "text", group: "Cards" },
    { key: "office", label: "Bureau — libellé", type: "text", group: "Cards" },
    { key: "officeAddress", label: "Bureau — adresse", type: "text", group: "Cards" },
    { key: "officeCta", label: "Bureau — CTA", type: "text", group: "Cards" },
    { key: "replyTime", label: "Pill \"Délai de réponse\"", type: "text", group: "Header" },
    { key: "formTitle", label: "Formulaire — titre", type: "text", group: "Form" },
    { key: "formSubtitle", label: "Formulaire — sous-titre", type: "text", group: "Form" },
    { key: "firstName", label: "Champ — Prénom", type: "text", group: "Form" },
    { key: "lastName", label: "Champ — Nom", type: "text", group: "Form" },
    { key: "emailLabel", label: "Champ — Email", type: "text", group: "Form" },
    { key: "topic", label: "Champ — Sujet", type: "text", group: "Form" },
    { key: "topicEnquiry", label: "Sujet — Option 1", type: "text", group: "Form" },
    { key: "topicSpecial", label: "Sujet — Option 2", type: "text", group: "Form" },
    { key: "topicElse", label: "Sujet — Option 3", type: "text", group: "Form" },
    { key: "messageLabel", label: "Champ — Message", type: "text", group: "Form" },
    { key: "messagePlaceholder", label: "Placeholder du message", type: "text", group: "Form" },
    { key: "sendBtn", label: "Bouton Envoyer", type: "text", group: "Form" },
    { key: "privacyNote", label: "Note de confidentialité", type: "textarea", group: "Form" },
  ],
};

// Localised value bundle stored in the DB.
export type LocalizedValue = { fr?: string; en?: string; ar?: string };

// JSON shape for one page's contentJson column: { fieldKey: { fr, en, ar }, ... }
export type PageContentMap = Record<string, LocalizedValue>;

// Resolves a field for the active locale, with FR fallback then a
// dictionary default. Used by the public pages so admin edits override
// the i18n strings transparently.
export function pickField(
  content: PageContentMap | null | undefined,
  fieldKey: string,
  locale: "fr" | "en" | "ar",
  fallback: string,
): string {
  const bundle = content?.[fieldKey];
  if (!bundle) return fallback;
  const direct = bundle[locale];
  if (direct && direct.trim()) return direct;
  // FR fallback — admins typically fill FR first.
  if (bundle.fr && bundle.fr.trim()) return bundle.fr;
  return fallback;
}

// Resolves an image-type field. Images aren't localised — the URL
// lives under `.fr` regardless of the active language. Returns null
// (not the fallback) when the admin has explicitly cleared the slot,
// so callers can hide the cell instead of falling back to a stale
// stock photo.
export function pickImage(
  content: PageContentMap | null | undefined,
  fieldKey: string,
  fallback?: string | null,
): string | null {
  const bundle = content?.[fieldKey];
  if (!bundle) return fallback ?? null;
  // Explicit empty string = admin cleared it → hide. Same convention
  // as the hero subtitle.
  if (bundle.fr === "") return null;
  const url = bundle.fr;
  return url && url.trim() ? url : (fallback ?? null);
}
