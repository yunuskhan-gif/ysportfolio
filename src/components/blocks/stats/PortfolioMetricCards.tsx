import { ChartMetricCard } from "./ChartMetricCard";

interface ChartPoint {
  timestamp: number;
  value: number;
}

interface MetricDefinition {
  title: string;
  currentValue: number;
  prevValue: number;
  data: ChartPoint[];
  flag?: number;
}

interface PortfolioMetricsProps {
  metrics?: MetricDefinition[];
}

export default function PortfolioMetricCards({ metrics = [] }: PortfolioMetricsProps) {
  return (
    <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-2 w-full no-scrollbar md:grid md:grid-cols-2 xl:grid-cols-4 pb-2 md:pb-0">
      {metrics.map((metric) => (
        <div key={metric.title} className="snap-center shrink-0 w-[280px] md:w-full">
          <ChartMetricCard
            title={metric.title}
            currentValue={metric.currentValue}
            prevValue={metric.prevValue}
            data={metric.data}
            flag={metric.flag}
          />
        </div>
      ))}
    </div>
  );
}
