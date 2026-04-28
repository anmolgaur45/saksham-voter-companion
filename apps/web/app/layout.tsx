import type { Metadata } from "next";
import {
  Inter,
  IBM_Plex_Sans_Devanagari,
  Noto_Sans_Tamil,
  Noto_Sans_Bengali,
} from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexDevanagari = IBM_Plex_Sans_Devanagari({
  weight: ["400", "500", "600"],
  subsets: ["devanagari"],
  variable: "--font-ibm-devanagari",
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  weight: ["400", "500"],
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  weight: ["400", "500"],
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saksham · Indian Voter Education",
  description:
    "Understand Indian elections in your language. Grounded in Election Commission of India sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexDevanagari.variable} ${notoSansTamil.variable} ${notoSansBengali.variable} antialiased`}
    >
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
