"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchHoldings, HOLDINGS_QUERY_KEY, type StockHolding } from "@/lib/portfolio-api";
import { BrainCircuit, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface EnrichedHolding extends StockHolding {
  investment: number;
  currentValue: number | null;
  pnl: number | null;
  pnlPercent: number | null;
}

export default function AIInsights() {
  const { data: holdings = [], isLoading: loadingHoldings } = useQuery({
    queryKey: HOLDINGS_QUERY_KEY,
    queryFn: fetchHoldings,
  });

  const uniqueSymbols = useMemo(
    () => [...new Set(holdings.map((holding) => holding.symbol).filter(Boolean))],
    [holdings]
  );

  const { data: prices = {}, isLoading: loadingPrices } = useQuery({
    queryKey: ["portfolio", "prices", uniqueSymbols.join(",")],
    enabled: uniqueSymbols.length > 0,
    queryFn: async () => {
      const response = await fetch(
        `/api/prices?symbols=${encodeURIComponent(uniqueSymbols.join(","))}`
      );
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || "Failed to fetch live prices");
      }

      const nextPrices: Record<string, PriceData> = {};
      data.forEach((price) => {
        if (price?.symbol && typeof price?.price === "number") {
          nextPrices[price.symbol] = {
            symbol: price.symbol,
            price: price.price,
            change: typeof price.change === "number" ? price.change : 0,
            changePercent: typeof price.changePercent === "number" ? price.changePercent : 0,
          };
        }
      });

      return nextPrices;
    },
    refetchInterval: 60000,
  });

  const enrichedHoldings = useMemo<EnrichedHolding[]>(() => {
    return holdings.map((holding) => {
      const investment = holding.qty * holding.avgPrice;
      const livePrice = prices[holding.symbol];
      const currentValue =
        typeof livePrice?.price === "number" ? holding.qty * livePrice.price : null;
      const pnl = currentValue === null ? null : currentValue - investment;
      const pnlPercent =
        pnl === null || investment <= 0 ? null : (pnl / investment) * 100;

      return {
        ...holding,
        investment,
        currentValue,
        pnl,
        pnlPercent,
        change: livePrice?.change ?? 0,
        changePercent: livePrice?.changePercent ?? 0,
      };
    });
  }, [holdings, prices]);

  const insights = useMemo(() => {
    const pricedHoldings = enrichedHoldings.filter((h) => h.pnlPercent !== null);

    const buySuggestions = pricedHoldings
      .filter((h) => (h.pnlPercent ?? 0) < -10)
      .sort((a, b) => (a.pnlPercent ?? 0) - (b.pnlPercent ?? 0));

    const sellSuggestions = pricedHoldings
      .filter((h) => (h.pnlPercent ?? 0) > 20)
      .sort((a, b) => (b.pnlPercent ?? 0) - (a.pnlPercent ?? 0));

    const momentumHoldings = pricedHoldings
      .filter((h) => h.changePercent > 3 && (h.pnlPercent ?? 0) > 0)
      .sort((a, b) => b.changePercent - a.changePercent);

    return { buySuggestions, sellSuggestions, momentumHoldings };
  }, [enrichedHoldings]);

  if (loadingHoldings || loadingPrices) {
    return (
      <div className="w-full space-y-4 p-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-primary/10 p-6 rounded-2xl border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Portfolio Advisor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Smart algorithmic insights based on your portfolio performance, momentum, and technical indicators.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-xs">Live Analysis Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Buy/Averaging Suggestions */}
        <Card className="shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-4 h-4" />
              Averaging Opportunities (Buy)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {insights.buySuggestions.length > 0 ? (
              insights.buySuggestions.map((stock) => (
                <div key={stock.id} className="p-3 bg-secondary/30 rounded-lg border border-border/50 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{stock.name}</span>
                    <Badge variant="outline" className="text-red-500 border-red-500/30 text-[10px]">
                      {stock.pnlPercent?.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    This asset is currently trading at a significant discount from your average price of ₹{stock.avgPrice}. If the underlying fundamentals are still strong, this could be a good opportunity to average down your cost.
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                No immediate averaging opportunities found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Booking Suggestions */}
        <Card className="shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              Profit Booking (Sell)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {insights.sellSuggestions.length > 0 ? (
              insights.sellSuggestions.map((stock) => (
                <div key={stock.id} className="p-3 bg-secondary/30 rounded-lg border border-border/50 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{stock.name}</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                      +{stock.pnlPercent?.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    You have realized a substantial return on this investment. Consider booking partial profits to secure your gains or reallocate capital to other opportunities.
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                Hold your positions. No major profit booking signals detected yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Momentum / Hot Stocks */}
        <Card className="shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-500">
              <Zap className="w-4 h-4" />
              High Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {insights.momentumHoldings.length > 0 ? (
              insights.momentumHoldings.map((stock) => (
                <div key={stock.id} className="p-3 bg-secondary/30 rounded-lg border border-border/50 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{stock.name}</span>
                    <Badge variant="outline" className="text-orange-500 border-orange-500/30 text-[10px]">
                      Day: +{stock.changePercent?.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    This asset is showing very strong daily momentum and upward trend. It might be wise to hold onto this winner and let the profits run further.
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                Market is relatively stable. No aggressive daily momentum detected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            General Market Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This is an algorithmic analysis based on your portfolio's historical data and real-time market fluctuations. It identifies statistical opportunities such as mean-reversion (averaging down) and momentum (riding the trend). It does not read company balance sheets or news. Always consult a financial advisor before making large trades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
