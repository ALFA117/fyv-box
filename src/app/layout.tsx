import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
