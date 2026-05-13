// One-shot translator: pushes FR and AR translations of every
// property's short + long description into Supabase so the locale
// switcher actually swaps the language. The EN seed values are
// kept verbatim — they're authoritative.
//
//   Run:  node prisma/scripts/translate-descriptions.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Keyed by slug. Each entry has matching short / full descriptions in
// FR and AR. The English source lives in `prisma/seed.ts` and is the
// single source of truth — these are hand-crafted translations rather
// than machine output so the brand voice stays consistent.
const TRANSLATIONS = {
  "riad-jardin-secret": {
    shortFr:
      "Riad authentique au cœur de la Médina, avec piscine privée et cour de palmiers.",
    descFr:
      "Riad du XIXe siècle restauré avec soin, organisé autour d'une cour aux palmiers centenaires et d'une piscine privée. Les chambres sont décorées de tadelakt, zelliges et boiseries sculptées, dans le respect de l'artisanat marocain. Petit-déjeuner servi sur le rooftop, ouvert sur la Koutoubia. À cinq minutes à pied de la place Jemaa el-Fna.",
    shortAr:
      "رياض أصيل في قلب المدينة القديمة، مع مسبح خاص وفناء النخيل.",
    descAr:
      "رياض من القرن التاسع عشر تم ترميمه بعناية، يتمحور حول فناء يضم أشجار نخيل عمرها قرون ومسبح خاص. تم تزيين الغرف بالتدلكت والزليج والخشب المنحوت احتراماً للحرفية المغربية. يُقدّم الإفطار على السطح المطل على الكتبية. على بُعد خمس دقائق سيراً على الأقدام من ساحة جامع الفنا.",
  },
  "villa-palmeraie-oasis": {
    shortFr:
      "Villa contemporaine dans la Palmeraie : piscine chauffée, jardin privé, calme absolu.",
    descFr:
      "Villa de plain-pied conçue par un architecte marrakchi, entourée de 3000 m² d'oliveraies et de bougainvilliers. La piscine chauffée toute l'année donne sur une terrasse abritée du vent par un long mur en pisé. Cuisine ouverte entièrement équipée, salon avec cheminée, six chambres ensuite avec accès direct au jardin. Conciergerie dédiée et possibilité de chef à la demande.",
    shortAr:
      "فيلا عصرية في النخيل: مسبح مُدفأ، حديقة خاصة، وهدوء تام.",
    descAr:
      "فيلا من طابق واحد صممها مهندس مراكشي، محاطة بـ 3000 م² من أشجار الزيتون والجهنمية. يُطل المسبح المُدفأ على مدار السنة على تراس محمي من الرياح بجدار طويل من الطين. مطبخ مفتوح مجهز بالكامل، صالة مع موقد، ست غرف نوم ذات حمامات داخلية تطل مباشرة على الحديقة. خدمة كونسيرج مخصصة وإمكانية طلب طاهٍ.",
  },
  "gueliz-modern-loft": {
    shortFr:
      "Loft design lumineux à Gueliz, à huit minutes à pied du jardin Majorelle.",
    descFr:
      "Loft de 90 m² au troisième étage d'un immeuble Art déco rénové, en plein cœur du Gueliz. Volumes généreux, parquet d'origine, mobilier signé Studio KO, cuisine ouverte sur le séjour. La rue regroupe la plupart des bonnes adresses contemporaines de la ville : galeries, concept-stores et cafés de spécialité. Le jardin Majorelle et le musée Yves Saint Laurent sont à huit minutes à pied.",
    shortAr:
      "لوفت بتصميم عصري ومُضيء في جليز، على بُعد ثماني دقائق سيراً من حديقة ماجوريل.",
    descAr:
      "لوفت بمساحة 90 م² في الطابق الثالث من مبنى آرت ديكو مُجدّد، في قلب حي جليز. مساحات واسعة، أرضية خشبية أصلية، أثاث من توقيع استوديو كي أو، ومطبخ مفتوح على غرفة المعيشة. يضم الشارع معظم الوجهات العصرية في المدينة: المعارض الفنية، المتاجر المختارة، ومقاهي القهوة المختصة. حديقة ماجوريل ومتحف إيف سان لوران على بُعد ثماني دقائق سيراً.",
  },
  "riad-medina-rooftop": {
    shortFr:
      "Riad classé avec rooftop panoramique et trois suites ensuite, en plein Médina.",
    descFr:
      "Trois suites avec salle de bain privative s'organisent autour d'une cour à bassin central, le tout couronné par un rooftop offrant une vue à 360° sur l'Atlas et les minarets de la vieille ville. Petit-déjeuner servi à l'étage ou sur la terrasse selon votre choix, accès au hammam traditionnel sur demande. La place Jemaa el-Fna est à dix minutes de marche par les souks.",
    shortAr:
      "رياض مُصنّف بسطح بانورامي وثلاثة أجنحة كاملة، في قلب المدينة القديمة.",
    descAr:
      "ثلاثة أجنحة بحمامات خاصة تتمحور حول فناء بحوض مركزي، ويعلوها سطح يوفر إطلالة 360 درجة على جبال الأطلس ومآذن المدينة القديمة. يُقدّم الإفطار في الطابق العلوي أو على التراس حسب اختياركم، مع إمكانية الوصول إلى الحمام التقليدي عند الطلب. ساحة جامع الفنا على بُعد عشر دقائق سيراً عبر الأسواق.",
  },
  "villa-atlas-views": {
    shortFr:
      "Villa avec piscine à débordement face à l'Atlas et court de tennis privé.",
    descFr:
      "Villa contemporaine de 600 m² posée sur un terrain de 5000 m², à vingt minutes du centre. La piscine à débordement, orientée plein sud, fait face à la chaîne du Haut Atlas — vue dégagée sur les sommets enneigés en hiver. Six chambres avec salle de bain, salon traversant avec cheminée, cuisine ouverte sur la terrasse couverte. Court de tennis, salle de sport et concierge sur place.",
    shortAr:
      "فيلا بمسبح لا متناهٍ يطل على جبال الأطلس وملعب تنس خاص.",
    descAr:
      "فيلا عصرية بمساحة 600 م² على أرض مساحتها 5000 م²، على بُعد عشرين دقيقة من وسط المدينة. المسبح اللامتناهي الموجه نحو الجنوب يطل على سلسلة جبال الأطلس الكبير - إطلالة مفتوحة على القمم المُغطاة بالثلج في الشتاء. ست غرف نوم بحمامات خاصة، صالة مفتوحة مع موقد، ومطبخ مفتوح على التراس المُغطى. ملعب تنس، صالة رياضية، وخدمة كونسيرج في الموقع.",
  },
  "kasbah-style-apartment": {
    shortFr:
      "Appartement de caractère dans la Kasbah, terrasse privée à dix minutes du Palais Royal.",
    descFr:
      "Appartement d'une chambre dans un bâtiment restauré de la Kasbah, à quelques rues calmes du Palais Royal et des tombeaux Saadiens. Murs en tadelakt teinté à la main, petite terrasse privée avec vue sur la ville et cuisine assez grande pour préparer le petit-déjeuner. Idéal pour un séjour à deux qui cherche le charme de la Médina sans le passage des touristes.",
    shortAr:
      "شقة ذات طابع مميز في القصبة، تراس خاص على بُعد عشر دقائق من القصر الملكي.",
    descAr:
      "شقة بغرفة نوم واحدة في مبنى مُرمَّم بالقصبة، على بُعد بضعة شوارع هادئة من القصر الملكي وأضرحة السعديين. جدران من التدلكت المصبوغ يدوياً، تراس صغير خاص يطل على المدينة، ومطبخ كبير بما يكفي لتحضير الإفطار. مثالية لإقامة ثنائية تبحث عن سحر المدينة القديمة دون ازدحام السياح.",
  },
  "riad-citrus-courtyard": {
    shortFr:
      "Riad familial à la cour aux orangers, petit-déjeuner marocain inclus.",
    descFr:
      "Riad de quatre chambres organisé autour d'une cour plantée d'orangers et de citronniers en fruit. Petit-déjeuner marocain complet inclus chaque matin (msemen, baghrir, jus pressés, miel et thé à la menthe). Cuisine accessible aux hôtes pour les autres repas, salon avec coussins berbères et cheminée, rooftop pour le coucher de soleil. Conciergerie sur place toute la journée.",
    shortAr:
      "رياض عائلي بفناء من أشجار البرتقال، مع إفطار مغربي مُدرج.",
    descAr:
      "رياض من أربع غرف يتمحور حول فناء مزروع بأشجار البرتقال والليمون المُثمرة. إفطار مغربي كامل مُدرج كل صباح (مسمن، بغرير، عصائر طازجة، عسل، وأتاي بالنعناع). يمكن للضيوف الوصول إلى المطبخ لتحضير وجبات أخرى، صالة بوسائد أمازيغية وموقد، وسطح لمشاهدة غروب الشمس. خدمة كونسيرج في الموقع طوال اليوم.",
  },
  "villa-bohemian-retreat": {
    shortFr:
      "Villa bohème avec hammam privé et piscine d'eau salée, à la lisière de la Palmeraie.",
    descFr:
      "Maison d'esprit bohème à dix minutes du centre, mêlant matériaux bruts, tapis vintage et pièces chinées chez les antiquaires de la ville. Le hammam privé en tadelakt est chauffé sur demande, la piscine d'eau salée est entourée d'un grand jardin planté d'oliviers et de lavande. Quatre chambres, deux salons, cuisine ouverte sur la terrasse couverte, et un yoga deck pour les séances du matin.",
    shortAr:
      "فيلا بطابع بوهيمي مع حمام خاص ومسبح بمياه مالحة، على حافة منطقة النخيل.",
    descAr:
      "منزل ذو طابع بوهيمي على بُعد عشر دقائق من المركز، يجمع بين المواد الخام والسجاد القديم والقطع المُقتناة من تجار التحف في المدينة. الحمام الخاص المصنوع من التدلكت يُسخّن عند الطلب، والمسبح بالمياه المالحة محاط بحديقة كبيرة مزروعة بأشجار الزيتون واللافندر. أربع غرف نوم، صالتان، مطبخ مفتوح على التراس المُغطى، ومنصة لليوغا للجلسات الصباحية.",
  },
};

async function main() {
  for (const [slug, t] of Object.entries(TRANSLATIONS)) {
    const result = await prisma.property.updateMany({
      where: { slug },
      data: {
        shortDescriptionFr: t.shortFr,
        descriptionFr: t.descFr,
        shortDescriptionAr: t.shortAr,
        descriptionAr: t.descAr,
      },
    });
    console.log(
      `${slug.padEnd(28)} ${result.count > 0 ? "✓ FR + AR updated" : "✗ not found"}`,
    );
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
