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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 w-full">
      {metrics.map((metric) => (
        <ChartMetricCard
          key={metric.title}
          title={metric.title}
          currentValue={metric.currentValue}
          prevValue={metric.prevValue}
          data={metric.data}
          flag={metric.flag}
        />
      ))}
    </div>
  );
}
