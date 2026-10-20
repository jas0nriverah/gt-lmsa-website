import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://www.gt-lmsa.com"),
  title: {
    default:
      "LMSA Plus Chapter at Georgia Tech | Latino Medical Student Association",
    template: "%s | LMSA Plus at Georgia Tech",
  },
  description:
    "The Latino Medical Student Association Plus Chapter at Georgia Tech supports Latino/Hispanic and underrepresented pre-health students through mentorship, medical school preparation, service, and community.",
  keywords: [
    "LMSA",
    "LMSA Plus",
    "Georgia Tech",
    "Latino Medical Student Association",
    "Latino Hispanic pre-health",
    "pre-health",
    "pre-med",
    "mentorship",
    "medical school",
  ],
  openGraph: {
    title:
      "LMSA Plus Chapter at Georgia Tech | Latino Medical Student Association",
    description:
      "Supporting Latino/Hispanic and underrepresented pre-health students through mentorship, preparation, service, and community.",
    type: "website",
    url: "https://www.gt-lmsa.com",
    siteName: "LMSA Plus at Georgia Tech",
    images: [
      {
        url: "/lmsa-logo.png",
        width: 1024,
        height: 1024,
        alt: "Latino Medical Student Association logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "LMSA Plus at Georgia Tech",
    description:
      "A Georgia Tech community for pre-health students, focused on mentorship, service, and connection.",
    images: ["/lmsa-logo.png"],
  },
  icons: {
    icon: "/lmsa-logo.png",
    apple: "/lmsa-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#003057",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
