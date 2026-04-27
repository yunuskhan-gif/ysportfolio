// components/analytics/PerformanceChart.tsx
import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
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
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import heatmapData from "@/ProfileData/heatmapData.json";
import { NumberTicker } from "@/components/ui/number-ticker";

interface PerformanceChartProps {
  segment: string;
}

// Type for heatmap data
interface HeatmapYearData {
  [year: string]: Array<{
    date: string;
    count: number;
    level: number;
  }>;
}

const PerformanceChart = ({ segment }: PerformanceChartProps) => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  
  // Get available years from heatmap data with proper typing
  const segmentHeatmap = heatmapData.heatmapData[segment as keyof typeof heatmapData.heatmapData] as HeatmapYearData;
  
  // Get available years
  const availableYears = segmentHeatmap ? Object.keys(segmentHeatmap) : ["2024", "2023", "2025"];
  
  // Get data for selected year with proper typing
  const yearData = segmentHeatmap?.[selectedYear] || [];

  // Convert to chart format - REAL DATA
  const chartData = yearData.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    trades: day.count,
  }));

  // Calculate total trades for selected year
  const totalTrades = yearData.reduce((sum, day) => sum + day.count, 0);

  // If no data, show nothing
  if (yearData.length === 0) {
    return null;
  }

  // Chart configuration
  const chartConfig = {
    trades: {
      label: "Trades",
      color: "hsl(142, 76%, 36%)", // GREEN COLOR
    },
  };

  return (
    <Card className="border-border/40 shadow-lg shadow-black/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trade Activity</CardTitle>
            <CardDescription>
              Daily trade volume for {segment}
            </CardDescription>
          </div>
          
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedYear}
              onValueChange={(value) => setSelectedYear(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Year Summary */}
        <div className="flex items-center gap-4 mt-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Trades: </span>
            <span className="font-medium">
              <NumberTicker value={totalTrades} />
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Days Traded: </span>
            <span className="font-medium">
              <NumberTicker value={yearData.length} />
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillTrades" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)" // GREEN
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)" // GREEN
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value) => [`${value} trades`, 'Volume']}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="trades"
              stroke="hsl(142, 76%, 36%)" // GREEN LINE
              fill="url(#fillTrades)" // GREEN GRADIENT FILL
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;