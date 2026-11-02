"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Flame,
  Search,
  Activity,
  DollarSign,
  Coins,
  Building2,
  LineChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarketItem {
  name: string;
  link: string;
  actual: string;
  chg: string;
  pctChg: string;
}

interface CommodityData {
  timestamp: string;
  sections: {
    Commodity: MarketItem[];
    Index: MarketItem[];
    Share: MarketItem[];
    FX: MarketItem[];
    Crypto: MarketItem[];
    Bond: MarketItem[];
  };
}

const TABS = [
  { key: "Commodity", label: "Commodity", icon: Flame },
  { key: "Index", label: "Stocks / Indices", icon: LineChart },
  { key: "Share", label: "Shares", icon: Building2 },
  { key: "FX", label: "Forex", icon: DollarSign },
  { key: "Crypto", label: "Crypto", icon: Coins },
  { key: "Bond", label: "Bonds", icon: Activity },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function CrudeOilTracker() {
  const [data, setData] = useState<CommodityData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("Commodity");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/commodity/crude-oil");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load commodity data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000); // Live poll every 30s
    return () => clearInterval(interval);
  }, []);

  const currentList = data?.sections?.[activeTab] || [];
  const filteredList = currentList.filter((item) =>
    searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  // Key highlights (Crude Oil, Brent, Gold, Natural Gas)
  const crudeOil = data?.sections?.Commodity?.find((c) => c.name.toLowerCase() === "crude oil");
  const brent = data?.sections?.Commodity?.find((c) => c.name.toLowerCase() === "brent");
  const naturalGas = data?.sections?.Commodity?.find((c) => c.name.toLowerCase() === "natural gas");
  const gold = data?.sections?.Commodity?.find((c) => c.name.toLowerCase() === "gold");

  const highlights = [
    { title: "WTI Crude Oil", item: crudeOil, subtitle: "USD / Barrel" },
    { title: "Brent Crude", item: brent, subtitle: "USD / Barrel" },
    { title: "Natural Gas", item: naturalGas, subtitle: "USD / MMBtu" },
    { title: "Gold", item: gold, subtitle: "USD / t.oz" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-amber-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Crude Oil & Global Commodities</h1>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
                Live Feed
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Direct real-time market tracker synced with{" "}
              <a
                href="https://tradingeconomics.com/commodity/crude-oil"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                tradingeconomics.com <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="gap-2 font-medium"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </Button>
            {data?.timestamp && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {highlights.map((h, i) => {
            const isPos = h.item?.pctChg ? !h.item.pctChg.startsWith("-") : true;
            return (
              <Card key={i} className="bg-background/60 border border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h.title}
                    </span>
                    {h.item && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded",
                          isPos
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {h.item.pctChg}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold tracking-tight">
                      {h.item?.actual ? `$${h.item.actual}` : "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-between">
                      <span>{h.subtitle}</span>
                      {h.item && (
                        <span className={isPos ? "text-emerald-600" : "text-rose-600"}>
                          {isPos ? `+${h.item.chg}` : h.item.chg}
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = data?.sections?.[tab.key]?.length || 0;
            const isActive = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "gap-2 shrink-0 h-9 font-medium transition-all",
                  isActive
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg bg-card"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card className="border border-border/80 shadow-md overflow-hidden bg-card">
        <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>{TABS.find((t) => t.key === activeTab)?.label} Live Rates</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing actual price, absolute change and percentage gain/loss
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {filteredList.length} items
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border/60 select-none">
                <tr>
                  <th className="py-3 px-4 font-semibold">Instrument / Asset</th>
                  <th className="py-3 px-4 font-semibold text-right">Actual</th>
                  <th className="py-3 px-4 font-semibold text-right">Chg</th>
                  <th className="py-3 px-4 font-semibold text-right">%Chg</th>
                  <th className="py-3 px-4 font-semibold text-center w-16">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading && !data ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                        <span className="text-xs">Fetching live rates from TradingEconomics...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                      No assets found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const isPos = item.pctChg ? !item.pctChg.startsWith("-") : true;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="py-3 px-4 font-semibold text-foreground">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <span>{item.name}</span>
                          </a>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                          {item.actual}
                        </td>
                        <td
                          className={cn(
                            "py-3 px-4 text-right font-mono text-xs font-semibold",
                            isPos
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {isPos ? `+${item.chg}` : item.chg}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded",
                              isPos
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {isPos ? (
                              <TrendingUp className="h-3 w-3 stroke-[2.5]" />
                            ) : (
                              <TrendingDown className="h-3 w-3 stroke-[2.5]" />
                            )}
                            {item.pctChg}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-amber-500 transition-colors inline-block"
                            title={`Open ${item.name} on TradingEconomics`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

