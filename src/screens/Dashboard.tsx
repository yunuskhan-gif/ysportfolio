import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioValueChart from "@/components/dashboard/PortfolioValueChart";
import PortfolioMetricCards from "@/components/blocks/stats/PortfolioMetricCards";
import { fetchHoldings, HOLDINGS_QUERY_KEY, type StockHolding } from "@/lib/portfolio-api";
import { isMutualFund } from "@/lib/utils";

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

const DashboardSection = ({ title, holdings }: { title: string; holdings: EnrichedHolding[] }) => {
  const stats = useMemo(() => {
    const investment = holdings.reduce((sum, holding) => sum + holding.investment, 0);
    const pricedHoldings = holdings.filter((holding) => holding.currentValue !== null);
    const currentValue = holdings.reduce(
      (sum, holding) => sum + (holding.currentValue ?? holding.investment),
      0
    );
    const totalPnl = currentValue - investment;
    const totalPnlPercent = investment > 0 ? (totalPnl / investment) * 100 : 0;
    const topInvestment = holdings.reduce(
      (best, holding) => (holding.investment > best ? holding.investment : best),
      0
    );

    const dayPnl = holdings.reduce((sum, holding) => sum + holding.qty * holding.change, 0);
    const pricedCurrentValue = pricedHoldings.reduce((sum, holding) => sum + (holding.currentValue ?? 0), 0);
    const dayPnlPercent = pricedCurrentValue > 0 ? (dayPnl / (pricedCurrentValue - dayPnl)) * 100 : 0;

    return {
      investment,
      count: holdings.length,
      currentValue,
      totalPnl,
      totalPnlPercent,
      dayPnl,
      dayPnlPercent,
      pricedCount: pricedHoldings.length,
      concentration: investment > 0 ? (topInvestment / investment) * 100 : 0,
    };
  }, [holdings]);

  const chartData = useMemo(() => {
    return holdings.map((holding) => ({
      name: holding.name,
      value: holding.currentValue ?? holding.investment,
    }));
  }, [holdings]);

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
      [...holdings]
        .sort((a, b) => b.investment - a.investment)
        .map((holding) => holding.investment)
    );
    const holdingsSeries = buildSeries(
      holdings.map((_, index) => index + 1),
      false
    );
    const currentValueSeries = buildSeries(
      [...holdings]
        .sort((a, b) => (b.currentValue ?? b.investment) - (a.currentValue ?? a.investment))
        .map((holding) => holding.currentValue ?? holding.investment)
    );
    const pnlSeries = buildSeries(
      [...holdings]
        .filter((holding) => holding.pnl !== null)
        .sort((a, b) => Math.abs(b.pnl ?? 0) - Math.abs(a.pnl ?? 0))
        .map((holding) => holding.pnl ?? 0),
      false
    );
    const dayPnlSeries = buildSeries(
      [...holdings]
        .filter((holding) => holding.currentValue !== null)
        .sort((a, b) => Math.abs(b.qty * b.change) - Math.abs(a.qty * a.change))
        .map((holding) => holding.qty * holding.change)
    );

    return [
      {
        title: "Total Invested",
        currentValue: stats.investment,
        prevValue: stats.investment - (holdings[0]?.investment ?? 0),
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
        currentValue: stats.totalPnl,
        prevValue: 0,
        data: pnlSeries.length > 0 ? pnlSeries : [{ timestamp: Date.now(), value: 0 }],
        flag: 0,
        customPercent: stats.totalPnlPercent,
      },
      {
        title: "Day P&L",
        currentValue: stats.dayPnl,
        prevValue: 0,
        data: dayPnlSeries.length > 0 ? dayPnlSeries : [{ timestamp: Date.now(), value: 0 }],
        flag: 0,
        customPercent: stats.dayPnlPercent,
      },
    ];
  }, [holdings, stats]);

  const topPerformer = useMemo(
    () =>
      [...holdings]
        .filter((holding) => holding.pnlPercent !== null)
        .sort((a, b) => (b.pnlPercent ?? -Infinity) - (a.pnlPercent ?? -Infinity))[0] ?? null,
    [holdings]
  );

  const underperformer = useMemo(
    () =>
      [...holdings]
        .filter((holding) => holding.pnlPercent !== null)
        .sort((a, b) => (a.pnlPercent ?? Infinity) - (b.pnlPercent ?? Infinity))[0] ?? null,
    [holdings]
  );

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <div className="h-px bg-border flex-1 ml-4 rounded-full opacity-50"></div>
      </div>

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
                ? `Top holding concentration is ${stats.concentration.toFixed(1)}% of invested capital. Live prices available for ${stats.pricedCount}/${stats.count} assets.`
                : "Add holdings to see portfolio health."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
    refetchInterval: 10000, // Live auto-refresh every 10 seconds
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

  const stockHoldings = useMemo(() => enrichedHoldings.filter(h => !isMutualFund(h.symbol)), [enrichedHoldings]);
  const mfHoldings = useMemo(() => enrichedHoldings.filter(h => isMutualFund(h.symbol)), [enrichedHoldings]);

  return (
    <div className="w-full">
      {stockHoldings.length > 0 && <DashboardSection title="Stocks Overview" holdings={stockHoldings} />}
      {mfHoldings.length > 0 && <DashboardSection title="Mutual Funds Overview" holdings={mfHoldings} />}
      {stockHoldings.length === 0 && mfHoldings.length === 0 && (
        <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
          No holdings found. Add some to get started!
        </div>
      )}
    </div>
  );
};

export default Dashboard;
