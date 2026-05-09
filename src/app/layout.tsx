import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SITE_URL, SITE_NAME, hreflangAlternates } from "@/lib/seo";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream-50">
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          {/* Bottom padding on mobile so the floating nav doesn't sit
              over the last sliver of the footer / final section. */}
          <div className="pb-20 lg:pb-0">
            <Footer />
          </div>
          {/* Floating mobile bottom-nav pill — only renders on mobile and
              hides itself on routes that have their own sticky CTA. */}
          <MobileBottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
