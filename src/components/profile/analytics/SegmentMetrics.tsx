// components/analytics/SegmentMetrics.tsx
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { NumberTicker } from "@/components/ui/number-ticker"

interface MetricTrend {
  value: string;
  isPositive: boolean;
}

interface Metric {
  label: string;
  value: string;
  trend?: MetricTrend;
  isProfit: boolean | null;
  context?: string;
}

interface SegmentMetricsProps {
  metrics: Metric[];
}

const SegmentMetrics = ({ metrics }: SegmentMetricsProps) => {
  const parseValue = (valStr: string) => {
    const clean = valStr.replace(/[₹,%\s]/g, "");
    const value = parseFloat(clean);
    const type = valStr.includes("%")
      ? "percent"
      : valStr.includes("₹")
        ? "currency"
        : "number";
    return { value: isNaN(value) ? 0 : value, type };
  };

  const shorten = (n: number) => {
    if (n === 0) return "0";
    const absN = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    
    // For very large numbers, we must keep dividing until it's manageable
    const units = [
      { v: 1e24, s: "Y" },
      { v: 1e21, s: "Z" },
      { v: 1e18, s: "E" },
      { v: 1e15, s: "P" },
      { v: 1e12, s: "T" },
      { v: 1e9, s: "B" },
      { v: 1e7, s: "Cr" },
      { v: 1e5, s: "L" },
      { v: 1e3, s: "K" },
    ];
    
    for (const unit of units) {
      if (absN >= unit.v) {
        return sign + (absN / unit.v).toFixed(1).replace(/\.0$/, "") + unit.s;
      }
    }
    return sign + Math.floor(absN).toString();
  };

  const getFormatter = (type: string) => {
    return (val: number) => {
      if (type === "percent") return `${val.toFixed(1)}%`;
      const formattedValue = shorten(val);
      if (type === "currency") return `₹${formattedValue}`;
      return formattedValue;
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-3 overflow-hidden">
          <CardContent className="p-0 text-center">
            <span
              className={`text-xl font-bold block tabular-nums whitespace-nowrap ${
                metric.isProfit === true
                  ? "text-primary"
                  : metric.isProfit === false
                    ? "text-destructive"
                    : "text-foreground"
              }`}
            >
              {(() => {
                const { value, type } = parseValue(metric.value);
                return (
                  <NumberTicker
                    value={value}
                    formatter={getFormatter(type)}
                    decimalPlaces={type === "percent" ? 1 : 0}
                  />
                );
              })()}
            </span>
            <span className="text-xs uppercase tracking-wide">{metric.label}</span>
            
            {metric.trend && (
              <div className={`flex items-center justify-center gap-1 mt-1 ${
                metric.trend.isPositive ? 'text-primary' : 'text-destructive'
              }`}>
                {metric.trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-[10px]">{metric.trend.value}</span>
              </div>
            )}
            
            {metric.context && (
              <span className="text-[10px] block mt-0.5">
                {metric.context}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SegmentMetrics