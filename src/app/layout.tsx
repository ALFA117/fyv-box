import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Sans, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { HelpBot } from "@/components/HelpBot";
import { BRAND, siteUrl } from "@/lib/brand";
import "./globals.css";

// Sans técnica y legible para el cuerpo; serif sobria para títulos; mono para direcciones y hashes.
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex", weight: ["400", "500", "600", "700"], display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", weight: ["500", "600", "700"], style: ["normal", "italic"], display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plexmono", weight: ["400", "500"], display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: BRAND.navy,
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: [
    "estafas crypto", "phishing crypto", "seguridad web3", "Stellar", "testnet", "airdrops falsos",
    "ingeniería social", "educación financiera", "simulador de estafas", "CriptoUNAM", "credencial verificable",
  ],
  authors: [{ name: "CriptoUNAM" }],
  creator: "CriptoUNAM",
  publisher: "CriptoUNAM",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "black-translucent" },
};

// Aplica el tema guardado antes de pintar para evitar el destello del tema equivocado.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('fyv-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${plexSans.variable} ${sourceSerif.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="fyv-theme" strategy="beforeInteractive">{THEME_SCRIPT}</Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-md focus:bg-gold focus:px-4 focus:py-3 focus:text-on-gold"
        >
          Saltar al contenido
        </a>
        <ToastProvider>
          {children}
          <HelpBot />
        </ToastProvider>
      </body>
    </html>
  );
}
