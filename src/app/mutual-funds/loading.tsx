"use client";
import LoadingScreen from "@/components/ui/LoadingScreen";
export default function MutualFundsLoading() {
  return <LoadingScreen text="Loading Mutual Funds..." subtext="Fetching latest AMFI NAVs and portfolio analytics" />;
}
