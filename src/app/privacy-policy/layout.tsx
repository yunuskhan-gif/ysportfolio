import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | YS CAPITAL",
  description:
    "Read the official Privacy Policy of YS CAPITAL (ARN 145084). Learn how we protect, store, and safeguard your financial data, CAS statements, and portfolio ledgers with strict host-isolation and 256-bit encryption.",
  alternates: {
    canonical: "/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | YS CAPITAL",
    description: "Learn how YS CAPITAL safeguards investor portfolio data and privacy under SEBI & AMFI standards.",
    url: "/privacy-policy",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
