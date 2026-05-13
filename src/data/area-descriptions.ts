// Neighborhood copy keyed by `Property.area` — same content shared
// across every property in that part of Marrakech. Each entry holds
// a short blurb (used inline under the map, truncated with a "Read
// more" affordance) and a longer "Getting around" paragraph shown
// inside the full-screen modal. Translations live alongside so the
// locale switcher picks the right copy automatically.
//
// Adding a new area: add a record under each locale. Areas with no
// entry fall back to a generic "central Marrakech" blurb so the
// section never renders empty.

type Localized = {
  fr: string;
  en: string;
  ar: string;
};

type AreaCopy = {
  neighborhood: Localized;
  gettingAround: Localized;
};

const FALLBACK: AreaCopy = {
  neighborhood: {
    fr: "Au cœur de Marrakech, à proximité immédiate des restaurants, commerces et grands axes de la ville.",
    en: "In the heart of Marrakech, a short walk from restaurants, shops and the city's main thoroughfares.",
    ar: "في قلب مراكش، على بُعد خطوات من المطاعم والمحلات والشوارع الرئيسية للمدينة.",
  },
  gettingAround: {
    fr: "Tout est accessible à pied dans le quartier. Les taxis sont rapides et bon marché pour le centre, et la médina est à dix minutes en voiture.",
    en: "Everything in the neighborhood is reachable on foot. Taxis to the city centre are cheap and quick, and the Medina is ten minutes by car.",
    ar: "كل شيء في الحي يمكن الوصول إليه سيراً على الأقدام. سيارات الأجرة سريعة ورخيصة للوصول إلى وسط المدينة، والمدينة القديمة على بُعد عشر دقائق بالسيارة.",
  },
};

const AREAS: Record<string, AreaCopy> = {
  Medina: {
    neighborhood: {
      fr: "Au cœur historique de Marrakech, entre la place Jemaa el-Fna, les souks et les madrasas. Vous serez au plus près du rythme de la médina sans en subir le tumulte : rues calmes en journée, animation à deux pas le soir.",
      en: "In the historic heart of Marrakech, between Jemaa el-Fna square, the souks and the madrasas. You'll be right by the rhythm of the medina without the crowd: quiet streets by day, the buzz a few steps away in the evening.",
      ar: "في القلب التاريخي لمراكش، بين ساحة جامع الفنا والأسواق والمدارس. ستكون قريباً من إيقاع المدينة القديمة دون ضوضاء: شوارع هادئة نهاراً، والنشاط على بُعد خطوات في المساء.",
    },
    gettingAround: {
      fr: "Le quartier se découvre exclusivement à pied — les voitures ne circulent pas dans les ruelles. Les taxis et calèches s'arrêtent aux portes de la médina (Bab Doukkala, Bab Agnaou) à cinq minutes de marche. Comptez vingt minutes en voiture pour l'aéroport.",
      en: "The neighborhood is explored entirely on foot — cars can't enter the alleyways. Taxis and horse-drawn carriages wait at the gates (Bab Doukkala, Bab Agnaou), a five-minute walk away. The airport is twenty minutes by car.",
      ar: "يتم استكشاف الحي سيراً على الأقدام فقط - لا تدخل السيارات الأزقة. تتوقف سيارات الأجرة والعربات عند أبواب المدينة (باب الدكالة، باب أكناو) على بُعد خمس دقائق سيراً. المطار على بُعد عشرين دقيقة بالسيارة.",
    },
  },
  Kasbah: {
    neighborhood: {
      fr: "Quartier historique de la dynastie saadienne, plus calme que la médina centrale et bordé de palais. Le Palais Royal, les tombeaux Saadiens et la place des Ferblantiers sont à dix minutes à pied.",
      en: "Historic quarter of the Saadian dynasty — quieter than the central medina, lined with palaces. The Royal Palace, the Saadian Tombs and the Place des Ferblantiers are all a ten-minute walk away.",
      ar: "حي تاريخي يعود للسلالة السعدية، أهدأ من قلب المدينة القديمة وتحيط به القصور. القصر الملكي وأضرحة السعديين وساحة الفرنانة على بُعد عشر دقائق سيراً.",
    },
    gettingAround: {
      fr: "À pied pour tout ce qui se trouve dans la médina (palais, souks, jardins de la Mamounia). Les taxis vous emmènent à Gueliz ou à l'aéroport en moins de quinze minutes.",
      en: "On foot for everything inside the medina (palaces, souks, the Mamounia gardens). Taxis reach Gueliz or the airport in under fifteen minutes.",
      ar: "سيراً على الأقدام لكل ما يقع داخل المدينة القديمة (القصور، الأسواق، حدائق المامونية). تصل سيارات الأجرة إلى جليز أو المطار في أقل من خمس عشرة دقيقة.",
    },
  },
  Palmeraie: {
    neighborhood: {
      fr: "À vingt minutes du centre, l'oasis des Marrakchis. Cent mille palmiers, des villas dispersées, des oliveraies et un calme rare pour la région. C'est le quartier des séjours nature et bien-être, sans renoncer à la proximité du centre.",
      en: "Twenty minutes from the centre, Marrakech's oasis. A hundred thousand palm trees, scattered villas, olive groves and a rare calm. This is the neighborhood for nature and wellness stays, while still close enough to town.",
      ar: "على بُعد عشرين دقيقة من وسط المدينة، واحة المراكشيين. مئة ألف نخلة، فيلات متفرقة، بساتين الزيتون، وهدوء نادر. هذا حي إقامات الطبيعة والاستجمام مع البقاء قريباً من المدينة.",
    },
    gettingAround: {
      fr: "Une voiture (ou un taxi) est nécessaire pour rejoindre le centre. Vingt minutes pour la médina, vingt-cinq pour Gueliz, trente pour l'aéroport. Beaucoup d'hôtes proposent un transfert privé.",
      en: "A car (or taxi) is needed to reach the centre. Twenty minutes to the medina, twenty-five to Gueliz, thirty to the airport. Many hosts offer a private transfer service.",
      ar: "تحتاج إلى سيارة (أو سيارة أجرة) للوصول إلى وسط المدينة. عشرون دقيقة للمدينة القديمة، خمس وعشرون لجليز، ثلاثون للمطار. يوفر العديد من المضيفين خدمة نقل خاصة.",
    },
  },
  Gueliz: {
    neighborhood: {
      fr: "Le quartier moderne et créatif de Marrakech — galeries d'art, concept-stores, cafés de spécialité et restaurants contemporains. Le jardin Majorelle et le musée Yves Saint Laurent sont à dix minutes à pied. C'est l'adresse des séjours urbains.",
      en: "Marrakech's modern, creative neighborhood — art galleries, concept stores, speciality coffee shops and contemporary restaurants. The Majorelle Garden and the Yves Saint Laurent museum are a ten-minute walk away. The address for urban stays.",
      ar: "حي مراكش العصري والإبداعي - معارض فنية، متاجر مختارة، مقاهي قهوة مختصة، ومطاعم عصرية. حديقة ماجوريل ومتحف إيف سان لوران على بُعد عشر دقائق سيراً. عنوان الإقامات الحضرية.",
    },
    gettingAround: {
      fr: "Tout se fait à pied : commerces, restaurants et galeries sont dans un rayon de cinq minutes. La médina est à dix minutes en taxi ou trente minutes à pied. Aéroport à quinze minutes en voiture.",
      en: "Everything's on foot: shops, restaurants and galleries within a five-minute radius. The medina is ten minutes by taxi, or thirty minutes on foot. Airport fifteen minutes by car.",
      ar: "كل شيء سيراً على الأقدام: المحلات والمطاعم والمعارض في نطاق خمس دقائق. المدينة القديمة على بُعد عشر دقائق بسيارة الأجرة أو ثلاثين دقيقة سيراً. المطار على بُعد خمس عشرة دقيقة بالسيارة.",
    },
  },
  "Sidi Abdallah Ghiat": {
    neighborhood: {
      fr: "À la lisière sud de Marrakech, un quartier paisible bordé d'oliveraies et de villas à l'écart de l'agitation. Idéal pour un séjour orienté détente, avec la médina à dix minutes en voiture quand l'envie de souks vous prend.",
      en: "On Marrakech's southern edge, a calm neighborhood lined with olive groves and villas away from the bustle. Ideal for a relaxation-focused stay, with the medina ten minutes away by car when you fancy the souks.",
      ar: "على الحافة الجنوبية لمراكش، حي هادئ تحيط به بساتين الزيتون والفيلات بعيداً عن الازدحام. مثالي لإقامة تركز على الاسترخاء، مع المدينة القديمة على بُعد عشر دقائق بالسيارة عند الرغبة في زيارة الأسواق.",
    },
    gettingAround: {
      fr: "Voiture indispensable. Dix minutes pour la médina, quinze pour Gueliz, vingt pour l'aéroport. Vélo électrique disponible chez la plupart des hôtes pour les sorties dans les oliveraies.",
      en: "A car is essential. Ten minutes to the medina, fifteen to Gueliz, twenty to the airport. Electric bikes are usually available from the hosts for rides through the olive groves.",
      ar: "السيارة ضرورية. عشر دقائق للمدينة القديمة، خمس عشرة لجليز، عشرون للمطار. دراجات كهربائية متوفرة عادة لدى المضيفين للجولات في بساتين الزيتون.",
    },
  },
  "Route de l'Ourika": {
    neighborhood: {
      fr: "Sur l'axe qui mène vers l'Atlas et les cascades d'Ourika, à vingt minutes du centre de Marrakech. Une région privilégiée pour les villas avec vue sur la chaîne montagneuse — ouverture franche sur la nature sans renoncer à la ville.",
      en: "On the road heading toward the Atlas and the Ourika waterfalls, twenty minutes from central Marrakech. A favoured stretch for villas with mountain views — full nature without giving up the city.",
      ar: "على الطريق المؤدي إلى جبال الأطلس وشلالات أوريكا، على بُعد عشرين دقيقة من وسط مراكش. منطقة مفضلة للفيلات بإطلالة على الجبال - طبيعة كاملة دون التخلي عن المدينة.",
    },
    gettingAround: {
      fr: "Voiture privée recommandée — c'est l'occasion d'explorer la vallée de l'Ourika et les villages berbères. Vingt minutes pour la médina, vingt-cinq pour l'aéroport. Plusieurs hôtes proposent un chauffeur à la demi-journée.",
      en: "A private car is recommended — a chance to explore the Ourika valley and the Berber villages. Twenty minutes to the medina, twenty-five to the airport. Several hosts offer a half-day driver on request.",
      ar: "يوصى بسيارة خاصة - فرصة لاستكشاف وادي أوريكا والقرى الأمازيغية. عشرون دقيقة للمدينة القديمة، خمس وعشرون للمطار. يوفر عدة مضيفين سائقاً لنصف يوم عند الطلب.",
    },
  },
};

export type LocaleKey = "fr" | "en" | "ar";

export function getAreaCopy(area: string): AreaCopy {
  return AREAS[area] ?? FALLBACK;
}

// Pretty-formatted "Marrakech, Marrakesh-Safi, Maroc" sub-line under
// the map title. Translates the region + country to the active locale.
const REGION_LABEL: Record<LocaleKey, string> = {
  fr: "Marrakech-Safi, Maroc",
  en: "Marrakesh-Safi, Morocco",
  ar: "مراكش آسفي، المغرب",
};

export function formatLocationLine(city: string, locale: LocaleKey): string {
  return `${city}, ${REGION_LABEL[locale]}`;
}
