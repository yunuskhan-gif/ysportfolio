import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wealth & Market Intelligence Blog | YS PORTFOLIO",
  description:
    "Insights, analysis, and guides on Mutual Funds, CAS statement consolidation, XIRR calculations, FII/DII market flows, and institutional asset allocation by YS PORTFOLIO.",
  alternates: {
    canonical: "/blog",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Market & Wealth Intelligence Blog | YS PORTFOLIO",
    description:
      "Educational articles and institutional wealth research on Indian equities, mutual fund distribution, CAS statement parsing, and compounding strategies.",
    url: "/blog",
    type: "website",
    images: [
      {
        url: "/showcase_dashboard.png",
        width: 1200,
        height: 630,
        alt: "YS PORTFOLIO Wealth Blog & Market Intelligence",
      },
    ],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
