"use client";

import React, { useState, useEffect } from "react";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Radio,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FIIDIIRow {
  date: string;
  fiiBuy: number;
  fiiSell: number;
  fiiNet: number;
  diiBuy: number;
  diiSell: number;
  diiNet: number;
  totalNet: number;
}

export const formatCrores = (val: number, showSign = false) => {
  const sign = showSign && val > 0 ? "+" : "";
  const formatted = Math.abs(val).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}₹${val < 0 ? "-" : ""}${formatted} Cr`;
};

export const FIIDIISection: React.FC = () => {
  const [data, setData] = useState<FIIDIIRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [source, setSource] = useState<string>("NSE Live Market");

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch("/api/fii-dii/live");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setData(json.data);
          if (json.lastUpdated) setLastUpdated(json.lastUpdated);
          if (json.source) setSource(json.source);
        }
      }
    } catch (err) {
      console.error("Failed to load FII/DII live data", err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds for real-time live market updates
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const today = data[0] || {
    date: "Latest Session",
    fiiBuy: 0,
    fiiSell: 0,
    fiiNet: 0,
    diiBuy: 0,
    diiSell: 0,
    diiNet: 0,
    totalNet: 0,
  };

  const mtdFiiNet = data.reduce((acc, row) => acc + (row.fiiNet || 0), 0);
  const mtdDiiNet = data.reduce((acc, row) => acc + (row.diiNet || 0), 0);

  return (
    <section id="fii-dii-live" className="scroll-mt-24 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
              <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
              Live Institutional Flow
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Weekend (Market Closed) • Last Trade: 16-Oct (Friday)
            </span>
            <span className="text-xs text-muted-foreground">• NSE / BSE Cash</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-emerald-500" />
            FII & DII Trading Activity Tracker
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time daily institutional turnover, net buying/selling positions, and historical trend analysis. (Next live data: Monday after 5:30 PM)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] bg-secondary/40 border border-border/80 px-2.5 py-1 rounded-md text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              Updated: <strong className="text-foreground">{lastUpdated}</strong>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || loading}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* FII Card */}
        <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-xs hover:border-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              FII / FPI Net ({today.date})
            </span>
            <span
              className={`p-1.5 rounded-lg ${
                today.fiiNet >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {today.fiiNet >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </span>
          </div>

          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                today.fiiNet >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {loading ? "..." : formatCrores(today.fiiNet, true)}
            </div>
            <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Gross Buy</span>
                <span className="font-mono text-foreground font-semibold">
                  {loading ? "..." : formatCrores(today.fiiBuy)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[11px]">Gross Sell</span>
                <span className="font-mono text-foreground font-semibold">
                  {loading ? "..." : formatCrores(today.fiiSell)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Cumulative FII Net:</span>
            <span
              className={`font-mono font-bold ${
                mtdFiiNet >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {loading ? "..." : formatCrores(mtdFiiNet, true)}
            </span>
          </div>
        </div>

        {/* DII Card */}
        <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-xs hover:border-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              DII Net ({today.date})
            </span>
            <span
              className={`p-1.5 rounded-lg ${
                today.diiNet >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {today.diiNet >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </span>
          </div>

          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                today.diiNet >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {loading ? "..." : formatCrores(today.diiNet, true)}
            </div>
            <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Gross Buy</span>
                <span className="font-mono text-foreground font-semibold">
                  {loading ? "..." : formatCrores(today.diiBuy)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[11px]">Gross Sell</span>
                <span className="font-mono text-foreground font-semibold">
                  {loading ? "..." : formatCrores(today.diiSell)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Cumulative DII Net:</span>
            <span
              className={`font-mono font-bold ${
                mtdDiiNet >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {loading ? "..." : formatCrores(mtdDiiNet, true)}
            </span>
          </div>
        </div>

        {/* Combined Institutional Net */}
        <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-xs hover:border-border/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Total Institutional Net
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                FII + DII
              </span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight mt-3 ${
                today.totalNet >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {loading ? "..." : formatCrores(today.totalNet, true)}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/60 text-xs text-muted-foreground">
            <span className="text-foreground font-semibold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              Institutional Flow Signal:
            </span>
            {today.fiiNet > 0 && today.diiNet > 0
              ? "Both foreign & domestic institutions are net buyers, providing robust support to benchmarks."
              : today.fiiNet < 0 && today.diiNet > 0
              ? "DII domestic mutual fund liquidity is actively absorbing foreign institutional selling pressure."
              : today.fiiNet > 0 && today.diiNet < 0
              ? "FII inflows are driving the rally while domestic institutions book strategic profits."
              : "Both institutions are net sellers; prudent risk management advised."}
          </div>
        </div>
      </div>

      {/* Visual Flow Trend Bar Comparison (Recent Sessions) */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Daily Net Flow Comparison (Recent Sessions)
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> FII Net
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-3 h-3 rounded bg-cyan-500 inline-block" /> DII Net
            </span>
          </div>
        </div>

        <div className="space-y-3.5">
          {data.slice(0, 7).map((row) => {
            const maxVal = Math.max(
              ...data.map((r) => Math.max(Math.abs(r.fiiNet), Math.abs(r.diiNet))),
              3000
            );
            const fiiWidth = Math.min(100, (Math.abs(row.fiiNet) / maxVal) * 100);
            const diiWidth = Math.min(100, (Math.abs(row.diiNet) / maxVal) * 100);

            return (
              <div key={row.date} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground w-28 font-sans font-medium">{row.date}</span>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-semibold ${
                        row.fiiNet >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      FII: {row.fiiNet > 0 ? "+" : ""}
                      {row.fiiNet.toFixed(0)} Cr
                    </span>
                    <span
                      className={`font-semibold ${
                        row.diiNet >= 0 ? "text-cyan-500" : "text-rose-500"
                      }`}
                    >
                      DII: {row.diiNet > 0 ? "+" : ""}
                      {row.diiNet.toFixed(0)} Cr
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 h-2.5 bg-secondary/50 rounded-full p-0.5 overflow-hidden">
                  <div className="flex justify-end">
                    <div
                      style={{ width: `${Math.max(4, fiiWidth)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        row.fiiNet >= 0 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="flex justify-start">
                    <div
                      style={{ width: `${Math.max(4, diiWidth)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        row.diiNet >= 0 ? "bg-cyan-500" : "bg-rose-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Historical Cash Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground">Daily Cash Market Breakdown</h3>
            <p className="text-xs text-muted-foreground">Official NSE & BSE institutional trade summary</p>
          </div>
          <span className="text-xs text-muted-foreground font-mono bg-secondary/40 border border-border px-2.5 py-1 rounded-md self-start sm:self-auto">
            Unit: ₹ Crores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[11px] border-b border-border font-sans">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">FII Buy</th>
                <th className="py-3 px-4 font-semibold text-right">FII Sell</th>
                <th className="py-3 px-4 font-semibold text-right text-emerald-500">
                  FII Net
                </th>
                <th className="py-3 px-4 font-semibold text-right">DII Buy</th>
                <th className="py-3 px-4 font-semibold text-right">DII Sell</th>
                <th className="py-3 px-4 font-semibold text-right text-cyan-500">
                  DII Net
                </th>
                <th className="py-3 px-4 font-semibold text-right">Total Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-sans">
                    Loading live institutional flow data...
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.date} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4 text-foreground font-sans font-semibold">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {row.fiiBuy.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {row.fiiSell.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          row.fiiNet >= 0
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-rose-500/15 text-rose-500"
                        }`}
                      >
                        {row.fiiNet > 0 ? "+" : ""}
                        {row.fiiNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {row.diiBuy.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {row.diiSell.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          row.diiNet >= 0
                            ? "bg-cyan-500/15 text-cyan-500"
                            : "bg-rose-500/15 text-rose-500"
                        }`}
                      >
                        {row.diiNet > 0 ? "+" : ""}
                        {row.diiNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        row.totalNet >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {row.totalNet > 0 ? "+" : ""}
                      {row.totalNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default FIIDIISection;
