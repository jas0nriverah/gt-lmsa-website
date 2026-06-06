import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

// Body font: clean, highly readable.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display/heading font: confident and modern for titles.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Georgia Tech LMSA | Latino Medical Student Association",
    template: "%s | Georgia Tech LMSA",
  },
  description:
    "The Latino Medical Student Association at Georgia Tech supports Latino/a/e and underrepresented pre-health students through mentorship, medical school preparation, service, and community.",
  keywords: [
    "LMSA",
    "Georgia Tech",
    "Latino Medical Student Association",
    "pre-health",
    "pre-med",
    "mentorship",
    "medical school",
  ],
  openGraph: {
    title: "Georgia Tech LMSA | Latino Medical Student Association",
    description:
      "Supporting Latino/a/e and underrepresented pre-health students through mentorship, preparation, service, and community.",
    type: "website",
  },
  icons: {
    icon: "/lmsa-logo.png",
    apple: "/lmsa-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
