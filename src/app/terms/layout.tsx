import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | YS CAPITAL",
  description:
    "Review the Terms and Conditions for accessing YS CAPITAL (ARN 145084) digital portfolio tracking, investment distribution services, and wealth management platform.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms & Conditions | YS CAPITAL",
    description: "Official Terms and Conditions for YS CAPITAL wealth management services.",
    url: "/terms",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
