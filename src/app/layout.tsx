import type { Metadata, Viewport } from "next";
import "./globals.css";
import NextAppShell from "@/components/layout/NextAppShell";
import Providers from "@/app/providers";
import PasswordGate from "@/components/auth/PasswordGate";
import JsonLd from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yscapital.in";

export const viewport: Viewport = {
  themeColor: "#0047AB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YS CAPITAL | Digital Portfolio & Institutional Wealth Intelligence",
    template: "%s | YS CAPITAL",
  },
  description:
    "YS CAPITAL (ARN 145084) is India's leading integrated financial distributor. Seamlessly track Mutual Funds, Equities, Bonds, and Family Wealth with real-time AMFI NAV, automated CAS statement parsing, and AI rebalancing.",
  keywords: [
    "YS CAPITAL",
    "YS Portfolio",
    "Mutual Fund Distributor ARN 145084",
    "AMFI Registered Distributor",
    "APMI Registered PMS Distributor",
    "Portfolio Tracker India",
    "CAS Statement Parser",
    "Wealth Management Mumbai",
    "Direct Equity Dashboard",
    "SIP Calculator",
    "FII DII Market Tracker",
    "Multi-broker Portfolio Consolidation",
    "Family Office Wealth Management",
    "Mutual Fund NAV Tracking",
    "XIRR Portfolio Calculator",
  ],
  authors: [{ name: "YS CAPITAL", url: siteUrl }],
  creator: "YS CAPITAL",
  publisher: "YS CAPITAL",
  applicationName: "YS Digital Portfolio",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/ys_logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/ys_logo.png", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "YS CAPITAL",
    title: "YS CAPITAL | Digital Portfolio & Institutional Wealth Intelligence",
    description:
      "India's premier integrated wealth distributor & portfolio suite. Manage Mutual Funds, Equities, Bonds, and Family Wealth with 23+ years of trusted expertise.",
    images: [
      {
        url: "/showcase_dashboard.png",
        width: 1200,
        height: 630,
        alt: "YS CAPITAL Wealth Management & Digital Portfolio Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YS CAPITAL | Institutional Portfolio & Wealth Intelligence",
    description:
      "Consolidate Mutual Funds, Equities, Bonds, and Family Wealth with 23+ years of trusted expertise and real-time market tracking.",
    images: ["/showcase_dashboard.png"],
    creator: "@yscapital",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body>
        <Providers>
          <PasswordGate>
            <NextAppShell>{children}</NextAppShell>
          </PasswordGate>
        </Providers>
      </body>
    </html>
  );
}
