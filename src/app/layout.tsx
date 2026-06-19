import type { Metadata } from "next";
import "./globals.css";
import NextAppShell from "@/components/layout/NextAppShell";
import Providers from "@/app/providers";
import PasswordGate from "@/components/auth/PasswordGate";

export const metadata: Metadata = {
  title: "YS Portfolio | Market Intelligence",
  description: "High-performance financial portfolio tracking and market intelligence dashboard.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
