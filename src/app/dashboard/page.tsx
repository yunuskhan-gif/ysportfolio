"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Dashboard from "@/screens/Dashboard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const authtoken = searchParams.get("authtoken");
    if (authtoken) {
      router.replace(`/api/auth/motilal/callback?authtoken=${encodeURIComponent(authtoken)}`);
    }
  }, [searchParams, router]);

  if (searchParams.get("authtoken")) {
    return <div className="p-8 text-center text-muted-foreground">Authenticating with Motilal Oswal...</div>;
  }

  return <Dashboard />;
}
