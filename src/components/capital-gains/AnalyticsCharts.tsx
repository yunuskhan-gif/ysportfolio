"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FIFOMatchDetail } from "./types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, PieChartIcon, TrendingUp, AlertCircle } from "lucide-react";

interface AnalyticsChartsProps {
  matchDetails: FIFOMatchDetail[];
}

export default function AnalyticsCharts({ matchDetails }: AnalyticsChartsProps) {
  // 1. Calculate holding type split data
  const holdingSplitData = useMemo(() => {
    let stcgGains = 0;
    let ltcgGains = 0;

    matchDetails.forEach((detail) => {
      if (detail.holdingType === "STCG") {
        stcgGains += detail.netGainLoss;
      } else {
        ltcgGains += detail.netGainLoss;
      }
    });

    return [
      { name: "Short Term (STCG)", value: Math.max(0, stcgGains), color: "#3b82f6" },
      { name: "Long Term (LTCG)", value: Math.max(0, ltcgGains), color: "#8b5cf6" },
    ];
  }, [matchDetails]);

  // 2. Calculate symbol-wise distribution
  const symbolWiseData = useMemo(() => {
    const symbolMap: Record<string, { symbol: string; gains: number; losses: number; net: number }> = {};

    matchDetails.forEach((detail) => {
      const sym = detail.symbol;
      if (!symbolMap[sym]) {
        symbolMap[sym] = { symbol: sym, gains: 0, losses: 0, net: 0 };
      }
      if (detail.netGainLoss >= 0) {
        symbolMap[sym].gains += detail.netGainLoss;
      } else {
        symbolMap[sym].losses += Math.abs(detail.netGainLoss);
      }
      symbolMap[sym].net += detail.netGainLoss;
    });

    return Object.values(symbolMap)
      .sort((a, b) => b.net - a.net)
      .slice(0, 5); // top 5 symbols
  }, [matchDetails]);

  // 3. Profitable vs Loss-making Trades Ratio
  const profitLossRatioData = useMemo(() => {
    let profitableValue = 0;
    let lossValue = 0;

    matchDetails.forEach((detail) => {
      if (detail.netGainLoss >= 0) {
        profitableValue += detail.netGainLoss;
      } else {
        lossValue += Math.abs(detail.netGainLoss);
      }
    });

    return [
      { name: "Profitable", value: profitableValue, color: "#10b981" },
      { name: "Loss-making", value: lossValue, color: "#ef4444" },
    ];
  }, [matchDetails]);

  const hasData = matchDetails.length > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-border p-2.5 rounded-lg shadow-lg font-sans text-xs">
          <p className="font-semibold text-foreground">{payload[0].name || payload[0].payload.symbol}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="mt-1" style={{ color: item.color || item.fill }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Bar Chart: Asset Performance */}
      <Card className="border border-border/80 bg-card shadow-sm h-[320px] flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Top 5 Assets by Gain/Loss
          </CardTitle>
          <CardDescription className="text-xs">
            Performance overview of the most active holdings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[200px] py-1">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs gap-1.5 pt-6">
              <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
              <span>No trade analytics available. Load trades to build charts.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="95%">
              <BarChart data={symbolWiseData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="symbol" tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tickLine={false} tickFormatter={(v) => `₹${v}`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 5 }} />
                <Bar dataKey="gains" name="Gains" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" name="Losses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 2. Pie Chart: Holding Classifications */}
      <Card className="border border-border/80 bg-card shadow-sm h-[320px] flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Tax Holding Period Split (STCG vs LTCG)
          </CardTitle>
          <CardDescription className="text-xs">
            Breakdown of short-term and long-term profitable allocations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[200px] py-1 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs gap-1.5 pt-6">
              <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
              <span>No trade analytics available. Load trades to build charts.</span>
            </div>
          ) : (
            <>
              <div className="w-full sm:w-[50%] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={holdingSplitData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {holdingSplitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-[50%] flex flex-col gap-2.5 text-xs">
                {holdingSplitData.map((item, i) => (
                  <div key={i} className="flex flex-col gap-0.5 border-l-2 pl-2.5" style={{ borderColor: item.color }}>
                    <span className="text-muted-foreground font-medium">{item.name}</span>
                    <span className="font-bold font-mono">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
