import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SITE_URL, SITE_NAME, hreflangAlternates } from "@/lib/seo";
import { getContactSettings } from "@/lib/settings-repo";

// Airbnb / Menara style: Inter everywhere, no display serif. The display
// CSS variable still resolves so existing `font-display` classes inherit
// the same Inter face — they just render in bold weight, no font swap.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const display = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

const HOME_TITLE =
  "NEXTWIN STAY — Locations à Marrakech : riads, villas et appartements de luxe";
const HOME_DESCRIPTION =
  "Réservez des riads, villas et appartements de luxe à Marrakech. Sélection NEXTWIN STAY, confirmation instantanée, conciergerie locale 7j/7.";

export const metadata: Metadata = {
  // metadataBase fixes relative og:image URLs and canonical resolution.
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s · NEXTWIN STAY",
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "location Marrakech",
    "riad Marrakech",
    "villa Marrakech",
    "appartement Marrakech",
    "location vacances Marrakech",
    "Gueliz",
    "Médina",
    "Palmeraie",
    "NEXTWIN STAY",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  alternates: {
    canonical: "/",
    languages: hreflangAlternates("/"),
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    locale: "fr_FR",
    alternateLocale: ["en_GB", "ar_MA"],
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Locations de luxe à Marrakech — NEXTWIN STAY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og-default.jpg"],
  },
  robots: { index: true, follow: true },
};

// Explicit viewport — without this, Safari on smaller iPhones (11 Pro,
// SE, mini at 375 px) sometimes renders the page with an inflated
// initial scale, which reads as "everything looks zoomed". Locking
// width to the device + initialScale 1 forces 1:1 CSS-px-to-screen.
// maximumScale stays at 5 so accessibility pinch-zoom keeps working.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF385C",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Contact info threaded into the Footer (and into the public site's
  // other surfaces from their own server pages). The DB is queried once
  // per request in dev; in production this is baked at static-export
  // build time.
  const contact = await getContactSettings();
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream-50">
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer contact={contact} />
        </I18nProvider>
      </body>
    </html>
  );
}
