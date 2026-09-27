"use client";
import LoadingScreen from "@/components/ui/LoadingScreen";
export default function PortfolioLoading() {
  return <LoadingScreen text="Loading Portfolio Holdings..." subtext="Syncing equities, CAS and live market valuations" />;
}
