import type { Metadata, Viewport } from "next";
import { Inter, Syne, IBM_Plex_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Syne: geométrica, moderna, crypto-native — reemplaza Playfair para armonía total
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-playfair", // mismo token, cero cambios en componentes
  weight: ["700", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1A33",
};

export const metadata: Metadata = {
  title: "FYV Box — Aprende a no caer en estafas crypto",
  description:
    "Onboarding seguro para Stellar: enfrenta simulacros reales y obtén una credencial de confianza on-chain al graduarte.",
  metadataBase: new URL("https://fyv-box.vercel.app"),
  openGraph: {
    title: "FYV Box",
    description: "Aprende, practica, certifícate. Stellar testnet.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${syne.variable} ${plexMono.variable}`}
      data-theme="dark"
    >
      <head>
        {/* Lee el tema de localStorage ANTES de que React hidrate → sin flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fyv-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
