import type { Metadata } from "next";
import "./globals.css";
import NextAppShell from "@/components/layout/NextAppShell";
import Providers from "@/app/providers";
import PasswordGate from "@/components/auth/PasswordGate";

export const metadata: Metadata = {
  title: "YS Portfolio",
  description: "YS Portfolio Next.js app",
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
