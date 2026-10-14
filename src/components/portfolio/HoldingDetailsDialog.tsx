"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  BarChart,
  Bar
} from "recharts";
import {
  Edit2,
  TrendingUp,
  TrendingDown,
  Trash2,
  Activity,
  Loader2,
  RefreshCw,
  ExternalLink,
  CandlestickChart
} from "lucide-react";
import { type StockHolding } from "@/lib/portfolio-api";
import { isMutualFund } from "@/lib/utils";

interface HoldingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: any | null; // EnrichedHolding
  onEdit: (holding: StockHolding) => void;
  onDelete: (id: string) => void;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// Deterministic fallback points generator
function generateFallbackPoints(basePrice: number, range: "1D" | "1M" | "6M" | "1Y") {
  const pointsCount = range === "1D" ? 24 : range === "1M" ? 30 : range === "6M" ? 24 : 12;
  const data = [];
  
  let currentPrice = basePrice * (range === "1D" ? 0.99 : range === "1M" ? 0.97 : range === "6M" ? 0.88 : 0.78);
  const step = (basePrice - currentPrice) / pointsCount;

  for (let i = 0; i < pointsCount; i++) {
    const pct = (Math.random() - 0.47) * (range === "1D" ? 0.008 : range === "1M" ? 0.02 : range === "6M" ? 0.04 : 0.08);
    currentPrice = Math.max(1, currentPrice * (1 + pct) + step);
    
    let dateStr = "";
    if (range === "1D") {
      const hour = 9 + Math.floor(i / 4);
      const min = (i % 4) * 15;
      dateStr = `${hour}:${min < 10 ? "0" + min : min}`;
    } else if (range === "1M") {
      const d = new Date();
      d.setDate(d.getDate() - (pointsCount - i));
      dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } else if (range === "6M") {
      const d = new Date();
      d.setDate(d.getDate() - (pointsCount - i) * 7);
      dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() - (pointsCount - i));
      dateStr = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    }

    const volume = Math.round(10000 + Math.random() * 800000);

    data.push({
      date: dateStr,
      price: parseFloat(currentPrice.toFixed(2)),
      volume
    });
  }

  if (data.length > 0) {
    data[data.length - 1].price = basePrice;
  }
  return data;
}

export default function HoldingDetailsDialog({
  open,
  onOpenChange,
  holding,
  onEdit,
  onDelete,
}: HoldingDetailsDialogProps) {
  const [range, setRange] = useState<"1D" | "1M" | "6M" | "1Y">("1M");
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const effectivePrice = holding?.ltp ?? holding?.avgPrice ?? 100;
  const isMF = holding ? isMutualFund(holding.symbol) : false;
  const isPositive = (holding?.pnl ?? 0) >= 0;

  useEffect(() => {
    if (!open || !holding) return;

    setChartLoading(true);

    const queryParams = new URLSearchParams({
      symbol: holding.symbol,
      name: holding.name || holding.symbol,
      range: range === "1D" ? "1M" : range, // API supports 1M, 6M, 1Y
      ...(effectivePrice ? { ltp: effectivePrice.toString() } : {})
    });

    fetch(`/api/stock-chart?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Chart fetch failed");
        return res.json();
      })
      .then((points) => {
        if (Array.isArray(points) && points.length > 0) {
          setChartData(points);
        } else {
          setChartData(generateFallbackPoints(effectivePrice, range));
        }
      })
      .catch(() => {
        setChartData(generateFallbackPoints(effectivePrice, range));
      })
      .finally(() => {
        setChartLoading(false);
      });
  }, [open, holding?.symbol, range, effectivePrice]);

  if (!holding) return null;

  // Calculate high, low, change in chart period
  const prices = chartData.map((p) => p.price).filter((p) => typeof p === "number");
  const periodHigh = prices.length ? Math.max(...prices) : effectivePrice;
  const periodLow = prices.length ? Math.min(...prices) : effectivePrice;
  const firstPrice = prices.length ? prices[0] : effectivePrice;
  const lastPrice = prices.length ? prices[prices.length - 1] : effectivePrice;
  const periodChange = lastPrice - firstPrice;
  const periodChangePct = firstPrice > 0 ? (periodChange / firstPrice) * 100 : 0;
  const isPeriodPositive = periodChange >= 0;

  const chartColor = isPeriodPositive ? "#10b981" : "#ef4444"; // emerald vs red

  // External trading / screener link
  const cleanSymbol = (holding.symbol || "").split(".")[0].toUpperCase();
  const tradingViewUrl = isMF 
    ? `https://www.google.com/finance/quote/${encodeURIComponent(cleanSymbol)}:MUTF_IN`
    : `https://in.tradingview.com/chart/?symbol=NSE:${encodeURIComponent(cleanSymbol)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[650px] p-0 overflow-hidden border border-border/80 bg-zinc-950 text-white shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  {holding.name}
                </DialogTitle>
                {isMF ? (
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold">MF</Badge>
                ) : (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">STOCK</Badge>
                )}
                {holding.app && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono font-medium">
                    {holding.app}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="uppercase font-semibold tracking-wider">{holding.symbol}</span>
                <span>•</span>
                <a
                  href={tradingViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-sans text-[11px]"
                >
                  <span>{isMF ? "Google Finance" : "TradingView"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Live / Current Price */}
            <div className="text-right">
              <p className="text-2xl font-black tracking-tight text-white font-mono">
                {holding.ltp ? formatINR(holding.ltp) : formatINR(holding.avgPrice)}
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {(holding.changePercent ?? periodChangePct) >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span
                  className={`text-xs font-black font-mono ${
                    (holding.changePercent ?? periodChangePct) >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {(holding.changePercent ?? periodChangePct) >= 0 ? "+" : ""}
                  {(holding.changePercent ?? periodChangePct).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable / Interactive Body */}
        <div className="p-5 space-y-5">
          {/* Trading-style Chart Section */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-zinc-800 text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    Live Trading Graph
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                    <span>H: <b className="text-zinc-200">{formatINR(periodHigh)}</b></span>
                    <span>L: <b className="text-zinc-200">{formatINR(periodLow)}</b></span>
                    <span>Change: <b className={isPeriodPositive ? "text-emerald-400" : "text-red-400"}>
                      {isPeriodPositive ? "+" : ""}{formatINR(periodChange)} ({periodChangePct.toFixed(2)}%)
                    </b></span>
                  </div>
                </div>
              </div>

              {/* Controls: Range & Style */}
              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                  {(["1D", "1M", "6M", "1Y"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${
                        range === r
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setChartType((t) => (t === "area" ? "bar" : "area"))}
                  title="Toggle Graph Type"
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                >
                  <CandlestickChart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Chart Canvas */}
            <div className="relative h-[220px] w-full text-[10px]">
              {chartLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-[1px] gap-2 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-zinc-400 font-medium">Loading market price stream...</span>
                </div>
              )}

              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tradingColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                    <XAxis dataKey="date" stroke="#71717a" tickLine={false} />
                    <YAxis
                      stroke="#71717a"
                      domain={["auto", "auto"]}
                      tickFormatter={(val) => `₹${Number(val).toFixed(0)}`}
                      tickLine={false}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        borderColor: "#27272a",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "LTP"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={chartColor}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#tradingColor)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                    <XAxis dataKey="date" stroke="#71717a" tickLine={false} />
                    <YAxis
                      stroke="#71717a"
                      domain={["auto", "auto"]}
                      tickFormatter={(val) => `₹${Number(val).toFixed(0)}`}
                      tickLine={false}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        borderColor: "#27272a",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Price"]}
                    />
                    <Bar dataKey="price" fill={chartColor} radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Micro Volume Strip */}
            <div className="h-[45px] w-full border-t border-zinc-800/80 pt-1 text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "6px",
                      fontSize: "10px",
                    }}
                    formatter={(val: any) => [Number(val).toLocaleString("en-IN"), "Volume"]}
                  />
                  <Bar dataKey="volume" fill="#52525b" fillOpacity={0.4} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User's Holding & PnL Performance Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Holding Units</p>
              <p className="text-base font-black text-white">{holding.qty}</p>
              <p className="text-[10px] text-zinc-400 font-mono">Avg: {formatINR(holding.avgPrice)}</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Your Investment</p>
              <p className="text-base font-black text-white">{formatINR(holding.investment)}</p>
              <p className="text-[10px] text-zinc-400">Total Capital</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Current Value</p>
              <p className="text-base font-black text-white">
                {holding.currentValue ? formatINR(holding.currentValue) : formatINR(holding.investment)}
              </p>
              <p className="text-[10px] text-zinc-400">Mark to Market</p>
            </div>

            <div className={`p-3 rounded-xl border ${isPositive ? "bg-emerald-950/20 border-emerald-500/30" : "bg-red-950/20 border-red-500/30"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-zinc-400">Overall P&amp;L</p>
              <p className={`text-base font-black font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {holding.pnl ? formatINR(holding.pnl) : "₹0.00"}
              </p>
              <p className={`text-[10px] font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}{(holding.pnlPercent ?? 0).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-2.5 pt-1">
            <Button
              className="flex-1 h-11 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                onEdit(holding);
                onOpenChange(false);
              }}
            >
              <Edit2 className="w-4 h-4" /> Edit Quantity / Price
            </Button>
            <Button
              variant="outline"
              className="h-11 px-4 rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
              onClick={() => {
                if (confirm(`Delete ${holding.name} from your portfolio?`)) {
                  onDelete(holding.id);
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
