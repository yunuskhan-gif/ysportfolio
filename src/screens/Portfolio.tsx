// src/pages/Portfolio.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteHolding,
  fetchHoldings,
  HOLDINGS_QUERY_KEY,
  replaceHoldings,
  type StockHolding,
} from "@/lib/portfolio-api";
import AddStockDialog from "@/components/portfolio/AddStockDialog";
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Upload,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

type EnrichedHolding = StockHolding & {
  investment: number;
  ltp: number | null;
  currentValue: number | null;
  pnl: number | null;
  pnlPercent: number | null;
  change: number;
  changePercent: number;
};

type SortField =
  | "name"
  | "qty"
  | "avgPrice"
  | "investment"
  | "app"
  | "ltp"
  | "currentValue"
  | "pnl"
  | "pnlPercent";
type SortDirection = "asc" | "desc";

type MetricTrendPoint = {
  timestamp: number;
  label: string;
  value: number;
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatCompact = (value: number) => {
  if (Math.abs(value) >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
  if (Math.abs(value) >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  return formatINR(value);
};

const PortfolioShimmer = () => (
  <div className="w-full space-y-2 animate-in fade-in duration-500">
    <div className="flex flex-nowrap overflow-x-auto gap-2 md:grid md:grid-cols-2 lg:grid-cols-4 no-scrollbar">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-none min-w-[280px] md:min-w-0">
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-2 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="shadow-none">
      <div className="p-2">
        <div className="rounded-md border p-4 bg-muted/10">
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 pb-2 border-b">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-4 py-1">
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-8 w-full rounded-md" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const metricChartConfig: ChartConfig = {
  value: {
    label: "Value",
    color: "var(--primary)",
  },
};

const PortfolioTrendCard = ({
  title,
  value,
  subtitle,
  chartData,
  emptyLabel = "No chart data yet",
  valueClassName = "",
  accentColor = "var(--primary)",
  formatter = formatINR,
  changeText,
  changePositive = true,
}: {
  title: string;
  value: string;
  subtitle?: string;
  chartData: MetricTrendPoint[];
  emptyLabel?: string;
  valueClassName?: string;
  accentColor?: string;
  formatter?: (value: number) => string;
  changeText: string;
  changePositive?: boolean;
}) => (
  <Card className="h-[150px] max-sm:h-[135px] shadow-none border-border !p-0 !gap-0 flex flex-col overflow-hidden snap-center min-w-[280px] md:min-w-0">
    <div className="flex-none pt-1 px-2 py-1 pb-0 space-y-0 max-sm:pt-0.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-normal text-muted-foreground truncate max-sm:text-[10px]">
          {title}
        </p>
        <Badge
          variant="outline"
          className={`flex items-center gap-1 rounded-md text-[10px] py-0.5 max-sm:text-[8px] max-sm:py-0 ${
            changePositive
              ? "text-primary border-primary/20"
              : "text-destructive border-destructive/20"
          }`}
        >
          {changePositive ? (
            <TrendingUpIcon className="size-3 max-sm:size-2.5" />
          ) : (
            <TrendingDownIcon className="size-3 max-sm:size-2.5" />
          )}
          <span className="text-[7px] max-sm:text-[6px]">
            {changePositive ? "+" : ""}
            {changeText}
          </span>
        </Badge>
      </div>
      <p className={`text-lg font-normal tabular-nums leading-tight truncate mt-0.5 ${valueClassName} max-sm:text-base`}>
        {value}
      </p>
      {subtitle ? <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{subtitle}</p> : null}
    </div>

    <div className="h-2 w-full max-sm:h-1" />

    <CardContent className="flex-1 !p-0 min-h-0 flex flex-col">
      <div className="flex-1">
        {chartData.length > 0 ? (
          <ChartContainer
            className="h-full w-full"
            config={{
              ...metricChartConfig,
              value: {
                label: title,
                color: accentColor,
              },
            }}
          >
            <AreaChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: -10 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.2} />
              <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={false} />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <ChartTooltip
                cursor={{ stroke: "var(--color-value)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    className="text-[10px] py-1 px-2"
                    hideLabel={false}
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload;
                      return (
                        <div className="flex items-center gap-1 mb-1 border-b pb-1 border-border/50 font-medium whitespace-nowrap">
                          <span className="text-muted-foreground">Stock:</span>
                          <span>{point?.label ?? title}</span>
                        </div>
                      );
                    }}
                    formatter={(chartValue) => [formatter(Number(chartValue) || 0), title]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={1.5}
                fill="var(--color-value)"
                fillOpacity={0.14}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-md bg-muted/20 text-[10px] text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const Portfolio = () => {
  const queryClient = useQueryClient();
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("pnl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<StockHolding | null>(null);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);

  const handleSaveSnapshot = async () => {
    try {
      setIsSavingSnapshot(true);
      const snapshotPayload = {
        totalInvested: totalInvestment,
        currentValue: totalCurrentValue,
        totalPnL: totalPnl,
        pnlPercentage: totalPnlPercent,
        holdings: enrichedHoldings.map((h) => ({
          symbol: h.symbol,
          name: h.name,
          qty: h.qty,
          avgPrice: h.avgPrice,
          ltp: h.ltp ?? 0,
          currentValue: h.currentValue ?? 0,
          pnl: h.pnl ?? 0,
          pnlPercentage: h.pnlPercent ?? 0,
        })),
      };

      const response = await fetch("/api/portfolio/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshotPayload),
      });

      if (!response.ok) throw new Error("Failed to save snapshot");
      toast.success("Snapshot saved successfully!");
    } catch (e: any) {
      toast.error("Failed to save snapshot: " + e.message);
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const { data: holdings = [], isLoading: loading } = useQuery({
    queryKey: HOLDINGS_QUERY_KEY,
    queryFn: fetchHoldings,
  });

  const uniqueSymbols = useMemo(
    () => [...new Set(holdings.map((holding) => holding.symbol).filter(Boolean))],
    [holdings]
  );

  const {
    data: priceQueryData,
    isFetching: isRefreshing,
    error: priceError,
    dataUpdatedAt,
    refetch: refetchPrices,
  } = useQuery({
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
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const prices = priceQueryData ?? {};
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const deleteHoldingMutation = useMutation({
    mutationFn: deleteHolding,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      toast.success("Holding deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete holding.");
    },
  });

  const replaceHoldingsMutation = useMutation({
    mutationFn: replaceHoldings,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      setSelectedIds([]);
      toast.success(
        variables.length === 0 ? "All holdings deleted." : "Selected holdings deleted."
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update holdings.");
    },
  });

  const enrichedHoldings: EnrichedHolding[] = holdings.map((holding) => {
    const investment = holding.qty * holding.avgPrice;
    const livePrice = prices[holding.symbol];
    const ltp = typeof livePrice?.price === "number" ? livePrice.price : null;
    const currentValue = ltp === null ? null : holding.qty * ltp;
    const pnl = currentValue === null ? null : currentValue - investment;
    const pnlPercent = pnl === null || investment <= 0 ? null : (pnl / investment) * 100;

    return {
      ...holding,
      investment,
      ltp,
      currentValue,
      pnl,
      pnlPercent,
      change: livePrice?.change ?? 0,
      changePercent: livePrice?.changePercent ?? 0,
    };
  });

  const filtered = enrichedHoldings
    .filter((holding) => holding.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? Number(aVal ?? -Infinity) - Number(bVal ?? -Infinity)
        : Number(bVal ?? -Infinity) - Number(aVal ?? -Infinity);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedHoldings = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalInvestment = enrichedHoldings.reduce((sum, holding) => sum + holding.investment, 0);
  const totalQuantity = enrichedHoldings.reduce((sum, holding) => sum + holding.qty, 0);
  const pricedHoldings = enrichedHoldings.filter((holding) => holding.currentValue !== null);
  const totalCurrentValue = pricedHoldings.reduce(
    (sum, holding) => sum + (holding.currentValue ?? 0),
    0
  );
  const totalPnl = totalCurrentValue - totalInvestment;
  const totalPnlPercent = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  const buildTrendData = (
    items: EnrichedHolding[],
    valueGetter: (holding: EnrichedHolding) => number | null
  ) => {
    const now = Date.now();
    const filteredItems = items.filter((holding) => valueGetter(holding) !== null);
    let runningTotal = 0;

    return filteredItems.map((holding, index) => {
      runningTotal += valueGetter(holding) ?? 0;
      return {
        timestamp: now + index * 60000,
        label: holding.name,
        value: runningTotal,
      };
    });
  };

  const investmentTrendData = useMemo(
    () =>
      buildTrendData(
        [...enrichedHoldings].sort((a, b) => b.investment - a.investment),
        (holding) => holding.investment
      ),
    [enrichedHoldings]
  );

  const currentValueTrendData = useMemo(
    () =>
      buildTrendData(
        [...pricedHoldings].sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0)),
        (holding) => holding.currentValue
      ),
    [pricedHoldings]
  );

  const pnlTrendData = useMemo(
    () =>
      buildTrendData(
        [...pricedHoldings].sort((a, b) => Math.abs(b.pnl ?? 0) - Math.abs(a.pnl ?? 0)),
        (holding) => holding.pnl
      ),
    [pricedHoldings]
  );

  const holdingsTrendData = useMemo(() => {
    const now = Date.now();
    return enrichedHoldings.map((holding, index) => ({
      timestamp: now + index * 60000,
      label: holding.name,
      value: index + 1,
    }));
  }, [enrichedHoldings]);

  const priceCoveragePercent =
    holdings.length > 0 ? (pricedHoldings.length / holdings.length) * 100 : 0;
  const selectedOnPageCount = paginatedHoldings.filter((holding) =>
    holding.id ? selectedIds.includes(holding.id) : false
  ).length;
  const allOnPageSelected =
    paginatedHoldings.length > 0 && selectedOnPageCount === paginatedHoldings.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  const handleDeleteHolding = async (id?: string) => {
    if (!id) return;
    await deleteHoldingMutation.mutateAsync(id);
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
  };

  const toggleHoldingSelection = (id?: string) => {
    if (!id) return;
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = paginatedHoldings.map((holding) => holding.id).filter(Boolean) as string[];
    if (pageIds.length === 0) return;

    setSelectedIds((current) =>
      allOnPageSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select holdings first.");
      return;
    }

    const remainingHoldings = holdings.filter((holding) => !holding.id || !selectedIds.includes(holding.id));
    await replaceHoldingsMutation.mutateAsync(
      remainingHoldings.map(({ id, ...holding }) => holding)
    );
  };

  const handleDeleteAll = async () => {
    if (holdings.length === 0) {
      toast.error("No holdings to delete.");
      return;
    }

    await replaceHoldingsMutation.mutateAsync([]);
  };

  const handleEditHolding = (holding: StockHolding) => {
    setSelectedHolding(holding);
    setSelectedHoldingId(holding.id || null);
    setIsEditDialogOpen(true);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="w-3 h-3 opacity-20" />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  };

  if (loading) {
    return <PortfolioShimmer />;
  }

  return (
    <div className="w-full space-y-2 pb-20">
      {/* Mini Stats Row */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Stocks</p>
            <p className="text-sm font-semibold">{holdings.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Quantity</p>
            <p className="text-sm font-semibold">{totalQuantity.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Live Prices</p>
            <p className="text-sm font-semibold">{pricedHoldings.length}/{holdings.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Overall Return</p>
            <p className={`text-sm font-semibold ${totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {pricedHoldings.length > 0 ? `${totalPnl >= 0 ? "+" : ""}${totalPnlPercent.toFixed(2)}%` : "Pending"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Carousel */}
      <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-2 no-scrollbar md:grid md:grid-cols-2 xl:grid-cols-4">
        <PortfolioTrendCard
          title="Total Invested"
          value={formatCompact(totalInvestment)}
          subtitle=""
          chartData={investmentTrendData}
          changeText={`${holdings.length > 0 ? holdings.length : 0}.0%`}
          changePositive
        />

        <PortfolioTrendCard
          title="Holdings"
          value={holdings.length.toString()}
          subtitle=""
          chartData={holdingsTrendData}
          formatter={(metricValue) => metricValue.toLocaleString("en-IN")}
          changeText="0.0%"
          changePositive
        />

        <PortfolioTrendCard
          title="Current Value"
          value={pricedHoldings.length > 0 ? formatCompact(totalCurrentValue) : "--"}
          subtitle=""
          chartData={currentValueTrendData}
          changeText={`${priceCoveragePercent.toFixed(1)}%`}
          changePositive={pricedHoldings.length > 0}
        />

        <PortfolioTrendCard
          title="Total P&L"
          value={pricedHoldings.length > 0 ? `${totalPnl >= 0 ? "+" : ""}${formatCompact(totalPnl)}` : "--"}
          subtitle=""
          chartData={pnlTrendData}
          valueClassName={totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}
          accentColor={totalPnl >= 0 ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"}
          changeText={`${Math.abs(totalPnlPercent).toFixed(1)}%`}
          changePositive={totalPnl >= 0}
        />
      </div>

      {/* Holdings Table */}
      <Card className="shadow-none border-border">
        <div className="px-2 py-2">
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div className="relative max-w-xs flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search holdings..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted"
                onClick={() => void refetchPrices()}
                title="Refresh Prices"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteSelected()}
                disabled={selectedIds.length === 0 || replaceHoldingsMutation.isPending}
                className="rounded-md border border-border px-3 py-1.5 text-[10px] font-medium text-muted-foreground disabled:opacity-50 hover:bg-red-500/10 hover:text-red-500 whitespace-nowrap"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={handleSaveSnapshot}
                disabled={isSavingSnapshot || enrichedHoldings.length === 0}
                className="rounded-md border border-border px-3 py-1.5 text-[10px] font-medium text-muted-foreground disabled:opacity-50 hover:bg-primary/10 hover:text-primary whitespace-nowrap"
              >
                {isSavingSnapshot ? "Saving..." : "Save Snapshot"}
              </button>
            </div>
          </div>

          <div className="rounded-md border bg-muted/5 overflow-x-auto no-scrollbar">
            <table className="w-full text-xs min-w-[1000px]">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                  </th>
                  <th className="text-left px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase w-6">#</th>
                  <th className="text-left px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("name")}>
                    <span className="flex items-center gap-0.5">Stock <SortIcon field="name" /></span>
                  </th>
                  <th className="text-left px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("app")}>
                    <span className="flex items-center gap-0.5">App <SortIcon field="app" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("qty")}>
                    <span className="flex items-center justify-end gap-0.5">Qty <SortIcon field="qty" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("avgPrice")}>
                    <span className="flex items-center justify-end gap-0.5">Avg Price <SortIcon field="avgPrice" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("ltp")}>
                    <span className="flex items-center justify-end gap-0.5">LTP <SortIcon field="ltp" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("investment")}>
                    <span className="flex items-center justify-end gap-0.5">Investment <SortIcon field="investment" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("currentValue")}>
                    <span className="flex items-center justify-end gap-0.5">Current <SortIcon field="currentValue" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase cursor-pointer select-none" onClick={() => handleSort("pnl")}>
                    <span className="flex items-center justify-end gap-0.5">P&amp;L <SortIcon field="pnl" /></span>
                  </th>
                  <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHoldings.length > 0 ? (
                  paginatedHoldings.map((stock, index) => (
                    <tr
                      key={stock.id ?? `stock-${index}`}
                      className={`border-b border-border transition-colors hover:bg-muted/50 ${
                        selectedIds.includes(stock.id ?? "") ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={stock.id ? selectedIds.includes(stock.id) : false}
                          onChange={() => toggleHoldingSelection(stock.id)}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                      </td>
                      <td className="px-3 py-2 text-muted-foreground/60">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary/90">{stock.name}</span>
                            {/^[A-Z]{2,}[0-9]+$/.test(stock.symbol) ? (
                              <span className="text-[8px] bg-blue-500/15 text-blue-600 px-1 rounded font-bold uppercase">MF</span>
                            ) : (
                              <span className="text-[8px] bg-emerald-500/15 text-emerald-600 px-1 rounded font-bold uppercase">Stock</span>
                            )}
                          </div>
                          <span className="text-[9px] text-muted-foreground uppercase">{stock.symbol}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[8px] font-normal px-1 py-0">{stock.app || "NSE"}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">{stock.qty.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">₹{stock.avgPrice.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold">₹{stock.ltp?.toLocaleString("en-IN") || "--"}</span>
                          {stock.changePercent !== 0 && (
                            <span className={`text-[9px] ${stock.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">₹{stock.investment.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        {stock.currentValue ? `₹${stock.currentValue.toLocaleString("en-IN")}` : "--"}
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${Number(stock.pnl) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        <div className="flex flex-col items-end">
                          <span>{stock.pnl ? `₹${stock.pnl.toLocaleString("en-IN")}` : "--"}</span>
                          {stock.pnlPercent !== null && (
                            <span className="text-[9px] font-normal opacity-80">({stock.pnlPercent >= 0 ? "+" : ""}{stock.pnlPercent.toFixed(2)}%)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => void refetchPrices()}
                            title="Resync Price"
                            className={`p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors ${isRefreshing ? "animate-spin" : ""}`}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => void handleDeleteHolding(stock.id)}
                            title="Delete Holding"
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-20 text-center text-muted-foreground italic">
                      No stocks found. Add one or search to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AddStockDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editHolding={selectedHolding}
        onStockAdded={() => void queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY })}
      />
    </div>
  );
};

export default Portfolio;
