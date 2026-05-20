export type Locale = "fr" | "en" | "ar";

export const LOCALES: Locale[] = ["fr", "en", "ar"];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABEL: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const RTL_LOCALES: Locale[] = ["ar"];

// Single shape - keys identical across all three locales so the type system
// catches missing translations.
type Dict = {
  nav: {
    home: string;
    properties: string;
    buy: string;       // Acheter
    rentLong: string;  // Louer (long term)
    shortStay: string; // Court séjour
    about: string;
    contact: string;
    bookCta: string;
    toggleMenu: string;
  };
  listingKind: {
    sale: string;       // SALE      label
    rentLong: string;   // RENT_LONG label
    shortStay: string;  // SHORT_STAY label
  };
  pricing: {
    perNight: string;       // "par nuit"
    perMonth: string;       // "par mois"
    fromShort: string;      // "À partir de"
    forSale: string;        // "À la vente"
    onRequest: string;      // "Sur demande"
    inquireCta: string;     // "Demander des informations"
    inquireShort: string;   // "Demander"
  };
  logo: { tagline: string };
  hero: { subtitle: string };
  search: {
    arrival: string;
    departure: string;
    guests: string;
    pickDate: string;
    addDates: string;
    search: string;
    guestSingular: string;
    guestPlural: string;
    adultsChildren: string;
    decreaseGuests: string;
    increaseGuests: string;
    selectDatesTitle: string;
    selectDatesHint: string;
    minNightsHint: string;
    clearDates: string;
    apply: string;
    close: string;
    prevMonth: string;
    nextMonth: string;
  };
  weekdays: string[]; // 7 entries Sun→Sat
  home: {
    sectionEyebrow: string;
    sectionTitle: string;
    approachEyebrow: string;       // small caps label above the conversion section
    approachCta: string;           // bottom CTA: "Confier votre projet"
    bookingSimpleTitle: string;
    bookingSimpleSubtitle: string;
    stepCuratedTitle: string;
    stepCuratedBody: string;
    stepCancelTitle: string;
    stepCancelBody: string;
    stepConciergeTitle: string;
    stepConciergeBody: string;
    closerTitle: string;
    closerBody: string;
    closerCta: string;
  };
  listings: {
    title: string;
    viewMap: string;
    noResults: string;
    noResultsHint: string;
    all: string;
  };
  type: {
    villa: string;
    apartment: string;
    riad: string;
    terrain: string;     // land / building plot
    bureau: string;      // office, also covers plateau de bureaux
    magasin: string;     // shop / retail unit
    commercial: string;  // legacy catch-all for old rows
  };
  card: {
    guests: string;
    bedrooms: string;
    bathrooms: string;
  };
  amenity: {
    heating: string;
    balcony: string;
    tv: string;
    linens: string;
    security: string;
    chimney: string;
    languages: string;
    pool: string;
    kitchen: string;
    ac: string;
    wifi: string;
    parking: string;
    hammam: string;
    breakfast: string;
    workspace: string;
    garden: string;
    terrace: string;
    washer: string;
    concierge: string;
    tennis: string;
    bbq: string;
    housekeeping: string;
    elevator: string;
    chef: string;
    selfCheckIn: string;
  };
  footer: {
    blurb: string;
    // "Explorer" column — links to the three catalogue routes plus the
    // owner-side gestion page, mirroring the global real-estate scope
    // (Court séjour / Long durée / Achat / Gestion) instead of the old
    // stay-type breakdown (Riads / Villas / Appartements).
    explore: string;
    shortStay: string;
    rentLong: string;
    buy: string;
    gestion: string;
    reach: string;
    // "Société" column — pointers into the brand-side pages.
    company: string;
    about: string;
    team: string;
    contact: string;
    rights: string;
    terms: string;
    privacy: string;
    cookies: string;
  };
  language: {
    label: string;
  };
  // Home page "choose your lane" portal - three saturated columns right
  // under the hero. Per-lane copy: title (display headline), body (short
  // pitch), cta (pill label). Eyebrow comes from `nav.*` so the lane
  // label stays in sync with the navbar.
  portal: {
    ariaLabel: string;
    shortStayTitle: string;
    shortStayBody: string;
    shortStayCta: string;
    rentLongTitle: string;
    rentLongBody: string;
    rentLongCta: string;
    buyTitle: string;
    buyBody: string;
    buyCta: string;
  };
  // Dark editorial band on the home page that pivots to owners.
  ownerCallout: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
  };
  // Public team section on /about + small home page sign-off.
  team: {
    eyebrow: string;
    title: string;
    subtitle: string;
    whatsapp: string;
    email: string;
    phone: string;
    portraitAlt: string; // "Portrait of {{name}}" — uses {{name}} placeholder
    signoffSuffix: string;
  };
  // "Bientôt disponible" overlay text shown on top of the cream
  // placeholder image while SALE and RENT_LONG catalogues aren't ready
  // yet. Three lines: a small tracked eyebrow (brand context), a
  // display headline, and a one-line caption inviting contact.
  comingSoon: {
    eyebrow: string;
    title: string;
    caption: string;
  };
  // Full /gestion page (hero + benefits + how-it-works + lead form).
  gestion: {
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    heroCta: string;
    serviceEyebrow: string;
    serviceTitle: string;
    serviceSubtitle: string;
    benefit1Title: string;
    benefit1Body: string;
    benefit2Title: string;
    benefit2Body: string;
    benefit3Title: string;
    benefit3Body: string;
    benefit4Title: string;
    benefit4Body: string;
    howEyebrow: string;
    howTitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    formEyebrow: string;
    formTitle: string;
    formSubtitle: string;
    formPropertySection: string;
    formContactSection: string;
    formTypeLabel: string;
    formAreaLabel: string;
    formBedroomsLabel: string;
    formServiceLabel: string;
    formListedLabel: string;
    formListedPlaceholder: string;
    formNotesLabel: string;
    formNotesPlaceholder: string;
    formNameLabel: string;
    formNamePlaceholder: string;
    formEmailLabel: string;
    formEmailPlaceholder: string;
    formPhoneLabel: string;
    formPhonePlaceholder: string;
    formNameRequired: string;
    formContactRequired: string;
    formError: string;
    formNetworkError: string;
    formSubmit: string;
    formSubmitting: string;
    formSuccessTitle: string;
    formSuccessBody: string;
    serviceShort: string;
    serviceLong: string;
    serviceBoth: string;
    serviceAdvice: string;
    typeRiad: string;
    typeVilla: string;
    typeApartment: string;
    typeTerrain: string;
    typeBureau: string;
    typeMagasin: string;
    typeOther: string;
  };
  detail: {
    back: string;
    share: string;
    save: string;
    viewAllPhotos: string; // "Voir les {n} photos" - replace {n}
    aboutTitle: string;
    aboutModalTitle: string;        // longer form for the full-screen modal
    amenitiesTitle: string;
    amenitiesModalTitle: string;    // longer form for the full-screen modal
    amenityCategories: {
      bathroom: string;
      bedroom: string;
      entertainment: string;
      heatingCooling: string;
      internet: string;
      kitchen: string;
      outdoor: string;
      parking: string;
      services: string;
      other: string;
    };
    showAllAmenities: string; // "Voir les {n} équipements"
    showLess: string;
    rulesTitle: string;
    ruleCheckIn: string;
    ruleCheckInValue: string;
    ruleCheckOut: string;
    ruleCheckOutValue: string;
    ruleMinStay: string;
    ruleMinStayValue: string;
    ruleCancellation: string;
    ruleCancellationValue: string;
    rulePets: string;
    rulePetsValue: string;
    ruleSmoking: string;
    ruleSmokingValue: string;
    hostedBy: string; // "Hébergé par {name}" - kept for legacy callers
    hostingYears: string; // legacy
    identityVerified: string;
    speaksLanguages: string;
    messageHost: string; // legacy
    managedByNextwin: string; // "Géré par l'équipe NEXTWIN · réponse en moins d'une heure"
    contactTeam: string; // "Contacter l'équipe"
    upToGuests: string; // "Jusqu'à {n} invités"
  };
  booking: {
    perNight: string;
    addDate: string;
    reserve: string;
    reserveNow: string;
    selectDates: string;
    selectDatesPill: string; // mobile sheet pill - "Sélectionnez Les Dates"
    addDatesForPrice: string; // collapsed bar - "Ajouter des dates pour les prix"
    viewAvailability: string; // collapsed bar CTA - "Voir les disponibilités"
    sheetIntro: string; // sheet subtitle - "Sélectionnez les dates et le nombre…"
    sendRequest: string; // outlined CTA - "Envoyer une demande"
    requestPrefill: string; // WhatsApp prefill template
    noChargeYet: string;
    cleaningFee: string;
    serviceFee: string;
    total: string;
    freeCancellation: string;
    nightSingular: string;
    nightPlural: string;
    selectDatesHint: string;
    minNightsHint: string;
  };
  reviews: {
    showAll: string; // "Voir tous les {n} avis"
    reviewsLabel: string; // "avis" / "reviews" - used in title
    guestFavourite: string;
    guestFavouriteDescription: string;
    overallRating: string;
    leaveReviewCta: string;
    pendingBadge: string;
    showMore: string;
    showLess: string;
    categories: {
      cleanliness: string;
      accuracy: string;
      checkin: string;
      communication: string;
      location: string;
      value: string;
    };
    form: {
      title: string;
      subtitle: string;
      firstName: string;
      city: string;
      reviewLabel: string;
      reviewPlaceholder: string;
      remainingChars: string; // "Au moins 20 caractères - {n} restants"
      submit: string;
      submitting: string;
      cancel: string;
      submittedNote: string;
      errorMissingConfig: string;
      errorGeneric: string;
      stayKindRecent: string;
    };
  };
  availability: {
    title: string;
    legendAvailable: string;
    legendBooked: string;
    legendPast: string;
  };
  map: {
    title: string;             // section heading - "Où se situe le logement"
    privacyHint: string;       // "Zone approximative (~{n} m)"
    noLocation: string;
    gettingAroundTitle: string; // modal subsection - "Se déplacer" / "Getting around"
    showMore: string;
    showLess: string;
  };
  rules: {
    sectionTitle: string;
    showMore: string;
    showLess: string;
    additional: string;
  };
  contact: {
    title: string;
    subtitle: string;
    whatsapp: string;
    whatsappCta: string;
    email: string;
    emailCta: string;
    phone: string;
    phoneCta: string;
    office: string;
    officeAddress: string;
    officeCta: string;
    replyTime: string;
    formTitle: string;
    formSubtitle: string;
    firstName: string;
    lastName: string;
    emailLabel: string;
    topic: string;
    topicEnquiry: string;
    topicSpecial: string;
    topicElse: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendBtn: string;
    privacyNote: string;
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyP1: string;
    storyP2: string;
    storyP3: string;
    pillarsTitle: string;
    pillarsSubtitle: string;
    pillar1Title: string;
    pillar1Body: string;
    pillar2Title: string;
    pillar2Body: string;
    pillar3Title: string;
    pillar3Body: string;
    pillar4Title: string;
    pillar4Body: string;
    seeStaysCta: string;
  };
};

export const dictionaries: Record<Locale, Dict> = {
  fr: {
    nav: {
      home: "Accueil",
      properties: "Nos propriétés",
      buy: "Achat",
      rentLong: "Long durée",
      shortStay: "Court séjour",
      about: "À propos",
      contact: "Contactez-nous",
      bookCta: "Voir les biens",
      toggleMenu: "Ouvrir le menu",
    },
    listingKind: {
      sale: "À la vente",
      rentLong: "Location longue durée",
      shortStay: "Court séjour",
    },
    pricing: {
      perNight: "par nuit",
      perMonth: "par mois",
      fromShort: "À partir de",
      forSale: "À la vente",
      onRequest: "Sur demande",
      inquireCta: "Demander des informations",
      inquireShort: "Demander",
    },
    logo: { tagline: "Immobilier" },
    hero: {
      subtitle: "Acheter, louer, séjourner à Marrakech.",
    },
    search: {
      arrival: "Arrivée",
      departure: "Départ",
      guests: "Invités",
      pickDate: "Choisir une date",
      addDates: "Ajouter des dates",
      search: "Rechercher",
      guestSingular: "invité",
      guestPlural: "invités",
      adultsChildren: "Adultes et enfants",
      decreaseGuests: "Diminuer le nombre d'invités",
      increaseGuests: "Augmenter le nombre d'invités",
      selectDatesTitle: "Sélectionnez les dates",
      selectDatesHint: "Sélectionnez les dates d'arrivée et de départ",
      minNightsHint: "Durée minimale du séjour : {n} nuits",
      clearDates: "Effacer les dates",
      apply: "Appliquer",
      close: "Fermer",
      prevMonth: "Mois précédent",
      nextMonth: "Mois suivant",
    },
    weekdays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    home: {
      sectionEyebrow: "Marrakech · Biens d'exception",
      sectionTitle: "Trouvez votre prochain bien.",
      approachEyebrow: "Notre approche",
      approachCta: "Confier votre projet",
      bookingSimpleTitle: "L'immobilier sans détour",
      bookingSimpleSubtitle:
        "Un seul interlocuteur, trois métiers : achat, location longue durée, court séjour.",
      stepCuratedTitle: "Sélection rigoureuse",
      stepCuratedBody:
        "Chaque bien est visité et approuvé avant publication. Aucune surprise.",
      stepCancelTitle: "Visites accompagnées",
      stepCancelBody:
        "Un conseiller vous fait visiter les biens qui correspondent vraiment à votre projet, pas une liste générique.",
      stepConciergeTitle: "Suivi personnalisé",
      stepConciergeBody:
        "Un vrai local sur WhatsApp, de la première visite à la signature, puis longtemps après.",
      closerTitle: "Marrakech, à chaque étape de votre projet",
      closerBody:
        "Acheter votre future maison, louer pour une année, ou simplement séjourner quelques nuits : Nextwin reste votre interlocuteur unique. Riads dans la Médina, villas en Palmeraie, appartements à Guéliz, un seul carnet d'adresses.",
      closerCta: "Voir tous nos biens",
    },
    listings: {
      title: "Propriétés",
      viewMap: "Voir sur la carte",
      noResults: "Aucun résultat pour le moment",
      noResultsHint: "Essayez d'élargir vos dates ou de retirer le filtre de type.",
      all: "Tous",
    },
    type: {
      villa: "Villa",
      apartment: "Appartement",
      riad: "Riad",
      terrain: "Terrain",
      bureau: "Bureau",
      magasin: "Magasin",
      commercial: "Commercial",
    },
    card: {
      guests: "invités",
      bedrooms: "chambres",
      bathrooms: "salles de bains",
    },
    amenity: {
      pool: "Piscine",
      kitchen: "Cuisine équipée",
      ac: "Climatisation",
      wifi: "Wi-Fi rapide",
      parking: "Parking privé",
      hammam: "Hammam",
      breakfast: "Petit-déjeuner",
      workspace: "Bureau",
      garden: "Jardin",
      terrace: "Terrasse",
      washer: "Lave-linge",
      concierge: "Conciergerie",
      tennis: "Tennis",
      bbq: "Barbecue",
      housekeeping: "Ménage quotidien",
      elevator: "Ascenseur",
      chef: "Chef sur demande",
      selfCheckIn: "Arrivée autonome",
      heating: "Chauffage",
      balcony: "Balcon",
      tv: "Télévision écran plat",
      linens: "Linge de lit & serviettes premium",
      security: "Résidence sécurisée 24/7",
      chimney: "Cheminée",
      languages: "Langues : FR · AR · EN",
    },
    footer: {
      blurb:
        "Acheter, louer ou séjourner à Marrakech. Un interlocuteur local pour vos projets immobiliers, du court séjour à l'investissement long terme.",
      explore: "Nos offres",
      shortStay: "Court séjour",
      rentLong: "Long durée",
      buy: "Achat",
      gestion: "Gestion locative",
      reach: "Nous joindre",
      company: "Société",
      about: "À propos",
      team: "Notre équipe",
      contact: "Nous contacter",
      rights: "Tous droits réservés",
      terms: "Conditions",
      privacy: "Confidentialité",
      cookies: "Cookies",
    },
    language: { label: "Langue" },
    comingSoon: {
      eyebrow: "NEXTWIN · MARRAKECH",
      title: "Bientôt disponible",
      caption: "Cette annonce sera publiée sous peu. Contactez-nous pour un avant-goût exclusif.",
    },
    portal: {
      ariaLabel: "Choisissez votre catégorie",
      shortStayTitle: "Réservez votre séjour",
      shortStayBody:
        "Riads, villas et appartements à la nuit. Sélection rigoureuse, accueil sur mesure.",
      shortStayCta: "Voir les séjours",
      rentLongTitle: "Trouvez votre location",
      rentLongBody:
        "Meublé ou non meublé, plusieurs mois à Marrakech. Accompagnement de A à Z.",
      rentLongCta: "Voir les locations",
      buyTitle: "Achetez votre bien",
      buyBody:
        "Villas, riads, appartements et terrains. Conseil neutre et négociation au prix juste.",
      buyCta: "Explorer le catalogue",
    },
    ownerCallout: {
      eyebrow: "Vous êtes propriétaire",
      title: "Confiez-nous votre bien.",
      body:
        "Mise en ligne, sélection des voyageurs, accueil, ménage et maintenance. Vous gardez la propriété, nous gérons tout le reste.",
      cta: "En savoir plus",
    },
    team: {
      eyebrow: "Notre équipe",
      title: "Trois interlocuteurs, un seul standard.",
      subtitle:
        "Nous gérons chaque dossier à trois mains. Vous parlez à la personne en charge, pas à un standard.",
      whatsapp: "WhatsApp",
      email: "Email",
      phone: "Appeler",
      portraitAlt: "Portrait de {{name}}",
      signoffSuffix: "vos conseillers à Marrakech",
    },
    gestion: {
      heroEyebrow: "Gestion locative",
      heroTitle: "Confiez-nous votre bien, gardez la tranquillité.",
      heroBody:
        "Vous êtes propriétaire à Marrakech. Nous nous occupons de la mise en ligne, de la sélection des voyageurs, de l'accueil, du ménage et de la maintenance. Vous suivez vos revenus, nous gérons le reste.",
      heroCta: "Confier mon bien",
      serviceEyebrow: "Notre service",
      serviceTitle: "Une gestion clé en main.",
      serviceSubtitle:
        "Quatre piliers pour transformer un bien à Marrakech en revenu locatif sans effort de votre côté.",
      benefit1Title: "Mise en ligne premium",
      benefit1Body:
        "Photos pro, copy soignée, annonces Airbnb / Booking et réseaux sociaux gérées par notre équipe marketing.",
      benefit2Title: "Voyageurs sélectionnés",
      benefit2Body:
        "Vérification des profils, dépôt de garantie, règles maison. Vous gardez la main sur qui dort chez vous.",
      benefit3Title: "Accueil et calendrier",
      benefit3Body:
        "Check-in personnalisé, support 7j/7 en français, anglais et arabe, calendrier synchronisé sur toutes les plateformes.",
      benefit4Title: "Ménage et maintenance",
      benefit4Body:
        "Équipe de ménage dédiée entre chaque séjour, intervention rapide en cas de problème, linge et consommables fournis.",
      howEyebrow: "Comment ça marche",
      howTitle: "Trois étapes, et nous prenons le relai.",
      step1Title: "Visite & estimation",
      step1Body:
        "Nous visitons votre bien, conseillons les ajustements à fort impact et estimons le revenu locatif réaliste.",
      step2Title: "Contrat & mise en ligne",
      step2Body:
        "Signature du mandat, shooting photo, rédaction des annonces et publication sur les plateformes pertinentes.",
      step3Title: "Gestion quotidienne",
      step3Body:
        "Vous recevez un rapport mensuel clair. Nous gérons tout le reste, de la réservation au paiement.",
      formEyebrow: "Démarrer",
      formTitle: "Parlons de votre bien.",
      formSubtitle:
        "Quelques détails sur votre propriété et nous vous rappelons sous 24h pour une visite estimative gratuite.",
      formPropertySection: "Votre bien",
      formContactSection: "Pour vous recontacter",
      formTypeLabel: "Type de bien",
      formAreaLabel: "Quartier",
      formBedroomsLabel: "Chambres (optionnel)",
      formServiceLabel: "Service souhaité",
      formListedLabel: "Annonces existantes (Airbnb, Booking…)",
      formListedPlaceholder: "Lien Airbnb, Booking ou nom de l'annonce (si applicable)",
      formNotesLabel: "Précisions (optionnel)",
      formNotesPlaceholder:
        "Tarif souhaité, disponibilités, contraintes particulières…",
      formNameLabel: "Nom complet",
      formNamePlaceholder: "Prénom Nom",
      formEmailLabel: "Email",
      formEmailPlaceholder: "vous@exemple.com",
      formPhoneLabel: "Téléphone",
      formPhonePlaceholder: "+212 6 …",
      formNameRequired: "Votre nom est requis.",
      formContactRequired: "Email ou téléphone requis pour vous recontacter.",
      formError: "Envoi impossible. Réessayez.",
      formNetworkError: "Erreur réseau. Réessayez.",
      formSubmit: "Envoyer ma demande",
      formSubmitting: "Envoi…",
      formSuccessTitle: "Merci, votre demande est bien reçue.",
      formSuccessBody:
        "Un membre de l'équipe vous rappelle sous 24h pour échanger sur la gestion de votre bien.",
      serviceShort: "Court séjour (Airbnb, Booking)",
      serviceLong: "Location longue durée",
      serviceBoth: "Les deux",
      serviceAdvice: "Je découvre",
      typeRiad: "Riad",
      typeVilla: "Villa",
      typeApartment: "Appartement",
      typeTerrain: "Terrain",
      typeBureau: "Bureau",
      typeMagasin: "Magasin",
      typeOther: "Autre",
    },
    detail: {
      back: "Retour aux propriétés",
      share: "Partager",
      save: "Enregistrer",
      viewAllPhotos: "Voir les {n} photos",
      aboutTitle: "À propos de cet endroit",
      aboutModalTitle: "À propos de ce logement",
      amenitiesTitle: "Ce que cet endroit offre",
      amenitiesModalTitle: "Ce que propose ce logement",
      amenityCategories: {
        bathroom: "Salle de bain",
        bedroom: "Chambre et linge",
        entertainment: "Divertissement",
        heatingCooling: "Chauffage et climatisation",
        internet: "Internet et bureau",
        kitchen: "Cuisine et salle à manger",
        outdoor: "Caractéristiques de l'extérieur",
        parking: "Stationnement",
        services: "Services",
        other: "Autres",
      },
      showAllAmenities: "Voir les {n} équipements",
      showLess: "Voir moins",
      rulesTitle: "Règlement intérieur",
      ruleCheckIn: "Arrivée",
      ruleCheckInValue: "À partir de 15h00",
      ruleCheckOut: "Départ",
      ruleCheckOutValue: "Avant 11h00",
      ruleMinStay: "Séjour minimum",
      ruleMinStayValue: "2 nuits",
      ruleCancellation: "Annulation",
      ruleCancellationValue: "Gratuite jusqu'à 7 jours avant",
      rulePets: "Animaux",
      rulePetsValue: "Sur demande",
      ruleSmoking: "Tabac",
      ruleSmokingValue: "À l'extérieur uniquement",
      hostedBy: "Hébergé par {name}",
      hostingYears: "{n} ans d'hébergement · répond en moins d'une heure",
      identityVerified: "Identité vérifiée",
      speaksLanguages: "Parle anglais, français, العربية",
      messageHost: "Contacter l'hôte",
      managedByNextwin: "Géré par l'équipe NEXTWIN · réponse en moins d'une heure",
      contactTeam: "Contacter l'équipe",
      upToGuests: "Jusqu'à {n} invités",
    },
    booking: {
      perNight: "/ nuit",
      addDate: "Ajouter une date",
      reserve: "Réserver",
      reserveNow: "Réserver maintenant",
      selectDates: "Sélectionnez vos dates",
      selectDatesPill: "Sélectionnez Les Dates",
      addDatesForPrice: "Ajouter des dates pour les prix",
      viewAvailability: "Voir les disponibilités",
      sheetIntro:
        "Sélectionnez les dates et le nombre de personnes pour voir le prix total par nuit",
      sendRequest: "Envoyer une demande",
      requestPrefill:
        "Bonjour NEXTWIN,\n\nJe souhaite réserver :\n\n🏡 {property}\n📅 Du {from} au {to} ({nights} {nightLabel})\n👥 {guests} personnes\n\n💶 Tarif : {pricePerNight}/nuit\n💰 Total : {total}\n\nMerci de me confirmer la disponibilité.",
      noChargeYet: "Aucun débit pour le moment - confirmation instantanée par email.",
      cleaningFee: "Frais de ménage",
      serviceFee: "Frais de service",
      total: "Total",
      freeCancellation: "Annulation gratuite jusqu'à 7 jours avant l'arrivée.",
      nightSingular: "nuit",
      nightPlural: "nuits",
      selectDatesHint: "Sélectionnez vos dates",
      minNightsHint: "Séjour minimum : {n} nuits",
    },
    reviews: {
      showAll: "Voir les {n} avis",
      reviewsLabel: "avis",
      guestFavourite: "Logement préféré",
      guestFavouriteDescription:
        "Ce logement est un coup de cœur des voyageurs, fondé sur les notes, les commentaires et la fiabilité.",
      overallRating: "Note globale",
      leaveReviewCta: "Laisser un avis",
      pendingBadge: "En attente de validation",
      showMore: "Lire la suite",
      showLess: "Réduire",
      categories: {
        cleanliness: "Propreté",
        accuracy: "Exactitude",
        checkin: "Arrivée",
        communication: "Communication",
        location: "Emplacement",
        value: "Rapport qualité-prix",
      },
      form: {
        title: "Notez votre séjour",
        subtitle:
          "Vos notes par catégorie aident les futurs voyageurs à choisir. La note globale est la moyenne de vos sélections.",
        firstName: "Votre prénom",
        city: "Ville (facultatif)",
        reviewLabel: "Votre avis",
        reviewPlaceholder:
          "Qu'avez-vous aimé ? Qu'est-ce qui pourrait être amélioré ?",
        remainingChars: "Au moins 20 caractères - {n} restants",
        submit: "Envoyer mon avis",
        submitting: "Envoi…",
        cancel: "Annuler",
        submittedNote:
          "Votre avis sera ajouté à la sélection publique après vérification par la conciergerie. Il restera visible pour vous en attendant.",
        errorMissingConfig:
          "Configuration manquante côté serveur. Réessayez plus tard.",
        errorGeneric:
          "Impossible d'envoyer votre avis. Vérifiez votre connexion et réessayez.",
        stayKindRecent: "Séjour récent",
      },
    },
    availability: {
      title: "Jours disponibles",
      legendAvailable: "Disponible",
      legendBooked: "Réservé",
      legendPast: "Passé",
    },
    map: {
      title: "Où se situe le logement",
      privacyHint: "Zone approximative (~{n} m)",
      noLocation: "Adresse exacte communiquée après confirmation.",
      gettingAroundTitle: "Se déplacer",
      showMore: "Lire la suite",
      showLess: "Réduire",
    },
    rules: {
      sectionTitle: "Bon à savoir",
      showMore: "Afficher plus",
      showLess: "Afficher moins",
      additional: "Informations complémentaires",
    },
    contact: {
      title: "Parlez à une vraie personne.",
      subtitle:
        "Une question sur une réservation, une demande spéciale, ou simplement une recommandation pour le dîner ? Notre conciergerie locale répond en moins d'une heure, tous les jours de 9h à 21h, heure de Marrakech.",
      whatsapp: "WhatsApp",
      whatsappCta: "Ouvrir WhatsApp",
      email: "Email",
      emailCta: "Envoyer un email",
      phone: "Téléphone",
      phoneCta: "Nous appeler",
      office: "Bureau",
      officeAddress: "Gueliz, Marrakech 40000",
      officeCta: "Sur rendez-vous",
      replyTime: "Délai de réponse moyen : moins de 60 minutes",
      formTitle: "Envoyer un message",
      formSubtitle: "Nous vous répondons dans la journée.",
      firstName: "Prénom",
      lastName: "Nom",
      emailLabel: "Email",
      topic: "Comment pouvons-nous vous aider ?",
      topicEnquiry: "Une demande de réservation",
      topicSpecial: "Une demande spéciale pour une réservation existante",
      topicElse: "Autre chose",
      messageLabel: "Message",
      messagePlaceholder: "Parlez-nous un peu de votre voyage…",
      sendBtn: "Envoyer le message",
      privacyNote:
        "En envoyant ce message, vous acceptez nos conditions et notre politique de confidentialité.",
    },
    about: {
      metaTitle: "À propos",
      metaDescription:
        "Pourquoi NEXTWIN existe - et comment nous choisissons les logements proposés sur la plateforme.",
      heroEyebrow: "À propos de NEXTWIN",
      heroTitle: "Nous choisissons les logements que nous enverrions à nos amis.",
      heroSubtitle:
        "Pas de listes superflues, pas d'inventaire gonflé. Chaque propriété sur NEXTWIN est visitée, vérifiée, et associée à un hôte qui répond vraiment.",
      storyTitle: "Construit à Marrakech, par des gens qui y vivent.",
      storyP1:
        "NEXTWIN est né d'une frustration simple : les amis de passage à Marrakech finissaient dans des endroits qui ne ressemblaient en rien aux photos. Nous avons donc commencé une petite liste de riads, villas et appartements que nous recommandions vraiment - des propriétaires en qui nous avions confiance, des portes auxquelles nous avions personnellement frappé, des hôtes qui décrochaient le téléphone.",
      storyP2:
        "Trois ans plus tard, la liste reste petite à dessein. Nous préférons quatre-vingts logements que nous connaissons par cœur plutôt que huit mille que nous n'avons jamais vus. Si un endroit cesse de nous convenir, il est retiré. Si un hôte cesse de répondre dans l'heure, il est retiré aussi.",
      storyP3:
        "Nous ne faisons qu'une chose - nous vous aidons à trouver le bon endroit où séjourner à Marrakech, et nous aidons les bons hôtes à trouver de bons clients. C'est tout.",
      pillarsTitle: "Comment nous choisissons les propriétés",
      pillarsSubtitle: "Quatre vérifications que chaque logement doit passer avant d'être en ligne.",
      pillar1Title: "Une vraie adresse",
      pillar1Body:
        "Nous visitons chaque propriété en personne. Si nous ne pouvons pas y séjourner nous-mêmes, elle ne va pas en ligne.",
      pillar2Title: "Photos honnêtes",
      pillar2Body:
        "Ce que vous voyez est ce que vous obtenez. Pas de distorsion grand-angle, pas de mise en scène, pas de défauts cachés.",
      pillar3Title: "Un hôte qui répond",
      pillar3Body:
        "Chaque hôte s'engage à répondre en moins d'une heure. Un faux pas, et il quitte la plateforme.",
      pillar4Title: "Tarification simple et juste",
      pillar4Body:
        "Un prix par nuit, en EUR. Frais de ménage affichés à l'avance. Pas de taxes-resort surprises.",
      seeStaysCta: "Voir les logements",
    },
  },

  en: {
    nav: {
      home: "Home",
      properties: "Properties",
      buy: "Buy",
      rentLong: "Long-term",
      shortStay: "Short stay",
      about: "About",
      contact: "Contact us",
      bookCta: "Browse properties",
      toggleMenu: "Toggle menu",
    },
    listingKind: {
      sale: "For sale",
      rentLong: "Long-term rental",
      shortStay: "Short stay",
    },
    pricing: {
      perNight: "per night",
      perMonth: "per month",
      fromShort: "From",
      forSale: "For sale",
      onRequest: "On request",
      inquireCta: "Request information",
      inquireShort: "Inquire",
    },
    logo: { tagline: "Real estate" },
    hero: {
      subtitle: "Buy, rent, stay in Marrakech.",
    },
    search: {
      arrival: "Arrival",
      departure: "Departure",
      guests: "Guests",
      pickDate: "Pick a date",
      addDates: "Add dates",
      search: "Search",
      guestSingular: "guest",
      guestPlural: "guests",
      adultsChildren: "Adults & children",
      decreaseGuests: "Decrease guests",
      increaseGuests: "Increase guests",
      selectDatesTitle: "Select dates",
      selectDatesHint: "Select arrival and departure dates",
      minNightsHint: "Minimum stay: {n} nights",
      clearDates: "Clear dates",
      apply: "Apply",
      close: "Close",
      prevMonth: "Previous month",
      nextMonth: "Next month",
    },
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    home: {
      sectionEyebrow: "Marrakech · Exceptional properties",
      sectionTitle: "Find your next property.",
      approachEyebrow: "Our approach",
      approachCta: "Entrust your project",
      bookingSimpleTitle: "Real estate, without the runaround",
      bookingSimpleSubtitle:
        "One contact, three crafts: sales, long-term rentals, short stays.",
      stepCuratedTitle: "Curated selection",
      stepCuratedBody:
        "Every property is visited and approved before it goes online. No surprises.",
      stepCancelTitle: "Guided viewings",
      stepCancelBody:
        "An advisor walks you through the homes that actually match your project, not a generic list.",
      stepConciergeTitle: "Personal follow-up",
      stepConciergeBody:
        "A real local on WhatsApp from the first viewing to the signed deed, and long after.",
      closerTitle: "Marrakech, at every stage of your project",
      closerBody:
        "Buying your next home, renting for a year, or simply staying for a few nights: Nextwin stays your single contact. Riads inside the Medina, garden villas in the Palmeraie, apartments in Guéliz, one address book.",
      closerCta: "Browse all our properties",
    },
    listings: {
      title: "Properties",
      viewMap: "View on map",
      noResults: "No matches yet",
      noResultsHint: "Try widening your dates or removing the type filter.",
      all: "All",
    },
    type: {
      villa: "Villa",
      apartment: "Apartment",
      riad: "Riad",
      terrain: "Land",
      bureau: "Office",
      magasin: "Shop",
      commercial: "Commercial",
    },
    card: {
      guests: "guests",
      bedrooms: "bedrooms",
      bathrooms: "bathrooms",
    },
    amenity: {
      heating: "Heating",
      balcony: "Balcony",
      tv: "Flat-screen TV",
      linens: "Premium linens & towels",
      security: "24/7 secure residence",
      chimney: "Fireplace",
      languages: "Languages: FR · AR · EN",
      pool: "Pool",
      kitchen: "Kitchen",
      ac: "AC",
      wifi: "Wi-Fi",
      parking: "Parking",
      hammam: "Hammam",
      breakfast: "Breakfast",
      workspace: "Workspace",
      garden: "Garden",
      terrace: "Terrace",
      washer: "Washer",
      concierge: "Concierge",
      tennis: "Tennis",
      bbq: "BBQ",
      housekeeping: "Daily housekeeping",
      elevator: "Elevator",
      chef: "Optional chef",
      selfCheckIn: "Self check-in",
    },
    footer: {
      blurb:
        "Buy, rent or stay in Marrakech. One local team for your real-estate projects, from short stays to long-term investment.",
      explore: "Our services",
      shortStay: "Short stay",
      rentLong: "Long-term",
      buy: "Buy",
      gestion: "Property management",
      reach: "Reach us",
      company: "Company",
      about: "About",
      team: "Our team",
      contact: "Contact us",
      rights: "All rights reserved",
      terms: "Terms",
      privacy: "Privacy",
      cookies: "Cookies",
    },
    language: { label: "Language" },
    comingSoon: {
      eyebrow: "NEXTWIN · MARRAKECH",
      title: "Coming soon",
      caption: "This listing will be published shortly. Contact us for an exclusive preview.",
    },
    portal: {
      ariaLabel: "Choose your category",
      shortStayTitle: "Book your stay",
      shortStayBody:
        "Riads, villas and apartments by the night. Hand-picked listings, personal welcome.",
      shortStayCta: "Browse stays",
      rentLongTitle: "Find your rental",
      rentLongBody:
        "Furnished or unfurnished, several months in Marrakech. End-to-end support.",
      rentLongCta: "Browse rentals",
      buyTitle: "Buy your property",
      buyBody:
        "Villas, riads, apartments and land. Neutral advice and fair-price negotiation.",
      buyCta: "Browse catalogue",
    },
    ownerCallout: {
      eyebrow: "You are an owner",
      title: "Hand us your property.",
      body:
        "Listing, guest screening, welcome, cleaning and maintenance. You keep the property, we handle the rest.",
      cta: "Learn more",
    },
    team: {
      eyebrow: "Our team",
      title: "Three advisors, one standard.",
      subtitle:
        "Every file is handled by three pairs of hands. You speak to the person in charge, not a switchboard.",
      whatsapp: "WhatsApp",
      email: "Email",
      phone: "Call",
      portraitAlt: "Portrait of {{name}}",
      signoffSuffix: "your advisors in Marrakech",
    },
    gestion: {
      heroEyebrow: "Property management",
      heroTitle: "Hand us your property, keep your peace of mind.",
      heroBody:
        "You own a property in Marrakech. We handle listing, guest screening, welcome, cleaning and maintenance. You track your revenue, we run the rest.",
      heroCta: "Hand over my property",
      serviceEyebrow: "Our service",
      serviceTitle: "A turnkey management.",
      serviceSubtitle:
        "Four pillars to turn a Marrakech property into rental income with zero effort from your side.",
      benefit1Title: "Premium listing",
      benefit1Body:
        "Professional photos, polished copy, Airbnb / Booking listings and social media handled by our marketing team.",
      benefit2Title: "Vetted travellers",
      benefit2Body:
        "Profile checks, security deposit, house rules. You stay in control of who sleeps at your place.",
      benefit3Title: "Welcome & calendar",
      benefit3Body:
        "Personal check-in, 7-day support in French, English and Arabic, calendar synced across every platform.",
      benefit4Title: "Cleaning & maintenance",
      benefit4Body:
        "Dedicated cleaning team between stays, fast response on issues, linen and supplies provided.",
      howEyebrow: "How it works",
      howTitle: "Three steps, then we take over.",
      step1Title: "Visit & estimate",
      step1Body:
        "We visit your property, advise on high-impact tweaks, and give you a realistic rental income estimate.",
      step2Title: "Contract & listing",
      step2Body:
        "Mandate signing, photo shoot, copy writing and publishing on the right platforms.",
      step3Title: "Daily management",
      step3Body:
        "You get a clear monthly report. We handle everything else, from booking to payment.",
      formEyebrow: "Get started",
      formTitle: "Let's talk about your property.",
      formSubtitle:
        "A few details about your property and we call you back within 24 hours for a free on-site estimate.",
      formPropertySection: "Your property",
      formContactSection: "How to reach you",
      formTypeLabel: "Property type",
      formAreaLabel: "Neighbourhood",
      formBedroomsLabel: "Bedrooms (optional)",
      formServiceLabel: "Desired service",
      formListedLabel: "Existing listings (Airbnb, Booking…)",
      formListedPlaceholder: "Airbnb / Booking link or listing name (if any)",
      formNotesLabel: "Notes (optional)",
      formNotesPlaceholder:
        "Desired rate, availability, special constraints…",
      formNameLabel: "Full name",
      formNamePlaceholder: "First Last",
      formEmailLabel: "Email",
      formEmailPlaceholder: "you@example.com",
      formPhoneLabel: "Phone",
      formPhonePlaceholder: "+212 6 …",
      formNameRequired: "Your name is required.",
      formContactRequired: "Email or phone required so we can reach you.",
      formError: "Could not send. Please try again.",
      formNetworkError: "Network error. Please try again.",
      formSubmit: "Send my request",
      formSubmitting: "Sending…",
      formSuccessTitle: "Thanks, your request is in.",
      formSuccessBody:
        "A team member will call you back within 24 hours to discuss your property.",
      serviceShort: "Short stay (Airbnb, Booking)",
      serviceLong: "Long-term rental",
      serviceBoth: "Both",
      serviceAdvice: "Just exploring",
      typeRiad: "Riad",
      typeVilla: "Villa",
      typeApartment: "Apartment",
      typeTerrain: "Land",
      typeBureau: "Office",
      typeMagasin: "Shop",
      typeOther: "Other",
    },
    detail: {
      back: "Back to all stays",
      share: "Share",
      save: "Save",
      viewAllPhotos: "View all {n} photos",
      aboutTitle: "About this place",
      aboutModalTitle: "About this home",
      amenitiesTitle: "What this place offers",
      amenitiesModalTitle: "What this home offers",
      amenityCategories: {
        bathroom: "Bathroom",
        bedroom: "Bedroom and laundry",
        entertainment: "Entertainment",
        heatingCooling: "Heating and cooling",
        internet: "Internet and office",
        kitchen: "Kitchen and dining",
        outdoor: "Outdoor",
        parking: "Parking and facilities",
        services: "Services",
        other: "Other",
      },
      showAllAmenities: "Show all {n} amenities",
      showLess: "Show less",
      rulesTitle: "House rules",
      ruleCheckIn: "Check-in",
      ruleCheckInValue: "From 3:00 PM",
      ruleCheckOut: "Check-out",
      ruleCheckOutValue: "By 11:00 AM",
      ruleMinStay: "Minimum stay",
      ruleMinStayValue: "2 nights",
      ruleCancellation: "Cancellation",
      ruleCancellationValue: "Free up to 7 days before",
      rulePets: "Pets",
      rulePetsValue: "On request",
      ruleSmoking: "Smoking",
      ruleSmokingValue: "Outside only",
      hostedBy: "Hosted by {name}",
      hostingYears: "{n} years hosting · responds in under an hour",
      identityVerified: "Identity verified",
      speaksLanguages: "Speaks English, Français, العربية",
      messageHost: "Message host",
      managedByNextwin: "Managed by the NEXTWIN team · replies within an hour",
      contactTeam: "Contact the team",
      upToGuests: "Up to {n} guests",
    },
    booking: {
      perNight: "/ night",
      addDate: "Add date",
      reserve: "Reserve",
      reserveNow: "Reserve now",
      selectDates: "Select your dates",
      selectDatesPill: "Select Dates",
      addDatesForPrice: "Add dates for pricing",
      viewAvailability: "View availability",
      sheetIntro: "Select dates and guest count to see the total price per night",
      sendRequest: "Send a request",
      requestPrefill:
        "Hello NEXTWIN,\n\nI'd like to book:\n\n🏡 {property}\n📅 From {from} to {to} ({nights} {nightLabel})\n👥 {guests} guests\n\n💶 Rate: {pricePerNight}/night\n💰 Total: {total}\n\nPlease confirm availability.",
      noChargeYet: "You won't be charged yet - instant confirmation by email.",
      cleaningFee: "Cleaning fee",
      serviceFee: "Service fee",
      total: "Total",
      freeCancellation: "Free cancellation up to 7 days before arrival.",
      nightSingular: "night",
      nightPlural: "nights",
      selectDatesHint: "Select your dates",
      minNightsHint: "Minimum stay: {n} nights",
    },
    reviews: {
      showAll: "Show all {n} reviews",
      reviewsLabel: "reviews",
      guestFavourite: "Guest favorite",
      guestFavouriteDescription:
        "This home is a guest favorite based on ratings, reviews, and reliability.",
      overallRating: "Overall rating",
      leaveReviewCta: "Leave a review",
      pendingBadge: "Pending approval",
      showMore: "Read more",
      showLess: "Read less",
      categories: {
        cleanliness: "Cleanliness",
        accuracy: "Accuracy",
        checkin: "Check-in",
        communication: "Communication",
        location: "Location",
        value: "Value",
      },
      form: {
        title: "Rate your stay",
        subtitle:
          "Your category scores help future guests choose. The overall rating is the average of your selections.",
        firstName: "Your first name",
        city: "City (optional)",
        reviewLabel: "Your review",
        reviewPlaceholder:
          "What did you love? What could be improved?",
        remainingChars: "At least 20 characters - {n} remaining",
        submit: "Send my review",
        submitting: "Sending…",
        cancel: "Cancel",
        submittedNote:
          "Your review will be added to the public selection after verification by the concierge. It stays visible to you in the meantime.",
        errorMissingConfig:
          "Server configuration missing. Please try again later.",
        errorGeneric:
          "Couldn't send your review. Check your connection and try again.",
        stayKindRecent: "Recent stay",
      },
    },
    availability: {
      title: "Available days",
      legendAvailable: "Available",
      legendBooked: "Booked",
      legendPast: "Past",
    },
    map: {
      title: "Where you'll be",
      privacyHint: "Approximate area (~{n} m)",
      noLocation: "Exact address shared after confirmation.",
      gettingAroundTitle: "Getting around",
      showMore: "Read more",
      showLess: "Read less",
    },
    rules: {
      sectionTitle: "Good to know",
      showMore: "Show more",
      showLess: "Show less",
      additional: "Additional information",
    },
    contact: {
      title: "Talk to a real person.",
      subtitle:
        "Booking question, special request, or just need a recommendation for dinner? Our local concierge replies within an hour, every day from 9am to 9pm Marrakech time.",
      whatsapp: "WhatsApp",
      whatsappCta: "Open WhatsApp",
      email: "Email",
      emailCta: "Send email",
      phone: "Phone",
      phoneCta: "Call us",
      office: "Office",
      officeAddress: "Gueliz, Marrakech 40000",
      officeCta: "By appointment",
      replyTime: "Average reply time: under 60 minutes",
      formTitle: "Send a message",
      formSubtitle: "We'll come back to you the same day.",
      firstName: "First name",
      lastName: "Last name",
      emailLabel: "Email",
      topic: "What can we help with?",
      topicEnquiry: "A booking enquiry",
      topicSpecial: "A special request for an existing booking",
      topicElse: "Something else",
      messageLabel: "Message",
      messagePlaceholder: "Tell us a bit about your trip…",
      sendBtn: "Send message",
      privacyNote: "By sending this message you agree to our terms and privacy policy.",
    },
    about: {
      metaTitle: "About",
      metaDescription:
        "Why NEXTWIN exists - and how we choose the stays we put on the platform.",
      heroEyebrow: "About NEXTWIN",
      heroTitle: "We choose the stays we'd send our friends to.",
      heroSubtitle:
        "No filler listings, no padded inventory. Every property on NEXTWIN is visited, vetted, and matched with a host who actually answers the door.",
      storyTitle: "Built in Marrakech, by people who live here.",
      storyP1:
        "NEXTWIN started with a simple frustration: friends visiting Marrakech kept ending up in places that looked nothing like the photos. So we started a small list of riads, villas, and apartments we'd actually recommend - owners we trusted, doors we'd personally knocked on, hosts who picked up the phone.",
      storyP2:
        "Three years on, the list is still small on purpose. We'd rather have eighty stays we know inside out than eight thousand we've never seen. If a place stops feeling right, it comes off. If a host stops replying within an hour, they're off too.",
      storyP3:
        "We do one thing - we help you find the right place to stay in Marrakech, and we help the right hosts find good guests. That's it.",
      pillarsTitle: "How we choose properties",
      pillarsSubtitle: "Four checks every place has to pass before it goes online.",
      pillar1Title: "A real address",
      pillar1Body:
        "We visit every property in person. If we wouldn't stay there ourselves, it doesn't go online.",
      pillar2Title: "Honest photos",
      pillar2Body:
        "What you see is what you get. No wide-angle distortion, no staged props, no hidden flaws.",
      pillar3Title: "A host who shows up",
      pillar3Body:
        "Every host commits to a one-hour reply time. Slip on that and they're off the platform.",
      pillar4Title: "Fair, simple pricing",
      pillar4Body:
        "One price per night, in EUR. Cleaning fee shown up front. No surprise resort levies.",
      seeStaysCta: "See the stays",
    },
  },

  ar: {
    nav: {
      home: "الرئيسية",
      properties: "عقاراتنا",
      buy: "للبيع",
      rentLong: "إيجار طويل",
      shortStay: "إقامة قصيرة",
      about: "حول",
      contact: "اتصل بنا",
      bookCta: "اكتشف العقارات",
      toggleMenu: "فتح القائمة",
    },
    listingKind: {
      sale: "للبيع",
      rentLong: "إيجار طويل الأمد",
      shortStay: "إقامة قصيرة",
    },
    pricing: {
      perNight: "في الليلة",
      perMonth: "في الشهر",
      fromShort: "ابتداءً من",
      forSale: "للبيع",
      onRequest: "حسب الطلب",
      inquireCta: "طلب معلومات",
      inquireShort: "استفسار",
    },
    logo: { tagline: "عقارات" },
    hero: {
      subtitle: "للبيع، للإيجار، وللإقامة في مراكش.",
    },
    search: {
      arrival: "الوصول",
      departure: "المغادرة",
      guests: "الضيوف",
      pickDate: "اختر تاريخًا",
      addDates: "أضف التواريخ",
      search: "بحث",
      guestSingular: "ضيف",
      guestPlural: "ضيوف",
      adultsChildren: "البالغون والأطفال",
      decreaseGuests: "إنقاص عدد الضيوف",
      increaseGuests: "زيادة عدد الضيوف",
      selectDatesTitle: "اختر التواريخ",
      selectDatesHint: "اختر تواريخ الوصول والمغادرة",
      minNightsHint: "الحد الأدنى للإقامة: {n} ليالٍ",
      clearDates: "مسح التواريخ",
      apply: "تطبيق",
      close: "إغلاق",
      prevMonth: "الشهر السابق",
      nextMonth: "الشهر التالي",
    },
    weekdays: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
    home: {
      sectionEyebrow: "مراكش · عقارات استثنائية",
      sectionTitle: "اعثر على عقارك التالي.",
      approachEyebrow: "أسلوبنا",
      approachCta: "ائتمن مشروعك",
      bookingSimpleTitle: "عقارات بلا تعقيد",
      bookingSimpleSubtitle:
        "محاور واحد، ثلاث خدمات : البيع، الإيجار الطويل، الإقامة القصيرة.",
      stepCuratedTitle: "اختيار دقيق",
      stepCuratedBody:
        "نزور كل عقار ونوافق عليه قبل نشره. لا مفاجآت عند الوصول.",
      stepCancelTitle: "زيارات مرافقة",
      stepCancelBody:
        "مستشار يرافقك لزيارة العقارات التي تناسب مشروعك فعلاً، وليس قائمة عامة.",
      stepConciergeTitle: "متابعة شخصية",
      stepConciergeBody:
        "محلي حقيقي على واتساب من أول زيارة إلى لحظة التوقيع، وبعدها طويلاً.",
      closerTitle: "مراكش في كل مراحل مشروعك",
      closerBody:
        "سواء كنت ترغب في شراء منزلك الجديد، أو إيجار سنوي، أو إقامة قصيرة، تبقى نكستوين محاورك الوحيد. رياضات في المدينة العتيقة، فلل في النخيل، شقق في قليز : دفتر عناوين واحد.",
      closerCta: "تصفح كل عقاراتنا",
    },
    listings: {
      title: "العقارات",
      viewMap: "عرض على الخريطة",
      noResults: "لا توجد نتائج بعد",
      noResultsHint: "جرّب توسيع التواريخ أو إزالة فلتر النوع.",
      all: "الكل",
    },
    type: {
      villa: "فيلا",
      apartment: "شقة",
      riad: "رياض",
      terrain: "أرض",
      bureau: "مكتب",
      magasin: "محل",
      commercial: "تجاري",
    },
    card: {
      guests: "ضيوف",
      bedrooms: "غرف",
      bathrooms: "حمامات",
    },
    amenity: {
      heating: "تدفئة",
      balcony: "شرفة",
      tv: "تلفاز بشاشة مسطحة",
      linens: "أغطية وفوط فاخرة",
      security: "إقامة آمنة 24/7",
      chimney: "موقد",
      languages: "اللغات: FR · AR · EN",
      pool: "مسبح",
      kitchen: "مطبخ",
      ac: "تكييف",
      wifi: "واي فاي",
      parking: "موقف",
      hammam: "حمام",
      breakfast: "إفطار",
      workspace: "مكتب",
      garden: "حديقة",
      terrace: "تراس",
      washer: "غسالة",
      concierge: "كونسيرج",
      tennis: "تنس",
      bbq: "شواء",
      housekeeping: "خدمة تنظيف يومية",
      elevator: "مصعد",
      chef: "طاهٍ عند الطلب",
      selfCheckIn: "تسجيل وصول ذاتي",
    },
    footer: {
      blurb:
        "للشراء، أو الإيجار، أو الإقامة في مراكش. فريق محلي واحد لمشاريعكم العقارية، من الإقامة القصيرة إلى الاستثمار طويل الأمد.",
      explore: "خدماتنا",
      shortStay: "إقامة قصيرة",
      rentLong: "إيجار طويل الأمد",
      buy: "شراء",
      gestion: "تسيير العقارات",
      reach: "اتصل بنا",
      company: "الشركة",
      about: "من نحن",
      team: "فريقنا",
      contact: "تواصل معنا",
      rights: "جميع الحقوق محفوظة",
      terms: "الشروط",
      privacy: "الخصوصية",
      cookies: "ملفات تعريف الارتباط",
    },
    language: { label: "اللغة" },
    comingSoon: {
      eyebrow: "نيكستوين · مراكش",
      title: "قريبًا",
      caption: "سيُنشر هذا الإعلان قريبًا. تواصل معنا للحصول على معاينة حصرية.",
    },
    portal: {
      ariaLabel: "اختر فئتك",
      shortStayTitle: "احجز إقامتك",
      shortStayBody:
        "رياضات وفلل وشقق بالليلة. اختيار صارم واستقبال خاص.",
      shortStayCta: "تصفح الإقامات",
      rentLongTitle: "اعثر على إيجارك",
      rentLongBody:
        "مفروش أو غير مفروش، لعدة أشهر في مراكش. مرافقة شاملة من الألف إلى الياء.",
      rentLongCta: "تصفح الإيجارات",
      buyTitle: "اشتر عقارك",
      buyBody:
        "فلل ورياضات وشقق وأراض. استشارة محايدة وتفاوض بالسعر العادل.",
      buyCta: "تصفح الكتالوج",
    },
    ownerCallout: {
      eyebrow: "أنت مالك",
      title: "اعهد إلينا بعقارك.",
      body:
        "النشر، اختيار النزلاء، الاستقبال، النظافة والصيانة. تحتفظ بالملكية، ونتولى الباقي.",
      cta: "اكتشف المزيد",
    },
    team: {
      eyebrow: "فريقنا",
      title: "ثلاثة محاورين، معيار واحد.",
      subtitle:
        "نتعامل مع كل ملف بأيدٍ ثلاثة. تتحدث مع الشخص المكلف، لا مع مركز اتصال.",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      phone: "اتصل",
      portraitAlt: "صورة {{name}}",
      signoffSuffix: "مستشاروكم في مراكش",
    },
    gestion: {
      heroEyebrow: "تسيير العقارات",
      heroTitle: "اعهد إلينا بعقارك، واحتفظ براحة بالك.",
      heroBody:
        "أنت مالك عقار في مراكش. نتولى النشر واختيار النزلاء والاستقبال والنظافة والصيانة. أنت تتابع مداخيلك، ونحن نسير الباقي.",
      heroCta: "اعهد بعقاري",
      serviceEyebrow: "خدمتنا",
      serviceTitle: "تسيير شامل بمفتاح اليد.",
      serviceSubtitle:
        "أربعة محاور لتحويل عقار في مراكش إلى دخل إيجاري دون أي مجهود من طرفك.",
      benefit1Title: "نشر متميز",
      benefit1Body:
        "صور احترافية، نصوص أنيقة، إعلانات Airbnb وBooking ومنصات التواصل يديرها فريقنا التسويقي.",
      benefit2Title: "نزلاء مختارون",
      benefit2Body:
        "التحقق من الملفات، تأمين الضمان، قواعد المنزل. تبقى مسيطرًا على من ينام عندك.",
      benefit3Title: "الاستقبال والتقويم",
      benefit3Body:
        "تسجيل دخول شخصي، دعم على مدار الأسبوع بالفرنسية والإنجليزية والعربية، تقويم متزامن على كل المنصات.",
      benefit4Title: "النظافة والصيانة",
      benefit4Body:
        "فريق نظافة مخصص بين كل إقامة، تدخل سريع عند أي مشكلة، توفير المفروشات والمستلزمات.",
      howEyebrow: "كيف يجري الأمر",
      howTitle: "ثلاث مراحل ثم نتولى الأمر.",
      step1Title: "الزيارة والتقدير",
      step1Body:
        "نزور عقارك، ننصح بالتحسينات ذات الأثر العالي، ونقدم تقديرًا واقعيًا للدخل الإيجاري.",
      step2Title: "العقد والنشر",
      step2Body:
        "توقيع التفويض، تصوير احترافي، كتابة الإعلانات ونشرها على المنصات المناسبة.",
      step3Title: "التسيير اليومي",
      step3Body:
        "تتوصل بتقرير شهري واضح. نحن نتولى الباقي، من الحجز حتى الدفع.",
      formEyebrow: "ابدأ الآن",
      formTitle: "لنتحدث عن عقارك.",
      formSubtitle:
        "بعض التفاصيل عن عقارك وسنتصل بك خلال 24 ساعة لزيارة تقديرية مجانية.",
      formPropertySection: "عقارك",
      formContactSection: "للتواصل معك",
      formTypeLabel: "نوع العقار",
      formAreaLabel: "الحي",
      formBedroomsLabel: "الغرف (اختياري)",
      formServiceLabel: "الخدمة المطلوبة",
      formListedLabel: "الإعلانات الحالية (Airbnb، Booking…)",
      formListedPlaceholder: "رابط Airbnb أو Booking أو اسم الإعلان (إن وجد)",
      formNotesLabel: "ملاحظات (اختياري)",
      formNotesPlaceholder:
        "السعر المرغوب، التواريخ المتاحة، شروط خاصة…",
      formNameLabel: "الاسم الكامل",
      formNamePlaceholder: "الاسم العائلي",
      formEmailLabel: "البريد الإلكتروني",
      formEmailPlaceholder: "you@example.com",
      formPhoneLabel: "الهاتف",
      formPhonePlaceholder: "+212 6 …",
      formNameRequired: "الاسم مطلوب.",
      formContactRequired: "البريد الإلكتروني أو الهاتف مطلوب للتواصل معك.",
      formError: "تعذر الإرسال. حاول مرة أخرى.",
      formNetworkError: "خطأ في الشبكة. حاول مرة أخرى.",
      formSubmit: "إرسال الطلب",
      formSubmitting: "جارٍ الإرسال…",
      formSuccessTitle: "شكرًا، تم استلام طلبك.",
      formSuccessBody:
        "سيتصل بك أحد أعضاء الفريق خلال 24 ساعة لمناقشة تسيير عقارك.",
      serviceShort: "إقامة قصيرة (Airbnb، Booking)",
      serviceLong: "إيجار طويل الأمد",
      serviceBoth: "كلاهما",
      serviceAdvice: "أستكشف",
      typeRiad: "رياض",
      typeVilla: "فيلا",
      typeApartment: "شقة",
      typeTerrain: "أرض",
      typeBureau: "مكتب",
      typeMagasin: "محل",
      typeOther: "آخر",
    },
    detail: {
      back: "العودة إلى العقارات",
      share: "مشاركة",
      save: "حفظ",
      viewAllPhotos: "عرض جميع الصور ({n})",
      aboutTitle: "حول هذا المكان",
      aboutModalTitle: "حول هذا المسكن",
      amenitiesTitle: "ما يقدمه هذا المكان",
      amenitiesModalTitle: "ما يقدمه هذا المسكن",
      amenityCategories: {
        bathroom: "الحمام",
        bedroom: "غرفة النوم والغسيل",
        entertainment: "الترفيه",
        heatingCooling: "التدفئة والتكييف",
        internet: "الإنترنت والمكتب",
        kitchen: "المطبخ وغرفة الطعام",
        outdoor: "ميزات خارجية",
        parking: "موقف السيارات",
        services: "الخدمات",
        other: "أخرى",
      },
      showAllAmenities: "عرض جميع المرافق ({n})",
      showLess: "عرض أقل",
      rulesTitle: "قواعد المنزل",
      ruleCheckIn: "تسجيل الدخول",
      ruleCheckInValue: "من الساعة 15:00",
      ruleCheckOut: "تسجيل الخروج",
      ruleCheckOutValue: "قبل الساعة 11:00",
      ruleMinStay: "الإقامة الدنيا",
      ruleMinStayValue: "ليلتان",
      ruleCancellation: "الإلغاء",
      ruleCancellationValue: "مجاني حتى 7 أيام قبل الوصول",
      rulePets: "الحيوانات الأليفة",
      rulePetsValue: "حسب الطلب",
      ruleSmoking: "التدخين",
      ruleSmokingValue: "في الخارج فقط",
      hostedBy: "استضافة {name}",
      hostingYears: "{n} سنوات استضافة · يرد في أقل من ساعة",
      identityVerified: "الهوية موثقة",
      speaksLanguages: "يتحدث الإنجليزية والفرنسية والعربية",
      messageHost: "تواصل مع المضيف",
      managedByNextwin: "تدار من فريق NEXTWIN · يرد في أقل من ساعة",
      contactTeam: "تواصل مع الفريق",
      upToGuests: "حتى {n} ضيف",
    },
    booking: {
      perNight: "/ ليلة",
      addDate: "أضف تاريخًا",
      reserve: "احجز",
      reserveNow: "احجز الآن",
      selectDates: "اختر تواريخك",
      selectDatesPill: "اختر التواريخ",
      addDatesForPrice: "أضف تواريخ لمعرفة السعر",
      viewAvailability: "عرض التوفر",
      sheetIntro: "اختر التواريخ وعدد الأشخاص لرؤية السعر الإجمالي لكل ليلة",
      sendRequest: "أرسل طلبًا",
      requestPrefill:
        "مرحباً NEXTWIN،\n\nأرغب في الحجز:\n\n🏡 {property}\n📅 من {from} إلى {to} ({nights} {nightLabel})\n👥 {guests} أشخاص\n\n💶 السعر: {pricePerNight}/ليلة\n💰 الإجمالي: {total}\n\nيرجى تأكيد التوفر.",
      noChargeYet: "لا توجد رسوم حتى الآن - تأكيد فوري عبر البريد الإلكتروني.",
      cleaningFee: "رسوم التنظيف",
      serviceFee: "رسوم الخدمة",
      total: "المجموع",
      freeCancellation: "إلغاء مجاني حتى 7 أيام قبل الوصول.",
      nightSingular: "ليلة",
      nightPlural: "ليالٍ",
      selectDatesHint: "اختر تواريخك",
      minNightsHint: "الحد الأدنى للإقامة: {n} ليالٍ",
    },
    reviews: {
      showAll: "عرض جميع التقييمات ({n})",
      reviewsLabel: "تقييم",
      guestFavourite: "المسكن المفضل",
      guestFavouriteDescription:
        "هذا المسكن من المفضلين لدى المسافرين، بناءً على التقييمات والتعليقات والموثوقية.",
      overallRating: "التقييم العام",
      leaveReviewCta: "اترك تقييماً",
      pendingBadge: "في انتظار التأكيد",
      showMore: "عرض المزيد",
      showLess: "عرض أقل",
      categories: {
        cleanliness: "النظافة",
        accuracy: "الدقة",
        checkin: "الوصول",
        communication: "التواصل",
        location: "الموقع",
        value: "القيمة مقابل السعر",
      },
      form: {
        title: "قيّم إقامتك",
        subtitle:
          "تساعد تقييماتك حسب الفئة المسافرين في الاختيار. التقييم العام هو متوسط اختياراتك.",
        firstName: "اسمك",
        city: "المدينة (اختياري)",
        reviewLabel: "تعليقك",
        reviewPlaceholder: "ما الذي أعجبك؟ ما الذي يمكن تحسينه؟",
        remainingChars: "20 حرفاً على الأقل - {n} متبقية",
        submit: "إرسال تعليقي",
        submitting: "جارٍ الإرسال…",
        cancel: "إلغاء",
        submittedNote:
          "ستتم إضافة تعليقك إلى المجموعة العامة بعد التحقق من قبل خدمة الكونسيرج. يبقى مرئياً لك في غضون ذلك.",
        errorMissingConfig: "إعدادات الخادم مفقودة. حاول مرة أخرى لاحقاً.",
        errorGeneric: "تعذر إرسال تعليقك. تحقق من اتصالك وحاول مرة أخرى.",
        stayKindRecent: "إقامة حديثة",
      },
    },
    availability: {
      title: "الأيام المتاحة",
      legendAvailable: "متاح",
      legendBooked: "محجوز",
      legendPast: "ماضٍ",
    },
    map: {
      title: "أين ستقيم",
      privacyHint: "منطقة تقريبية (~{n} م)",
      noLocation: "العنوان الدقيق يُرسل بعد التأكيد.",
      gettingAroundTitle: "التنقل",
      showMore: "عرض المزيد",
      showLess: "عرض أقل",
    },
    rules: {
      sectionTitle: "معلومات مفيدة",
      showMore: "عرض المزيد",
      showLess: "عرض أقل",
      additional: "معلومات إضافية",
    },
    contact: {
      title: "تحدّث مع شخص حقيقي.",
      subtitle:
        "سؤال حول الحجز، طلب خاص، أو تريد توصية للعشاء فقط؟ خدمة الكونسيرج المحلية ترد خلال أقل من ساعة، كل يوم من الساعة 9 صباحًا حتى 9 مساءً بتوقيت مراكش.",
      whatsapp: "واتساب",
      whatsappCta: "فتح واتساب",
      email: "البريد الإلكتروني",
      emailCta: "إرسال بريد",
      phone: "الهاتف",
      phoneCta: "اتصل بنا",
      office: "المكتب",
      officeAddress: "جليز، مراكش 40000",
      officeCta: "بموعد مسبق",
      replyTime: "متوسط زمن الرد: أقل من 60 دقيقة",
      formTitle: "أرسل رسالة",
      formSubtitle: "سنرد عليك في نفس اليوم.",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      emailLabel: "البريد الإلكتروني",
      topic: "كيف يمكننا مساعدتك؟",
      topicEnquiry: "استفسار عن حجز",
      topicSpecial: "طلب خاص لحجز قائم",
      topicElse: "شيء آخر",
      messageLabel: "الرسالة",
      messagePlaceholder: "أخبرنا قليلاً عن رحلتك…",
      sendBtn: "إرسال الرسالة",
      privacyNote: "بإرسال هذه الرسالة، فإنك توافق على شروطنا وسياسة الخصوصية.",
    },
    about: {
      metaTitle: "من نحن",
      metaDescription: "لماذا وُجدت NEXTWIN - وكيف نختار الإقامات التي نضعها على المنصة.",
      heroEyebrow: "حول NEXTWIN",
      heroTitle: "نختار الإقامات التي سنرسل إليها أصدقاءنا.",
      heroSubtitle:
        "لا قوائم حشو، ولا مخزون منتفخ. كل عقار على NEXTWIN يُزار، ويُتحقق منه، ويُرتبط بمضيف يفتح الباب فعلاً.",
      storyTitle: "بُنيت في مراكش، من قبل أناس يعيشون هنا.",
      storyP1:
        "بدأت NEXTWIN من إحباط بسيط: الأصدقاء الذين يزورون مراكش كانوا ينتهون في أماكن لا تشبه الصور إطلاقاً. فبدأنا قائمة صغيرة من الرياضات والفلل والشقق التي نوصي بها فعلاً - مالكون نثق بهم، أبواب طرقناها بأنفسنا، مضيفون يردون على الهاتف.",
      storyP2:
        "بعد ثلاث سنوات، القائمة لا تزال صغيرة عمداً. نفضّل ثمانين إقامة نعرفها جيداً على ثمانية آلاف لم نرها أبداً. إذا توقف مكان عن الإحساس بالصواب، يُرفع. إذا توقف مضيف عن الرد خلال ساعة، يُرفع أيضاً.",
      storyP3:
        "نقوم بشيء واحد - نساعدك في العثور على المكان المناسب للإقامة في مراكش، ونساعد المضيفين الجيدين في العثور على ضيوف جيدين. هذا كل شيء.",
      pillarsTitle: "كيف نختار العقارات",
      pillarsSubtitle: "أربعة فحوصات يجب أن يجتازها كل مكان قبل أن يصبح متاحاً عبر الإنترنت.",
      pillar1Title: "عنوان حقيقي",
      pillar1Body:
        "نزور كل عقار شخصياً. إذا لم نكن سنقيم فيه بأنفسنا، فلن يتم نشره عبر الإنترنت.",
      pillar2Title: "صور صادقة",
      pillar2Body:
        "ما تراه هو ما تحصل عليه. لا تشويه واسع الزاوية، لا ديكورات مرتبة، لا عيوب خفية.",
      pillar3Title: "مضيف يحضر",
      pillar3Body:
        "كل مضيف يلتزم بزمن رد قدره ساعة واحدة. التأخر في ذلك يعني الخروج من المنصة.",
      pillar4Title: "تسعير عادل وبسيط",
      pillar4Body:
        "سعر واحد لكل ليلة، باليورو. رسوم النظافة تظهر مسبقاً. لا ضرائب منتجع مفاجئة.",
      seeStaysCta: "اطّلع على الإقامات",
    },
  },
};
