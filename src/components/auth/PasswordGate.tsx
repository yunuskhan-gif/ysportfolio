"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Check auth session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsVerified(data.verified);
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        setIsVerified(false);
      }
    }
    checkAuth();
  }, [pathname]);

  // Redirect to root welcome landing page if not verified on a private route
  useEffect(() => {
    if (isVerified === false && pathname !== "/") {
      router.push("/");
    }
  }, [isVerified, pathname, router]);

  // Bypass password gate for root path '/'
  if (pathname === "/") {
    return <>{children}</>;
  }

  // Render loading spinner while checking auth or executing redirect
  if (isVerified === null || !isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Render private pages
  return <>{children}</>;
}
