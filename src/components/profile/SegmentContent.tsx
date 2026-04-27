import { useState } from "react";
import SegmentMetrics from "@/components/profile/analytics/SegmentMetrics";
import segmentData from "@/ProfileData/segmentData.json";
import TradingHeatmap from "../profile/analytics/TradingHeatmap";
import type { LifetimeMetrics } from "@/api/types/profile.types";

interface SegmentData {
  [key: string]: {
    metrics: Array<{
      label: string;
      value: string;
      trend?: { value: string; isPositive: boolean };
      isProfit: boolean | null;
      context?: string;
    }>;
    recentTrades: Array<{
      symbol: string;
      action: "BUY" | "SELL";
      pl: string;
      date: string;
    }>;
  };
}

interface SegmentContentProps {
  segment: string;
  height?: string;
  targetUserId?: string;
  lifetimeMetrics?: LifetimeMetrics;
}

const segmentMapping: Record<string, string> = {
  EQUITY: "Equity",
  OPTION: "F&O",
  FUTURES: "F&O",
  DEFAULT: "Equity",
  FOREX: "Forex",
  CRYPTO: "Crypto",
};

const SegmentContent = ({ segment, targetUserId, lifetimeMetrics }: SegmentContentProps) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const segmentDataTyped = segmentData as SegmentData;

  const dataKey = segmentMapping[segment] || segment;
  const currentData = segmentDataTyped[dataKey];

  // Convert lifetimeMetrics to the format expected by SegmentMetrics
  const formattedMetrics = lifetimeMetrics ? [
    {
      label: "Win Rate",
      value: lifetimeMetrics.winRate !== null ? `${lifetimeMetrics.winRate.toFixed(1)}%` : "0%",
      isProfit: lifetimeMetrics.winRate !== null ? lifetimeMetrics.winRate > 50 : null,
    },
    {
      label: "Total Trades",
      value: lifetimeMetrics.totalTrades?.toString() || "0",
      isProfit: null,
    },
    {
      label: "Avg P&L",
      value: lifetimeMetrics.avgPnL !== null ? `₹${lifetimeMetrics.avgPnL.toFixed(2)}` : "₹0",
      isProfit: lifetimeMetrics.avgPnL !== null ? lifetimeMetrics.avgPnL > 0 : null,
    },
    {
      label: "Total P&L",
      value: lifetimeMetrics.totalPnL !== null ? `₹${lifetimeMetrics.totalPnL.toFixed(2)}` : "₹0",
      isProfit: lifetimeMetrics.totalPnL !== null ? lifetimeMetrics.totalPnL > 0 : null,
    },
  ] : currentData?.metrics;

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      {formattedMetrics ? (
        <SegmentMetrics metrics={formattedMetrics} />
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          No metrics data found for segment: {segment}
        </div>
      )}

      {/* Trading Heatmap - Pass targetUserId */}
      <TradingHeatmap
        segment={segment}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        targetUserId={targetUserId}
      />
    </div>
  );
};

export default SegmentContent;
