import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PRITHVI SENTINEL — Satellite Fire Detection",
    template: "%s · PRITHVI SENTINEL",
  },
  description:
    "Satellite-powered crop-residue & forest burn detection dashboard for the Indian agrarian regions. Sentinel-2 acquisition, CNN inference, and enforcement dispatch.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "PRITHVI SENTINEL — Satellite Fire Detection",
    description:
      "Satellite-powered crop-residue & forest burn detection dashboard for the Indian agrarian regions.",
    type: "website",
    siteName: "PRITHVI SENTINEL",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "dark min-h-full antialiased",
        geistMono.variable,
        archivoBlack.variable,
        instrumentSerif.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col bg-black text-[#F2F2F2]">{children}</body>
    </html>
  );
}