"use client";

import LoadingScreen from "@/components/ui/LoadingScreen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      text="Loading Dashboard..."
      subtext="Syncing portfolio holdings, market NAVs & balances"
    />
  );
}
