import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";

interface ChartData {
  timestamp: string | number;
  value: number;
}

interface ChartMetricCardProps {
  title: string;
  data: ChartData[];
  currentValue: number;
  prevValue: number;
  timeRange?: string;
  flag?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export function ChartMetricCard({
  title,
  data,
  currentValue,
  prevValue,
  timeRange = "1d",
  flag = 0,
}: ChartMetricCardProps) {
  const chartData = data.map((item) => {
    return {
      ...item,
      value: flag === 1 ? (item.value !== 0 ? -item.value : item.value) : item.value,
      formattedTime: new Date(item.timestamp).toLocaleTimeString(),
      time: new Date(item.timestamp).toLocaleTimeString(),
    };
  });

  const percentChange =
    prevValue !== 0
      ? (((currentValue - prevValue) / Math.abs(prevValue)) * 100).toFixed(1)
      : "0";

  const isPositive = Number(percentChange) >= 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  const formatValueForTicker = (val: number) => {
    return flag === 1 ? `${val.toFixed(2)}%` : formatCurrency(val);
  };


  const chartConfig: ChartConfig = {
    value: {
      label: title,
      color: currentValue > 0 ? "var(--primary)" : "var(--destructive)",
    },
  };

  const textColor = currentValue > 0 ? "text-primary" : "text-destructive";
  const badgeColor = isPositive
    ? "text-primary border-primary/20"
    : "text-destructive border-destructive/20";

  // Check if all values are zero
  const allValuesZero = chartData.every((item) => item.value === 0);

  return (
    <Card className="h-[150px] max-sm:h-[135px] w-full !p-0 !gap-0 flex flex-col overflow-hidden snap-center">
      <CardHeader className="flex-none pt-1 px-2 py-1 pb-0 space-y-0 max-sm:pt-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CardDescription className="text-xs font-normal truncate max-sm:text-[10px]">
              {title}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 rounded-md text-[10px] py-0.5 max-sm:text-[8px] max-sm:py-0 ${badgeColor}`}
          >
            <TrendIcon className="size-3 max-sm:size-2.5" />
            <span className="text-[7px] max-sm:text-[6px]">
              {isPositive ? "+" : ""}
              {percentChange}%
            </span>
          </Badge>
        </div>
        <CardTitle
          className={`text-lg font-normal tabular-nums leading-tight truncate ${textColor} max-sm:text-base`}
        >
          <NumberTicker value={currentValue} formatter={formatValueForTicker} />
        </CardTitle>
      </CardHeader>


      <CardContent className="flex-1 !p-0 min-h-0 flex flex-col">
        <ChartContainer
          className="w-full h-full overflow-hidden"
          config={chartConfig}
        >
          <AreaChart
            data={chartData}
            syncId="portfolio-sync"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >

            <XAxis
              dataKey="formattedTime"
              tick={false}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              hide
              domain={allValuesZero ? [0, 1] : ["dataMin - 1", "dataMax"]}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={1.5}
              fill={allValuesZero ? "transparent" : "var(--color-value)"}
              fillOpacity={allValuesZero ? 0 : 0.05}
              dot={false}
              baseValue="dataMin"
              isAnimationActive={false}
            />

            <ChartTooltip
              cursor={{ stroke: "var(--color-value)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  className="text-[10px] py-1 px-2"
                  hideLabel={false}
                  labelFormatter={(value, payload) => {
                    const data = payload?.[0]?.payload;
                    return (
                      <div className="flex items-center gap-1 mb-1 border-b pb-1 border-border/50 font-medium whitespace-nowrap">
                        <span className="text-muted-foreground">{timeRange === "1d" ? "Time:" : "Date:"}</span>
                        <span>{data?.time || value}</span>
                      </div>
                    );
                  }}
                  formatter={(value: any) => {
                    if (flag === 1) return [`${value}%`, title];
                    return [formatCurrency(value), title];
                  }}

                />
              }
            />

          </AreaChart>

        </ChartContainer>
      </CardContent>
    </Card>
  );
}