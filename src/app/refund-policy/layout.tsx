import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | YS CAPITAL",
  description:
    "Official Refund & Cancellation Policy of YS CAPITAL (ARN 145084). Learn about mutual fund redemptions, direct AMC fund routing, advisory subscription cancellations, and grievance resolution SLAs.",
  alternates: {
    canonical: "/refund-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Refund & Cancellation Policy | YS CAPITAL",
    description: "Official Refund and Cancellation Guidelines for YS CAPITAL wealth management and distribution services.",
    url: "/refund-policy",
    type: "website",
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
