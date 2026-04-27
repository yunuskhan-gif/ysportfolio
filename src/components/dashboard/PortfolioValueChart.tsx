import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  value: {
    label: "Market Value",
    color: "var(--primary)",
  },
};

interface PortfolioValueChartProps {
  data: { name: string; value: number }[];
}

export default function PortfolioValueChart({ data }: PortfolioValueChartProps) {
  // Sort by value and take top 10 for the big chart
  const chartData = [...data].sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <Card className="w-full shadow-none border-border bg-card">

      <CardContent className="px-2 py-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                angle={-45} 
                textAnchor="end" 
                fontSize={10}
                interval={0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                fontSize={10} 
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(var(--primary-rgb), 0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border p-2 rounded-lg shadow-xl">
                        <p className="text-xs font-bold">{payload[0].payload.name}</p>
                        <p className="text-sm text-primary font-bold">
                          ₹{payload[0].value?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`color-mix(in oklch, var(--primary), transparent ${index * 8}%)`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
