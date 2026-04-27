
// src/components/dashboard/MetricCard.tsx
import type { DashboardData } from "@/api/types/dashboard.types";
import OneDayContinous from "@/lib/MetricsData/OneDayContinous";
import OneWeekContinous from "@/lib/MetricsData/OneWeekContinous";
import oneMonthContinous from "@/lib/MetricsData/OneMonthContinous";
import oneYearContinous from "@/lib/MetricsData/OneYearContinous";
import { useTimeRange } from "@/api/hooks/useTimeRange";
import TimeToggle from "@/components/dashboard/Timetoggle";
import { ChartMetricCard } from "./ChartMetricCard";

interface MetricCardProps {
  data: DashboardData | null;
}

const MetricCard = ({ data }: MetricCardProps) => {
  const { selectedRange, setSelectedRange } = useTimeRange("1d");

  const metricsConfig = [
    { key: "profit", title: "Total Profit/Loss" }, // Changed
    { key: "winRate", title: "Win Rate" },
    { key: "expectancyRate", title: "Expectancy Rate" }, // Changed
    { key: "drawdown", title: "Drawdown" },
    { key: "kellyRatio", title: "Kelly Ratio Score" }, // Changed
  ] as const;

  if (!data?.cards) return null;

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex flex-1 w-full justify-between ">
        <h4 className="scroll-m-20 font-normal">Performance Metrics</h4>
        <TimeToggle
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
      </div>

      {/* Yeh grid fix kiya - 5 columns properly */}
      <div className="flex max-sm:overflow-x-auto max-sm:pb-4 max-sm:snap-x max-sm:snap-mandatory scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {metricsConfig.map(({ key, title }) => {
          const metricData = data.cards?.[key as keyof typeof data.cards];
          if (!metricData) return null;

          const rangeData = metricData[selectedRange];
          if (!rangeData?.graphData) return null;

          let newData;
          if (selectedRange === "1d")
            newData = OneDayContinous(rangeData.graphData);
          else if (selectedRange === "1w")
            newData = OneWeekContinous(rangeData.graphData);
          else if (selectedRange === "1m")
            newData = oneMonthContinous(rangeData.graphData);
          else newData = oneYearContinous(rangeData.graphData);

          const prevValue =
            data.cards?.[key as keyof typeof data.cards]?.["1d"]?.value || 0;

          return (
            <ChartMetricCard
              key={`${key}-${selectedRange}`}
              title={title}
              data={newData}
              currentValue={rangeData.value}
              prevValue={prevValue}
              timeRange={selectedRange}
              flag={key === "drawdown" ? 1 : 0}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MetricCard;
