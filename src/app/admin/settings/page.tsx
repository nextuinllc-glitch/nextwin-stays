import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return (
    <div>
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Paramètres du site</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Coordonnées de contact, copy multilingue, frais de séjour. Les changements
          s&apos;appliquent au site public et au calculateur de prix.
        </p>
      </header>

      <div className="mt-6">
        <SettingsForm
          initial={{
            heroSubtitleFr: settings.heroSubtitleFr,
            heroSubtitleEn: settings.heroSubtitleEn,
            heroSubtitleAr: settings.heroSubtitleAr,
            heroImage: settings.heroImage,
            heroVideoDesktop: settings.heroVideoDesktop,
            heroVideoMobile: settings.heroVideoMobile,
            whatsappNumber: settings.whatsappNumber,
            email: settings.email,
            phone: settings.phone,
            addressLine: settings.addressLine,
            footerBlurbFr: settings.footerBlurbFr,
            footerBlurbEn: settings.footerBlurbEn,
            footerBlurbAr: settings.footerBlurbAr,
            cleaningFee: settings.cleaningFee,
            serviceFeeRate: settings.serviceFeeRate,
          }}
        />
      </div>
    </div>
  );
}
