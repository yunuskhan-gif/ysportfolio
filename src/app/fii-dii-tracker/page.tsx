"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  Settings,
  Play,
  Calendar,
  Lock,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  LogOut,
  ChevronRight,
  ChevronDown,
  User,
  Activity,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend
} from "recharts";
import toast from "react-hot-toast";
import StockScreenerDialog from "@/components/shared/StockScreenerDialog";

type StockRow = {
  stockName: string;
  ticker: string;
  price: number;
  fiiShares: number;
  fiiValue: number;
  diiShares: number;
  diiValue: number;
};

type SectorRow = {
  sectorName: string;
  auc: number;
  netInvestment: number;
  percentageChange: number;
  fiiAuc?: number;
  fiiNetInvestment?: number;
  fiiPercentageChange?: number;
  diiAuc?: number;
  diiNetInvestment?: number;
  diiPercentageChange?: number;
  stocks?: StockRow[];
};

type TrendDataPoint = {
  date: string;
  sectors: Record<string, {
    auc: number;
    netInvestment: number;
    percentageChange: number;
    fiiAuc?: number;
    fiiNetInvestment?: number;
    fiiPercentageChange?: number;
    diiAuc?: number;
    diiNetInvestment?: number;
    diiPercentageChange?: number;
  }>;
};

export default function FiiDiiTracker() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  // App states
  const [activeTab, setActiveTab] = useState<"report" | "trends" | "scheduler">("report");
  const [fortnights, setFortnights] = useState<string[]>([]);
  const [selectedFortnight, setSelectedFortnight] = useState<string>("");
  const [reportSectors, setReportSectors] = useState<SectorRow[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Watchlist states
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filterWatchlist, setFilterWatchlist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Table View states
  const [viewMode, setViewMode] = useState<"combined" | "fii" | "dii">("combined");
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);

  // Trends states
  const [trendsData, setTrendsData] = useState<TrendDataPoint[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [chartType, setChartType] = useState<"netInvestment" | "auc">("netInvestment");
  const [chartEntity, setChartEntity] = useState<"fii" | "dii" | "total">("total");
  const [selectedChartSectors, setSelectedChartSectors] = useState<string[]>(["Financial Services", "Information Technology"]);

  // Scheduler states
  const [schedulerInfo, setSchedulerInfo] = useState<any>(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);

  // Screener dialog states
  const [screenerSymbol, setScreenerSymbol] = useState<string | null>(null);
  const [screenerName, setScreenerName] = useState<string>("");
  const [isScreenerOpen, setIsScreenerOpen] = useState(false);

  const handleOpenScreener = (symbol: string, name: string) => {
    setScreenerSymbol(symbol);
    setScreenerName(name);
    setIsScreenerOpen(true);
  };

  // Check token on mount
  useEffect(() => {
    setMounted(true);
    const mockToken = "default_token";
    setToken(mockToken);
    setUser({ id: "default_user", username: "Admin" });
    fetchWatchlist(mockToken);
    fetchFortnights();
  }, []);

  const fetchWatchlist = async (authToken: string) => {
    try {
      const res = await fetch("/api/fii-dii/watchlist", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist);
      }
    } catch (err) {
      console.error("Watchlist fetch failed", err);
    }
  };

  const toggleWatchlistSector = async (sectorName: string) => {
    if (!token) return;
    try {
      const res = await fetch("/api/fii-dii/watchlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sector: sectorName })
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist);
        toast.success(`${sectorName} ${data.watchlist.includes(sectorName) ? "added to" : "removed from"} watchlist`);
      }
    } catch (err) {
      toast.error("Failed to update watchlist");
    }
  };

  const fetchFortnights = async () => {
    try {
      const res = await fetch("/api/fii-dii/fortnights");
      if (res.ok) {
        const data = await res.json();
        setFortnights(data.fortnights);
        if (data.fortnights.length > 0) {
          setSelectedFortnight(data.fortnights[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch report details for a date
  const fetchReport = useCallback(async (date: string) => {
    if (!date) return;
    setReportLoading(true);
    try {
      const res = await fetch(`/api/fii-dii/report?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setReportSectors(data.sectors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFortnight) {
      fetchReport(selectedFortnight);
    }
  }, [selectedFortnight, fetchReport]);

  // Fetch trends
  const fetchTrends = async () => {
    setTrendsLoading(true);
    try {
      const res = await fetch("/api/fii-dii/trends");
      if (res.ok) {
        const data = await res.json();
        setTrendsData(data.trends);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTrendsLoading(false);
    }
  };

  // Fetch scheduler console details
  const fetchSchedulerStatus = async () => {
    setSchedulerLoading(true);
    try {
      const res = await fetch("/api/fii-dii/scheduler/status");
      if (res.ok) {
        const data = await res.json();
        setSchedulerInfo(data.schedulerInfo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSchedulerLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === "trends") {
        fetchTrends();
      } else if (activeTab === "scheduler") {
        fetchSchedulerStatus();
      }
    }
  }, [activeTab, token]);

  const configureScheduler = async (freq: "daily" | "fortnightly") => {
    setSchedulerLoading(true);
    try {
      const res = await fetch("/api/fii-dii/scheduler/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency: freq })
      });
      if (res.ok) {
        const data = await res.json();
        setSchedulerInfo(data.schedulerInfo);
        toast.success(`Scheduler interval set to ${freq}`);
      } else {
        toast.error("Failed to update scheduler frequency");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSchedulerLoading(false);
    }
  };

  const forceScrapeNow = async () => {
    setTriggerLoading(true);
    try {
      const res = await fetch("/api/fii-dii/scrape", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchFortnights();
        if (activeTab === "scheduler") {
          fetchSchedulerStatus();
        }
      } else {
        toast.error(data.error || "Execution failed");
      }
    } catch (err) {
      toast.error("Scraping trigger failed");
    } finally {
      setTriggerLoading(false);
    }
  };

  // Formatting currency
  const formatCrores = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    })
      .format(val)
      .replace("INR", "₹") + " Cr";
  };

  // Processing chart datasets
  const activeMetricKey = (() => {
    if (chartEntity === "fii") {
      return chartType === "auc" ? "fiiAuc" : "fiiNetInvestment";
    }
    if (chartEntity === "dii") {
      return chartType === "auc" ? "diiAuc" : "diiNetInvestment";
    }
    return chartType === "auc" ? "auc" : "netInvestment";
  })();

  const chartData = trendsData.map(d => {
    const point: any = { date: d.date };
    selectedChartSectors.forEach(secName => {
      const sectorMetrics = d.sectors[secName];
      const key = activeMetricKey;
      point[secName] = sectorMetrics
        ? ((sectorMetrics as any)[key] ?? (sectorMetrics as any)["netInvestment"] ?? 0)
        : 0;
    });
    return point;
  });

  const allSectorsList = reportSectors.map(s => s.sectorName);

  const toggleChartSectorSelection = (secName: string) => {
    if (selectedChartSectors.includes(secName)) {
      if (selectedChartSectors.length > 1) {
        setSelectedChartSectors(selectedChartSectors.filter(s => s !== secName));
      } else {
        toast.error("Please keep at least one sector selected");
      }
    } else {
      setSelectedChartSectors([...selectedChartSectors, secName]);
    }
  };

  // Filtered sectors list for report table
  const filteredSectors = reportSectors.filter(s => {
    const matchesSearch = s.sectorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWatchlist = !filterWatchlist || watchlist.includes(s.sectorName);
    return matchesSearch && matchesWatchlist;
  });

  const toggleSectorExpand = (sectorName: string) => {
    if (expandedSectors.includes(sectorName)) {
      setExpandedSectors(expandedSectors.filter(s => s !== sectorName));
    } else {
      setExpandedSectors([...expandedSectors, sectorName]);
    }
  };

  // Calculate stats
  const fiiTotalAuc = reportSectors.reduce((acc, curr) => acc + (curr.fiiAuc ?? curr.auc ?? 0), 0);
  const diiTotalAuc = reportSectors.reduce((acc, curr) => acc + (curr.diiAuc ?? 0), 0);
  const totalAuc = fiiTotalAuc + diiTotalAuc;

  // Sorted by Net Inflow
  const sortedByFiiInflow = [...reportSectors].sort(
    (a, b) => (b.fiiNetInvestment ?? b.netInvestment ?? 0) - (a.fiiNetInvestment ?? a.netInvestment ?? 0)
  );
  const topFiiInflow = sortedByFiiInflow[0] || null;
  const topFiiOutflow = sortedByFiiInflow[sortedByFiiInflow.length - 1] || null;

  const sortedByDiiInflow = [...reportSectors].sort(
    (a, b) => (b.diiNetInvestment ?? 0) - (a.diiNetInvestment ?? 0)
  );
  const topDiiInflow = sortedByDiiInflow[0] || null;
  const topDiiOutflow = sortedByDiiInflow[sortedByDiiInflow.length - 1] || null;

  if (!mounted) return null;



  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-white selection:bg-primary/20 selection:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/40 p-6 rounded-2xl border border-zinc-800/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-primary/10 text-primary uppercase border border-primary/20">
              Institutional Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">FII DII Sector Tracker</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track foreign and domestic institutional flow parameters and stock holdings across NSE sectors.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/60 px-4 py-2.5 rounded-xl border border-zinc-800">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-zinc-300">{user?.username || "Admin"}</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sector AUC */}
        <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-5 backdrop-blur-md">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Institutional AUC</div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-white tracking-tight flex justify-between">
              <span className="text-zinc-400 font-medium text-xs self-center">Total:</span>
              <span>{formatCrores(totalAuc)}</span>
            </div>
            <div className="text-xs text-zinc-400 flex justify-between border-t border-zinc-800/50 pt-1.5 mt-1.5">
              <span>FII (FPI) AUC:</span>
              <span className="font-bold text-zinc-300">{formatCrores(fiiTotalAuc)}</span>
            </div>
            <div className="text-xs text-zinc-400 flex justify-between">
              <span>DII AUC:</span>
              <span className="font-bold text-zinc-300">{formatCrores(diiTotalAuc)}</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 mt-2.5 flex items-center gap-1 border-t border-zinc-800/50 pt-2">
            <Calendar className="h-3 w-3" />
            As on {selectedFortnight || "latest report"}
          </div>
        </div>

        {/* Metric 2: FII Flow Leaderboard */}
        <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 flex justify-between">
              <span>FII Active Sectors</span>
              <span className="text-[9px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-normal uppercase">FII</span>
            </div>
            {topFiiInflow ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 truncate max-w-[120px]" title={topFiiInflow.sectorName}>
                    🔥 Inflow: {topFiiInflow.sectorName}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{formatCrores(topFiiInflow.fiiNetInvestment ?? topFiiInflow.netInvestment ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-800/50 pt-1.5">
                  <span className="text-xs text-zinc-400 truncate max-w-[120px]" title={topFiiOutflow?.sectorName || ""}>
                    ❄️ Outflow: {topFiiOutflow?.sectorName}
                  </span>
                  <span className="text-xs font-bold text-rose-400">
                    {formatCrores(topFiiOutflow?.fiiNetInvestment ?? topFiiOutflow?.netInvestment ?? 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">No report loaded</div>
            )}
          </div>
        </div>

        {/* Metric 3: DII Flow Leaderboard */}
        <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 flex justify-between">
              <span>DII Active Sectors</span>
              <span className="text-[9px] px-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-normal uppercase">DII</span>
            </div>
            {topDiiInflow ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 truncate max-w-[120px]" title={topDiiInflow.sectorName}>
                    🔥 Inflow: {topDiiInflow.sectorName}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{formatCrores(topDiiInflow.diiNetInvestment ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-800/50 pt-1.5">
                  <span className="text-xs text-zinc-400 truncate max-w-[120px]" title={topDiiOutflow?.sectorName || ""}>
                    ❄️ Outflow: {topDiiOutflow?.sectorName}
                  </span>
                  <span className="text-xs font-bold text-rose-400">
                    {formatCrores(topDiiOutflow?.diiNetInvestment ?? 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">No report loaded</div>
            )}
          </div>
        </div>

        {/* Metric 4: Scheduler Controller */}
        <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-5 backdrop-blur-md">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Scheduler Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">Live Background Active</span>
          </div>
          <button
            onClick={forceScrapeNow}
            disabled={triggerLoading}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {triggerLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Force Run Scraper
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("report")}
          className={`px-5 py-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition-all ${
            activeTab === "report"
              ? "border-primary text-white bg-primary/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Sector Reports & Shares
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`px-5 py-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition-all ${
            activeTab === "trends"
              ? "border-primary text-white bg-primary/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Historical Trends
        </button>
        <button
          onClick={() => setActiveTab("scheduler")}
          className={`px-5 py-3 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition-all ${
            activeTab === "scheduler"
              ? "border-primary text-white bg-primary/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Scheduler Console
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "report" && (
        <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-2xl p-6 backdrop-blur-md space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fortnight Ending:</label>
              <select
                value={selectedFortnight}
                onChange={e => {
                  setSelectedFortnight(e.target.value);
                  setExpandedSectors([]);
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:border-primary outline-none cursor-pointer"
              >
                {fortnights.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* FII / DII View Selector */}
              <div className="flex bg-zinc-900/60 rounded-lg p-1 border border-zinc-800">
                <button
                  onClick={() => setViewMode("combined")}
                  className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    viewMode === "combined"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Combined
                </button>
                <button
                  onClick={() => setViewMode("fii")}
                  className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    viewMode === "fii"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  FII View
                </button>
                <button
                  onClick={() => setViewMode("dii")}
                  className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    viewMode === "dii"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  DII View
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search sector..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-lg h-9 pl-9 pr-4 text-xs text-white focus:border-primary outline-none w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none bg-zinc-900/40 border border-zinc-800/60 px-3 py-2 rounded-lg hover:bg-zinc-900/80">
                <input
                  type="checkbox"
                  checked={filterWatchlist}
                  onChange={e => setFilterWatchlist(e.target.checked)}
                  className="rounded border-zinc-700 text-primary focus:ring-primary/20 accent-primary"
                />
                <Filter className="h-3 w-3 text-zinc-400" />
                Watchlist Only
              </label>
            </div>
          </div>

          {/* Report Table */}
          {reportLoading ? (
            <div className="flex py-20 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSectors.length > 0 ? (
            <div className="overflow-x-auto border border-zinc-800/60 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-semibold text-xs tracking-wider uppercase">
                    <th className="py-3 px-3 w-10 text-center">Watch</th>
                    <th className="py-3 px-3 w-10 text-center">Info</th>
                    <th className="py-3 px-4">Sector Name</th>
                    
                    {/* Dynamic Headers based on ViewMode */}
                    {viewMode === "fii" && (
                      <>
                        <th className="py-3 px-4 text-right">FII AUC (Cr)</th>
                        <th className="py-3 px-4 text-right">FII Net Inv (Cr)</th>
                        <th className="py-3 px-4 text-right">FII % Change</th>
                      </>
                    )}

                    {viewMode === "dii" && (
                      <>
                        <th className="py-3 px-4 text-right">DII AUC (Cr)</th>
                        <th className="py-3 px-4 text-right">DII Net Inv (Cr)</th>
                        <th className="py-3 px-4 text-right">DII % Change</th>
                      </>
                    )}

                    {viewMode === "combined" && (
                      <>
                        <th className="py-3 px-4 text-right">FII AUC (Cr)</th>
                        <th className="py-3 px-4 text-right">FII Net Inv (Cr)</th>
                        <th className="py-3 px-4 text-right">DII AUC (Cr)</th>
                        <th className="py-3 px-4 text-right">DII Net Inv (Cr)</th>
                        <th className="py-3 px-4 text-right">Total Net Inv (Cr)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredSectors.map(s => {
                    const isInWatchlist = watchlist.includes(s.sectorName);
                    const isExpanded = expandedSectors.includes(s.sectorName);
                    
                    // FII parameters
                    const fiiAuc = s.fiiAuc ?? s.auc ?? 0;
                    const fiiNet = s.fiiNetInvestment ?? s.netInvestment ?? 0;
                    const fiiPct = s.fiiPercentageChange ?? s.percentageChange ?? 0;
                    const isFiiPositive = fiiNet >= 0;

                    // DII parameters
                    const diiAuc = s.diiAuc ?? 0;
                    const diiNet = s.diiNetInvestment ?? 0;
                    const diiPct = s.diiPercentageChange ?? 0;
                    const isDiiPositive = diiNet >= 0;

                    // Total parameter
                    const totalNet = fiiNet + diiNet;
                    const isTotalPositive = totalNet >= 0;

                    return (
                      <Fragment key={s.sectorName}>
                        <tr className="hover:bg-zinc-900/10 transition-all font-medium text-zinc-300">
                          {/* Watchlist toggle */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => toggleWatchlistSector(s.sectorName)}
                              className="text-zinc-500 hover:text-yellow-400 cursor-pointer transition-all"
                            >
                              <Star
                                className={`h-4.5 w-4.5 ${
                                  isInWatchlist ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"
                                }`}
                              />
                            </button>
                          </td>

                          {/* Expansion toggle */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => toggleSectorExpand(s.sectorName)}
                              className="text-zinc-400 hover:text-primary transition-all cursor-pointer"
                              title="Click to view shares holdings"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4.5 w-4.5 text-primary" />
                              ) : (
                                <ChevronRight className="h-4.5 w-4.5" />
                              )}
                            </button>
                          </td>

                          {/* Sector Name */}
                          <td
                            className="py-3.5 px-4 text-white font-semibold cursor-pointer hover:text-primary transition-colors"
                            onClick={() => toggleSectorExpand(s.sectorName)}
                          >
                            {s.sectorName}
                          </td>

                          {/* FII Columns */}
                          {viewMode === "fii" && (
                            <>
                              <td className="py-3.5 px-4 text-right tabular-nums">{formatCrores(fiiAuc)}</td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums flex items-center justify-end gap-1.5 font-bold ${
                                  isFiiPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isFiiPositive ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {isFiiPositive ? "+" : ""}
                                {formatCrores(fiiNet)}
                              </td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums font-bold ${
                                  isFiiPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isFiiPositive ? "+" : ""}
                                {fiiPct.toFixed(2)}%
                              </td>
                            </>
                          )}

                          {/* DII Columns */}
                          {viewMode === "dii" && (
                            <>
                              <td className="py-3.5 px-4 text-right tabular-nums">{formatCrores(diiAuc)}</td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums flex items-center justify-end gap-1.5 font-bold ${
                                  isDiiPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isDiiPositive ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {isDiiPositive ? "+" : ""}
                                {formatCrores(diiNet)}
                              </td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums font-bold ${
                                  isDiiPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isDiiPositive ? "+" : ""}
                                {diiPct.toFixed(2)}%
                              </td>
                            </>
                          )}

                          {/* Combined Columns */}
                          {viewMode === "combined" && (
                            <>
                              <td className="py-3.5 px-4 text-right tabular-nums text-zinc-400">{formatCrores(fiiAuc)}</td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums font-semibold ${
                                  isFiiPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isFiiPositive ? "+" : ""}
                                {formatCrores(fiiNet)}
                              </td>
                              <td className="py-3.5 px-4 text-right tabular-nums text-zinc-400">{formatCrores(diiAuc)}</td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums font-semibold ${
                                  isDiiPositive ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isDiiPositive ? "+" : ""}
                                {formatCrores(diiNet)}
                              </td>
                              <td
                                className={`py-3.5 px-4 text-right tabular-nums font-bold border-l border-zinc-800/80 pl-4 ${
                                  isTotalPositive ? "text-emerald-400 bg-emerald-500/5" : "text-rose-400 bg-rose-500/5"
                                }`}
                              >
                                {isTotalPositive ? "+" : ""}
                                {formatCrores(totalNet)}
                              </td>
                            </>
                          )}
                        </tr>

                        {/* Expanded stock breakdown row */}
                        {isExpanded && (
                          <tr className="bg-zinc-950/20 border-b border-zinc-800/50">
                            <td colSpan={viewMode === "combined" ? 8 : 6} className="p-4 bg-zinc-900/10">
                              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
                                <div className="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                                      {s.sectorName} - Shares Portfolio Holdings
                                    </span>
                                    <span className="text-[10px] text-zinc-500">
                                      Allocated holdings quantity and investment value for FII & DII
                                    </span>
                                  </div>
                                  <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-semibold uppercase tracking-wider">
                                    Shares Breakdown
                                  </span>
                                </div>
                                {s.stocks && s.stocks.length > 0 ? (
                                  <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                      <tr className="bg-zinc-900/20 border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                                        <th className="py-2.5 px-4">Share / Company Name</th>
                                        <th className="py-2.5 px-4 text-right">Market Price</th>
                                        <th className="py-2.5 px-4 text-right">FII Investment</th>
                                        <th className="py-2.5 px-4 text-right">FII Shares Qty</th>
                                        <th className="py-2.5 px-4 text-right">DII Investment</th>
                                        <th className="py-2.5 px-4 text-right">DII Shares Qty</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/20 text-zinc-300 font-medium">
                                      {s.stocks.map(stk => (
                                        <tr key={stk.ticker} className="hover:bg-zinc-900/30">
                                          <td 
                                            className="py-2.5 px-4 font-bold text-white cursor-pointer hover:text-primary transition-colors"
                                            title="Click to view Screener analysis and charts"
                                            onClick={() => handleOpenScreener(stk.ticker, stk.stockName)}
                                          >
                                            {stk.stockName}{" "}
                                            <span className="text-zinc-500 font-semibold font-mono">({stk.ticker})</span>
                                          </td>
                                          <td className="py-2.5 px-4 text-right tabular-nums text-zinc-400">
                                            ₹{stk.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold tabular-nums">
                                            {formatCrores(stk.fiiValue)}
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-zinc-400 tabular-nums">
                                            {stk.fiiShares.toFixed(3)} Cr
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-sky-400 font-semibold tabular-nums">
                                            {formatCrores(stk.diiValue)}
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-zinc-400 tabular-nums">
                                            {stk.diiShares.toFixed(3)} Cr
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="py-4 text-center text-zinc-500 text-xs">
                                    No stock holdings data generated for this sector row. Force run the scraper to populate.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col py-16 items-center justify-center text-zinc-500">
              <AlertCircle className="h-10 w-10 text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-400">No sectors found</p>
              <p className="text-xs text-zinc-600 mt-1">Try refining search parameters or checking filters.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "trends" && (
        <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Institutional Trend Analysis</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Visualize FPI/DII sector investment parameters over time.</p>
            </div>

            {/* Premium Dual Chart Controls */}
            <div className="flex flex-wrap gap-2.5">
              {/* Entity Toggle */}
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                <button
                  onClick={() => setChartEntity("total")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    chartEntity === "total"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Total (FII + DII)
                </button>
                <button
                  onClick={() => setChartEntity("fii")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    chartEntity === "fii"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  FII Flow
                </button>
                <button
                  onClick={() => setChartEntity("dii")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    chartEntity === "dii"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  DII Flow
                </button>
              </div>

              {/* Metric Type Toggle */}
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                <button
                  onClick={() => setChartType("netInvestment")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    chartType === "netInvestment"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Net Investment
                </button>
                <button
                  onClick={() => setChartType("auc")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    chartType === "auc"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  AUC
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sector checklist */}
            <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl space-y-3 max-h-[400px] overflow-y-auto">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-zinc-500 text-zinc-500" />
                Select Sectors ({selectedChartSectors.length})
              </div>
              <div className="space-y-1.5">
                {allSectorsList.map(secName => {
                  const isChecked = selectedChartSectors.includes(secName);
                  const isStarred = watchlist.includes(secName);
                  
                  return (
                    <label
                      key={secName}
                      className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-primary/10 border-primary/40 text-primary font-bold"
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChartSectorSelection(secName)}
                          className="rounded text-primary focus:ring-primary/20 accent-primary"
                        />
                        <span className="truncate max-w-[140px]">{secName}</span>
                      </span>
                      {isStarred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Recharts chart */}
            <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-800/40 p-4 rounded-xl flex items-center justify-center min-h-[350px]">
              {trendsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : chartData.length > 0 ? (
                <div className="w-full h-[360px] text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        tickFormatter={val => {
                          const dateObj = new Date(val);
                          return isNaN(dateObj.getTime())
                            ? val
                            : dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                        }}
                      />
                      <YAxis
                        stroke="#71717a"
                        tickFormatter={val => {
                          if (Math.abs(val) >= 1000) {
                            return `${(val / 1000).toFixed(0)}k Cr`;
                          }
                          return `${val} Cr`;
                        }}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          borderColor: "#27272a",
                          color: "#fff",
                          borderRadius: "8px"
                        }}
                        formatter={(value: any, name: any) => [formatCrores(Number(value)), name]}
                      />
                      <Legend />
                      {selectedChartSectors.map((secName, idx) => {
                        const colors = [
                          "#3b82f6", // blue
                          "#10b981", // emerald
                          "#f59e0b", // amber
                          "#ec4899", // pink
                          "#8b5cf6", // violet
                          "#ef4444", // red
                          "#06b6d4"  // cyan
                        ];
                        const strokeColor = colors[idx % colors.length];
                        
                        return (
                          <Line
                            key={secName}
                            type="monotone"
                            dataKey={secName}
                            name={secName}
                            stroke={strokeColor}
                            strokeWidth={2.5}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-zinc-500 text-sm">No historical data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "scheduler" && (
        <div className="bg-zinc-950/30 border border-zinc-800/40 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configure panel */}
            <div className="bg-zinc-900/20 border border-zinc-800/40 p-5 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-primary" />
                Configure Scheduler Settings
              </h3>
              
              {schedulerLoading ? (
                <div className="flex py-10 justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : schedulerInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                    <div>
                      <div className="text-zinc-400 text-xs font-semibold mb-0.5">Active Frequency</div>
                      <div className="font-bold text-white capitalize">{schedulerInfo.frequency}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-xs font-semibold mb-0.5">Cron Expression</div>
                      <code className="text-xs bg-zinc-950 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-950/40">
                        {schedulerInfo.cronExpression}
                      </code>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-xs font-semibold mb-0.5">Last Run Time</div>
                      <div className="font-semibold text-zinc-300 text-xs">
                        {schedulerInfo.lastRun
                          ? new Date(schedulerInfo.lastRun).toLocaleString("en-IN")
                          : "Never"}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-xs font-semibold mb-0.5">Next Planned Run</div>
                      <div className="font-semibold text-zinc-300 text-xs">
                        {schedulerInfo.nextRun
                          ? new Date(schedulerInfo.nextRun).toLocaleString("en-IN")
                          : "Pending"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Switch Interval Frequency:
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => configureScheduler("daily")}
                        className={`flex-1 font-bold text-sm py-2 px-4 rounded-lg cursor-pointer transition-all border ${
                          schedulerInfo.frequency === "daily"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        Daily Interval
                      </button>
                      <button
                        onClick={() => configureScheduler("fortnightly")}
                        className={`flex-1 font-bold text-sm py-2 px-4 rounded-lg cursor-pointer transition-all border ${
                          schedulerInfo.frequency === "fortnightly"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        Fortnightly Interval
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500 text-sm">Failed to retrieve scheduler data.</div>
              )}
            </div>

            {/* Run Task console */}
            <div className="bg-zinc-900/20 border border-zinc-800/40 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <Activity className="h-4.5 w-4.5 text-primary" />
                  Manual Scraping Operator
                </h3>
                <p className="text-zinc-400 text-xs">
                  Forcing execution immediately overrides the cron timer. It will pull the live table from NSDL.
                  If the page is blocked by NSDL security guards or connection timeouts, it will fallback automatically to generate the next chronological simulated report fortnight (random walk).
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <button
                  onClick={forceScrapeNow}
                  disabled={triggerLoading}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-11 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {triggerLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Pulling Live Sector Data...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Force Trigger Task Execution Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Background execution log (Last 15)</h3>
            {schedulerInfo?.logs && schedulerInfo.logs.length > 0 ? (
              <div className="overflow-x-auto border border-zinc-800/60 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                      <th className="py-2.5 px-4 w-48">Timestamp</th>
                      <th className="py-2.5 px-4 w-40">Event Type</th>
                      <th className="py-2.5 px-4">Message / Error Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30 text-zinc-400">
                    {schedulerInfo.logs.map((log: any, idx: number) => {
                      const isErr = log.event === "error";
                      const dateFormatted = new Date(log.timestamp).toLocaleString("en-IN");
                      
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/10">
                          <td className="py-2 px-4 font-mono text-[11px] text-zinc-500">{dateFormatted}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                isErr
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {log.event}
                            </span>
                          </td>
                          <td className={`py-2 px-4 ${isErr ? "text-red-300 font-semibold" : "text-zinc-300"}`}>
                            {log.message || log.error || "No details provided"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-xl py-10 text-center text-zinc-500 text-xs">
                No scheduler logs captured yet. Trigger a manual run to see updates.
              </div>
            )}
          </div>
        </div>
      )}

      {screenerSymbol && (
        <StockScreenerDialog
          symbol={screenerSymbol}
          name={screenerName}
          open={isScreenerOpen}
          onOpenChange={setIsScreenerOpen}
        />
      )}
    </div>
  );
}
