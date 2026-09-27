"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Check auth session
  useEffect(() => {
    let isMounted = true;
    setIsVerified(null);
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setIsVerified(data.verified);
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        if (isMounted) setIsVerified(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const isPublicRoute =
    ["/", "/login", "/privacy-policy", "/terms", "/refund-policy"].includes(pathname) ||
    pathname.startsWith("/blog");

  // Redirect to root welcome landing page if not verified on a private route
  useEffect(() => {
    if (isVerified === false && !isPublicRoute) {
      router.push("/");
    }
  }, [isVerified, pathname, isPublicRoute, router]);

  // Bypass password gate for public routes
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Render loading spinner while checking auth or executing redirect
  if (isVerified === null || !isVerified) {
    return (
      <LoadingScreen text="Securing Workspace..." subtext="Verifying host-isolated credentials & session" />
    );
  }

  // Render private pages
  return <>{children}</>;
}
