export type Locale = "fr" | "en" | "ar";

export const LOCALES: Locale[] = ["fr", "en", "ar"];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABEL: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const RTL_LOCALES: Locale[] = ["ar"];

// Single shape — keys identical across all three locales so the type system
// catches missing translations.
type Dict = {
  nav: {
    home: string;
    properties: string;
    about: string;
    contact: string;
    bookCta: string;
    toggleMenu: string;
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
    clearDates: string;
    apply: string;
    close: string;
    prevMonth: string;
    nextMonth: string;
  };
  weekdays: string[]; // 7 entries Sun→Sat
  home: {
    sectionTitle: string;
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
  };
  card: {
    guests: string;
    bedrooms: string;
    bathrooms: string;
  };
  amenity: {
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
  };
  footer: {
    blurb: string;
    explore: string;
    allStays: string;
    riads: string;
    villas: string;
    apartments: string;
    reach: string;
    rights: string;
    terms: string;
    privacy: string;
    cookies: string;
  };
  language: {
    label: string;
  };
  detail: {
    back: string;
    share: string;
    save: string;
    viewAllPhotos: string; // "Voir les {n} photos" — replace {n}
    aboutTitle: string;
    amenitiesTitle: string;
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
    hostedBy: string; // "Hébergé par {name}" — kept for legacy callers
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
    selectDatesPill: string; // mobile sheet pill — "Sélectionnez Les Dates"
    addDatesForPrice: string; // collapsed bar — "Ajouter des dates pour les prix"
    viewAvailability: string; // collapsed bar CTA — "Voir les disponibilités"
    sheetIntro: string; // sheet subtitle — "Sélectionnez les dates et le nombre…"
    sendRequest: string; // outlined CTA — "Envoyer une demande"
    requestPrefill: string; // WhatsApp prefill template
    noChargeYet: string;
    cleaningFee: string;
    serviceFee: string;
    total: string;
    freeCancellation: string;
    nightSingular: string;
    nightPlural: string;
    selectDatesHint: string;
  };
  reviews: {
    showAll: string; // "Voir tous les {n} avis"
    reviewsLabel: string; // "avis" / "reviews" — used in title
  };
  availability: {
    title: string;
    legendAvailable: string;
    legendBooked: string;
    legendPast: string;
  };
  map: {
    title: string;
    privacyHint: string; // "Zone approximative (~{n} m)"
    noLocation: string;
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
      about: "À propos",
      contact: "Contactez-nous",
      bookCta: "Réserver",
      toggleMenu: "Ouvrir le menu",
    },
    logo: { tagline: "Locations" },
    hero: {
      subtitle: "Votre location de vacances à Marrakech.",
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
      clearDates: "Effacer les dates",
      apply: "Appliquer",
      close: "Fermer",
      prevMonth: "Mois précédent",
      nextMonth: "Mois suivant",
    },
    weekdays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    home: {
      sectionTitle: "Nos meilleures propriétés",
      bookingSimpleTitle: "La réservation simplifiée",
      bookingSimpleSubtitle:
        "Trois étapes entre la recherche et les clés en main — et une vraie personne au bout du fil quand vous en avez besoin.",
      stepCuratedTitle: "Logements sélectionnés",
      stepCuratedBody:
        "Chaque propriété est visitée et approuvée avant publication. Aucune surprise à l'arrivée.",
      stepCancelTitle: "Annulation gratuite",
      stepCancelBody:
        "Les plans changent. Annulez jusqu'à 7 jours avant l'arrivée sur la plupart des séjours — sans question.",
      stepConciergeTitle: "Conciergerie locale",
      stepConciergeBody:
        "Un vrai local sur WhatsApp, du moment de la réservation jusqu'à votre départ.",
      closerTitle: "Logez-vous au plus près de la ville que vous venez visiter",
      closerBody:
        "Des riads dans la Médina aux villas avec jardin de la Palmeraie, nos adresses ont un point commun : vous franchissez la porte et vous y êtes déjà. Pas de longues navettes en taxi, pas de bulles touristiques — juste la ville.",
      closerCta: "Voir toutes les propriétés",
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
    },
    card: {
      guests: "invités",
      bedrooms: "chambres",
      bathrooms: "salles de bains",
    },
    amenity: {
      pool: "Piscine",
      kitchen: "Cuisine",
      ac: "Climatisation",
      wifi: "Wi-Fi",
      parking: "Parking",
      hammam: "Hammam",
      breakfast: "Petit-déjeuner",
      workspace: "Bureau",
      garden: "Jardin",
      terrace: "Terrasse",
      washer: "Machine à laver",
      concierge: "Conciergerie",
      tennis: "Tennis",
    },
    footer: {
      blurb:
        "Une sélection soignée de logements à Marrakech — riads, villas et appartements choisis pour leur design, leur confort et l'accueil chaleureux de leurs hôtes.",
      explore: "Explorer",
      allStays: "Toutes les propriétés",
      riads: "Riads",
      villas: "Villas",
      apartments: "Appartements",
      reach: "Nous joindre",
      rights: "Tous droits réservés",
      terms: "Conditions",
      privacy: "Confidentialité",
      cookies: "Cookies",
    },
    language: { label: "Langue" },
    detail: {
      back: "Retour aux propriétés",
      share: "Partager",
      save: "Enregistrer",
      viewAllPhotos: "Voir les {n} photos",
      aboutTitle: "À propos de cet endroit",
      amenitiesTitle: "Ce que cet endroit offre",
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
        "Bonjour NEXTWIN, je souhaite des informations sur {property} (du {from} au {to}, {guests} personnes). Merci !",
      noChargeYet: "Aucun débit pour le moment — confirmation instantanée par email.",
      cleaningFee: "Frais de ménage",
      serviceFee: "Frais de service",
      total: "Total",
      freeCancellation: "Annulation gratuite jusqu'à 7 jours avant l'arrivée.",
      nightSingular: "nuit",
      nightPlural: "nuits",
      selectDatesHint: "Sélectionnez vos dates",
    },
    reviews: {
      showAll: "Voir les {n} avis",
      reviewsLabel: "avis",
    },
    availability: {
      title: "Jours disponibles",
      legendAvailable: "Disponible",
      legendBooked: "Réservé",
      legendPast: "Passé",
    },
    map: {
      title: "Emplacement",
      privacyHint: "Zone approximative (~{n} m)",
      noLocation: "Adresse exacte communiquée après confirmation.",
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
        "Pourquoi NEXTWIN existe — et comment nous choisissons les logements proposés sur la plateforme.",
      heroEyebrow: "À propos de NEXTWIN",
      heroTitle: "Nous choisissons les logements que nous enverrions à nos amis.",
      heroSubtitle:
        "Pas de listes superflues, pas d'inventaire gonflé. Chaque propriété sur NEXTWIN est visitée, vérifiée, et associée à un hôte qui répond vraiment.",
      storyTitle: "Construit à Marrakech, par des gens qui y vivent.",
      storyP1:
        "NEXTWIN est né d'une frustration simple : les amis de passage à Marrakech finissaient dans des endroits qui ne ressemblaient en rien aux photos. Nous avons donc commencé une petite liste de riads, villas et appartements que nous recommandions vraiment — des propriétaires en qui nous avions confiance, des portes auxquelles nous avions personnellement frappé, des hôtes qui décrochaient le téléphone.",
      storyP2:
        "Trois ans plus tard, la liste reste petite à dessein. Nous préférons quatre-vingts logements que nous connaissons par cœur plutôt que huit mille que nous n'avons jamais vus. Si un endroit cesse de nous convenir, il est retiré. Si un hôte cesse de répondre dans l'heure, il est retiré aussi.",
      storyP3:
        "Nous ne faisons qu'une chose — nous vous aidons à trouver le bon endroit où séjourner à Marrakech, et nous aidons les bons hôtes à trouver de bons clients. C'est tout.",
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
      about: "About",
      contact: "Contact us",
      bookCta: "Book a stay",
      toggleMenu: "Toggle menu",
    },
    logo: { tagline: "Stays" },
    hero: {
      subtitle: "Your holiday rental in Marrakech.",
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
      clearDates: "Clear dates",
      apply: "Apply",
      close: "Close",
      prevMonth: "Previous month",
      nextMonth: "Next month",
    },
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    home: {
      sectionTitle: "Our best properties",
      bookingSimpleTitle: "Booking made simple",
      bookingSimpleSubtitle:
        "Three steps from search to keys-in-hand — with a real person on call when you need one.",
      stepCuratedTitle: "Curated stays",
      stepCuratedBody:
        "Every property is visited and approved before it goes online. No surprises on arrival.",
      stepCancelTitle: "Free cancellation",
      stepCancelBody:
        "Plans change. Cancel up to 7 days before arrival on most stays — no questions asked.",
      stepConciergeTitle: "Local concierge",
      stepConciergeBody:
        "A real local on WhatsApp from the moment you book to the day you fly home.",
      closerTitle: "Stay closer to the city you came for",
      closerBody:
        "From riads inside the Medina to garden villas in the Palmeraie, our places are chosen for the same thing: you walk out the door and you're already there. No long taxi transfers, no resort bubbles — just the city.",
      closerCta: "Browse all stays",
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
    },
    card: {
      guests: "guests",
      bedrooms: "bedrooms",
      bathrooms: "bathrooms",
    },
    amenity: {
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
    },
    footer: {
      blurb:
        "A curated selection of stays in Marrakech — riads, villas and apartments chosen for their design, comfort, and the warm welcome of their hosts.",
      explore: "Browse",
      allStays: "All properties",
      riads: "Riads",
      villas: "Villas",
      apartments: "Apartments",
      reach: "Reach us",
      rights: "All rights reserved",
      terms: "Terms",
      privacy: "Privacy",
      cookies: "Cookies",
    },
    language: { label: "Language" },
    detail: {
      back: "Back to all stays",
      share: "Share",
      save: "Save",
      viewAllPhotos: "View all {n} photos",
      aboutTitle: "About this place",
      amenitiesTitle: "What this place offers",
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
        "Hello NEXTWIN, I'd like information on {property} (from {from} to {to}, {guests} guests). Thanks!",
      noChargeYet: "You won't be charged yet — instant confirmation by email.",
      cleaningFee: "Cleaning fee",
      serviceFee: "Service fee",
      total: "Total",
      freeCancellation: "Free cancellation up to 7 days before arrival.",
      nightSingular: "night",
      nightPlural: "nights",
      selectDatesHint: "Select your dates",
    },
    reviews: {
      showAll: "Show all {n} reviews",
      reviewsLabel: "reviews",
    },
    availability: {
      title: "Available days",
      legendAvailable: "Available",
      legendBooked: "Booked",
      legendPast: "Past",
    },
    map: {
      title: "Location",
      privacyHint: "Approximate area (~{n} m)",
      noLocation: "Exact address shared after confirmation.",
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
        "Why NEXTWIN exists — and how we choose the stays we put on the platform.",
      heroEyebrow: "About NEXTWIN",
      heroTitle: "We choose the stays we'd send our friends to.",
      heroSubtitle:
        "No filler listings, no padded inventory. Every property on NEXTWIN is visited, vetted, and matched with a host who actually answers the door.",
      storyTitle: "Built in Marrakech, by people who live here.",
      storyP1:
        "NEXTWIN started with a simple frustration: friends visiting Marrakech kept ending up in places that looked nothing like the photos. So we started a small list of riads, villas, and apartments we'd actually recommend — owners we trusted, doors we'd personally knocked on, hosts who picked up the phone.",
      storyP2:
        "Three years on, the list is still small on purpose. We'd rather have eighty stays we know inside out than eight thousand we've never seen. If a place stops feeling right, it comes off. If a host stops replying within an hour, they're off too.",
      storyP3:
        "We do one thing — we help you find the right place to stay in Marrakech, and we help the right hosts find good guests. That's it.",
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
      about: "حول",
      contact: "اتصل بنا",
      bookCta: "احجز",
      toggleMenu: "فتح القائمة",
    },
    logo: { tagline: "إقامات" },
    hero: {
      subtitle: "إيجارك للعطلات في مراكش.",
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
      clearDates: "مسح التواريخ",
      apply: "تطبيق",
      close: "إغلاق",
      prevMonth: "الشهر السابق",
      nextMonth: "الشهر التالي",
    },
    weekdays: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
    home: {
      sectionTitle: "أفضل عقاراتنا",
      bookingSimpleTitle: "حجز مبسط",
      bookingSimpleSubtitle:
        "ثلاث خطوات بين البحث وتسلّم المفاتيح — وشخص حقيقي يجيبك عند الحاجة.",
      stepCuratedTitle: "إقامات منتقاة",
      stepCuratedBody:
        "نزور كل عقار ونوافق عليه قبل نشره. لا مفاجآت عند الوصول.",
      stepCancelTitle: "إلغاء مجاني",
      stepCancelBody:
        "الخطط تتغير. ألغِ حتى ٧ أيام قبل الوصول في معظم الإقامات بدون أسئلة.",
      stepConciergeTitle: "خدمة محلية",
      stepConciergeBody:
        "محلي حقيقي على واتساب من لحظة الحجز إلى يوم المغادرة.",
      closerTitle: "أقم في قلب المدينة التي جئت لزيارتها",
      closerBody:
        "من رياضات المدينة العتيقة إلى فلل النخيل، عقاراتنا تجمعها فكرة واحدة: تخطو خطوة وتجد نفسك في قلب المدينة. بدون نقل طويل، بدون فقاعات سياحية — فقط المدينة.",
      closerCta: "تصفح كل العقارات",
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
    },
    card: {
      guests: "ضيوف",
      bedrooms: "غرف",
      bathrooms: "حمامات",
    },
    amenity: {
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
    },
    footer: {
      blurb:
        "تشكيلة منتقاة من الإقامات في مراكش — رياضات وفلل وشقق مختارة لأناقتها وراحتها وحُسن استقبال مستضيفيها.",
      explore: "استكشف",
      allStays: "كل العقارات",
      riads: "الرياضات",
      villas: "الفلل",
      apartments: "الشقق",
      reach: "اتصل بنا",
      rights: "جميع الحقوق محفوظة",
      terms: "الشروط",
      privacy: "الخصوصية",
      cookies: "ملفات تعريف الارتباط",
    },
    language: { label: "اللغة" },
    detail: {
      back: "العودة إلى العقارات",
      share: "مشاركة",
      save: "حفظ",
      viewAllPhotos: "عرض جميع الصور ({n})",
      aboutTitle: "حول هذا المكان",
      amenitiesTitle: "ما يقدمه هذا المكان",
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
        "مرحباً NEXTWIN، أود الحصول على معلومات بخصوص {property} (من {from} إلى {to}، {guests} أشخاص). شكراً!",
      noChargeYet: "لا توجد رسوم حتى الآن — تأكيد فوري عبر البريد الإلكتروني.",
      cleaningFee: "رسوم التنظيف",
      serviceFee: "رسوم الخدمة",
      total: "المجموع",
      freeCancellation: "إلغاء مجاني حتى 7 أيام قبل الوصول.",
      nightSingular: "ليلة",
      nightPlural: "ليالٍ",
      selectDatesHint: "اختر تواريخك",
    },
    reviews: {
      showAll: "عرض جميع التقييمات ({n})",
      reviewsLabel: "تقييم",
    },
    availability: {
      title: "الأيام المتاحة",
      legendAvailable: "متاح",
      legendBooked: "محجوز",
      legendPast: "ماضٍ",
    },
    map: {
      title: "الموقع",
      privacyHint: "منطقة تقريبية (~{n} م)",
      noLocation: "العنوان الدقيق يُرسل بعد التأكيد.",
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
      metaDescription: "لماذا وُجدت NEXTWIN — وكيف نختار الإقامات التي نضعها على المنصة.",
      heroEyebrow: "حول NEXTWIN",
      heroTitle: "نختار الإقامات التي سنرسل إليها أصدقاءنا.",
      heroSubtitle:
        "لا قوائم حشو، ولا مخزون منتفخ. كل عقار على NEXTWIN يُزار، ويُتحقق منه، ويُرتبط بمضيف يفتح الباب فعلاً.",
      storyTitle: "بُنيت في مراكش، من قبل أناس يعيشون هنا.",
      storyP1:
        "بدأت NEXTWIN من إحباط بسيط: الأصدقاء الذين يزورون مراكش كانوا ينتهون في أماكن لا تشبه الصور إطلاقاً. فبدأنا قائمة صغيرة من الرياضات والفلل والشقق التي نوصي بها فعلاً — مالكون نثق بهم، أبواب طرقناها بأنفسنا، مضيفون يردون على الهاتف.",
      storyP2:
        "بعد ثلاث سنوات، القائمة لا تزال صغيرة عمداً. نفضّل ثمانين إقامة نعرفها جيداً على ثمانية آلاف لم نرها أبداً. إذا توقف مكان عن الإحساس بالصواب، يُرفع. إذا توقف مضيف عن الرد خلال ساعة، يُرفع أيضاً.",
      storyP3:
        "نقوم بشيء واحد — نساعدك في العثور على المكان المناسب للإقامة في مراكش، ونساعد المضيفين الجيدين في العثور على ضيوف جيدين. هذا كل شيء.",
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
