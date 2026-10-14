import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client & Partner Portal Login",
  description:
    "Secure investor portal login for YS PORTFOLIO clients. Access your real-time Mutual Funds, direct equity portfolio, and institutional wealth analytics.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Client Portal Login | YS PORTFOLIO",
    description: "Secure login for YS PORTFOLIO private wealth management and digital portfolio tracking.",
    url: "/login",
    images: [
      {
        url: "/showcase_dashboard.png",
        width: 1200,
        height: 630,
        alt: "YS PORTFOLIO Investor Portal",
      },
    ],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
