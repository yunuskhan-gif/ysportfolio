import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioValueChart from "@/components/dashboard/PortfolioValueChart";
import PortfolioMetricCards from "@/components/blocks/stats/PortfolioMetricCards";
import { fetchHoldings, HOLDINGS_QUERY_KEY, type StockHolding } from "@/lib/portfolio-api";

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

interface ChartPoint {
  timestamp: number;
  value: number;
}

const Dashboard = () => {
  const { data: holdings = [] } = useQuery({
    queryKey: HOLDINGS_QUERY_KEY,
    queryFn: fetchHoldings,
  });

  const uniqueSymbols = useMemo(
    () => [...new Set(holdings.map((holding) => holding.symbol).filter(Boolean))],
    [holdings]
  );

  const { data: prices = {} } = useQuery({
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
      };
    });
  }, [holdings, prices]);

  const stats = useMemo(() => {
    const investment = enrichedHoldings.reduce((sum, holding) => sum + holding.investment, 0);
    const pricedHoldings = enrichedHoldings.filter((holding) => holding.currentValue !== null);
    const currentValue = pricedHoldings.reduce(
      (sum, holding) => sum + (holding.currentValue ?? 0),
      0
    );
    const totalPnl = currentValue - investment;
    const totalPnlPercent = investment > 0 ? (totalPnl / investment) * 100 : 0;
    const topInvestment = enrichedHoldings.reduce(
      (best, holding) => (holding.investment > best ? holding.investment : best),
      0
    );

    return {
      investment,
      count: holdings.length,
      currentValue,
      totalPnl,
      totalPnlPercent,
      pricedCount: pricedHoldings.length,
      concentration: investment > 0 ? (topInvestment / investment) * 100 : 0,
    };
  }, [enrichedHoldings, holdings.length]);

  const chartData = useMemo(() => {
    return enrichedHoldings.map((holding) => ({
      name: holding.name,
      value: holding.currentValue ?? holding.investment,
    }));
  }, [enrichedHoldings]);

  const buildSeries = (values: number[], cumulative = true): ChartPoint[] => {
    const now = Date.now();
    let runningValue = 0;

    return values.map((value, index) => {
      runningValue = cumulative ? runningValue + value : value;
      return {
        timestamp: now - (values.length - index) * 3600000,
        value: runningValue,
      };
    });
  };

  const metricCards = useMemo(() => {
    const investmentSeries = buildSeries(
      [...enrichedHoldings]
        .sort((a, b) => b.investment - a.investment)
        .map((holding) => holding.investment)
    );
    const holdingsSeries = buildSeries(
      enrichedHoldings.map((_, index) => index + 1),
      false
    );
    const currentValueSeries = buildSeries(
      [...enrichedHoldings]
        .filter((holding) => holding.currentValue !== null)
        .sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0))
        .map((holding) => holding.currentValue ?? 0)
    );
    const pnlSeries = buildSeries(
      [...enrichedHoldings]
        .filter((holding) => holding.pnlPercent !== null)
        .sort((a, b) => Math.abs(b.pnlPercent ?? 0) - Math.abs(a.pnlPercent ?? 0))
        .map((holding) => holding.pnlPercent ?? 0),
      false
    );

    return [
      {
        title: "Total Invested",
        currentValue: stats.investment,
        prevValue: stats.investment - (enrichedHoldings[0]?.investment ?? 0),
        data: investmentSeries.length > 0 ? investmentSeries : [{ timestamp: Date.now(), value: 0 }],
      },
      {
        title: "Holdings",
        currentValue: stats.count,
        prevValue: Math.max(stats.count - 1, 0),
        data: holdingsSeries.length > 0 ? holdingsSeries : [{ timestamp: Date.now(), value: 0 }],
      },
      {
        title: "Current Value",
        currentValue: stats.currentValue,
        prevValue: stats.investment,
        data: currentValueSeries.length > 0 ? currentValueSeries : [{ timestamp: Date.now(), value: 0 }],
      },
      {
        title: "Total P&L",
        currentValue: stats.totalPnlPercent,
        prevValue: 0,
        data: pnlSeries.length > 0 ? pnlSeries : [{ timestamp: Date.now(), value: 0 }],
        flag: 1,
      },
    ];
  }, [enrichedHoldings, stats]);

  const topPerformer = useMemo(
    () =>
      [...enrichedHoldings]
        .filter((holding) => holding.pnlPercent !== null)
        .sort((a, b) => (b.pnlPercent ?? -Infinity) - (a.pnlPercent ?? -Infinity))[0] ?? null,
    [enrichedHoldings]
  );

  const underperformer = useMemo(
    () =>
      [...enrichedHoldings]
        .filter((holding) => holding.pnlPercent !== null)
        .sort((a, b) => (a.pnlPercent ?? Infinity) - (b.pnlPercent ?? Infinity))[0] ?? null,
    [enrichedHoldings]
  );

  return (
    <div className="w-full space-y-4">
      <PortfolioMetricCards metrics={metricCards} />

      <PortfolioValueChart data={chartData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-none border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 gap-2">
              <span className="text-xs font-medium">Top Performer</span>
              <span className="text-xs font-bold text-emerald-500 text-right">
                {topPerformer
                  ? `${topPerformer.symbol.replace(".NS", "")} (${(topPerformer.pnlPercent ?? 0) >= 0 ? "+" : ""}${(topPerformer.pnlPercent ?? 0).toFixed(2)}%)`
                  : "Waiting for live prices"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 gap-2">
              <span className="text-xs font-medium">Underperforming</span>
              <span className="text-xs font-bold text-red-500 text-right">
                {underperformer
                  ? `${underperformer.symbol.replace(".NS", "")} (${(underperformer.pnlPercent ?? 0).toFixed(2)}%)`
                  : "Waiting for live prices"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Portfolio Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(stats.concentration, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {stats.count > 0
                ? `Top holding concentration is ${stats.concentration.toFixed(1)}% of invested capital. Live prices available for ${stats.pricedCount}/${stats.count} stocks.`
                : "Add holdings to see portfolio health."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
