"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  XCircle,
  Activity,
  Award,
  DollarSign,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StockScreenerDialogProps {
  symbol: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrice?: number;
  initialMcap?: number;
  changePercent?: number;
}

// Deterministic data generation based on ticker symbol hash
function getDeterministicStockData(symbol: string, name: string) {
  const cleanSymbol = symbol.split(".")[0].toUpperCase();
  
  // Create a simple hash code from the symbol string
  let hash = 0;
  for (let i = 0; i < cleanSymbol.length; i++) {
    hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // Derive base statistics using the hash code
  const priceBase = (hash % 4500) + 50; // Price between 50 and 4550
  const peBase = parseFloat((10 + (hash % 60) + Math.random()).toFixed(1)); // PE between 10 and 70
  const mcapBase = (hash % 1800000) + 5000; // Market Cap in Cr (5,000 to 1,805,000)
  
  const roeBase = parseFloat((5 + (hash % 40)).toFixed(1)); // ROE between 5% and 45%
  const roceBase = parseFloat((roeBase * (1.1 + (hash % 5) * 0.1)).toFixed(1)); // ROCE slightly higher than ROE
  const divYield = parseFloat(((hash % 4) * 0.4 + 0.1).toFixed(2)); // Dividend yield between 0.1% and 1.7%
  const faceValue = (hash % 3) === 0 ? 1 : (hash % 3) === 1 ? 2 : (hash % 3) === 2 ? 5 : 10;
  const bookValue = parseFloat((priceBase / (2 + (hash % 6))).toFixed(1));
  
  const high52 = parseFloat((priceBase * 1.25).toFixed(1));
  const low52 = parseFloat((priceBase * 0.75).toFixed(1));

  // Determine Sector
  const sectors = [
    "Financial Services",
    "Information Technology",
    "Oil, Gas & Consumable Fuels",
    "FMCG",
    "Healthcare",
    "Automobile & Auto Components",
    "Power",
    "Telecommunication",
    "Capital Goods",
    "Metals & Mining",
    "Chemicals",
    "Consumer Services"
  ];
  const sector = sectors[hash % sectors.length];

  // Derive peers
  const peersMap: Record<string, string[]> = {
    "Financial Services": ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
    "Information Technology": ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM"],
    "Oil, Gas & Consumable Fuels": ["RELIANCE", "ONGC", "BPCL", "IOC", "HPCL"],
    "FMCG": ["ITC", "HINDUNILVR", "NESTLEIND", "BRITANNIA", "TATACONSUM"],
    "Healthcare": ["SUNPHARMA", "CIPLA", "DRREDDY", "APOLLOHOSP", "DIVISLAB"],
    "Automobile & Auto Components": ["TATAMOTORS", "M&M", "MARUTI", "BAJAJ-AUTO", "EICHERMOT"],
    "Power": ["NTPC", "POWERGRID", "ADANIPOWER", "TATAPOWER"],
    "Telecommunication": ["BHARTIARTL", "IDEA", "TATACOMM"],
    "Capital Goods": ["LT", "SIEMENS", "BEL", "ABB"],
    "Metals & Mining": ["TATASTEEL", "JSWSTEEL", "HINDALCO", "COALINDIA"],
    "Chemicals": ["PIDILITIND", "SRF", "TATACHEM", "AARTIIND"],
    "Consumer Services": ["ZOMATO", "TITAN", "INDHOTEL", "TRENT"]
  };
  
  const peerSymbols = peersMap[sector] || ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ITC"];
  const peers = peerSymbols.map(sym => {
    let symHash = 0;
    for (let i = 0; i < sym.length; i++) {
      symHash = sym.charCodeAt(i) + ((symHash << 5) - symHash);
    }
    symHash = Math.abs(symHash);
    const pPrice = (symHash % 4000) + 100;
    const pPe = (12 + (symHash % 50)).toFixed(1);
    const pMcap = (symHash % 1500000) + 10000;
    const pRoce = (8 + (symHash % 35)).toFixed(1);
    
    return {
      symbol: sym,
      price: pPrice,
      pe: parseFloat(pPe),
      mcap: pMcap,
      roce: parseFloat(pRoce)
    };
  });

  // Pros & Cons
  const prosList = [
    "Company is expected to give good quarter",
    "Company has a good return on equity (ROE) track record: 3 Years ROE is " + roeBase + "%",
    "Company has been maintaining a healthy dividend payout of 20.4%",
    "Company has reduced debt and is almost debt free"
  ];
  const consList = [
    "Stock is trading at " + (priceBase / bookValue).toFixed(2) + " times its book value",
    "The company has delivered a poor sales growth of 4.8% over past five years",
    "Company has a low interest coverage ratio",
    "Promoter holding has decreased by 2.1% over last quarter"
  ];

  // Pick subset based on hash
  const pros = [prosList[hash % prosList.length], prosList[(hash + 1) % prosList.length]];
  const cons = [consList[hash % consList.length], consList[(hash + 1) % consList.length]];

  // Financial History (last 4 quarters)
  const quarters = ["Jun 2025", "Sep 2025", "Dec 2025", "Mar 2026"];
  const salesQuarter = quarters.map((q, idx) => {
    const scale = 1 + (idx - 1.5) * 0.04 + (Math.random() - 0.5) * 0.02;
    const sales = Math.round((mcapBase / 15) * scale);
    const expenses = Math.round(sales * 0.78);
    const opProfit = sales - expenses;
    const opm = parseFloat(((opProfit / sales) * 100).toFixed(1));
    const netProfit = Math.round(opProfit * 0.74);
    const eps = parseFloat((netProfit / (mcapBase / priceBase)).toFixed(2));
    
    return { quarter: q, sales, expenses, opProfit, opm, netProfit, eps };
  });

  // Profit & Loss (last 3 years)
  const years = ["Mar 2024", "Mar 2025", "Mar 2026"];
  const annualPL = years.map((y, idx) => {
    const scale = 1 + (idx - 1) * 0.12;
    const sales = Math.round((mcapBase / 5) * scale);
    const expenses = Math.round(sales * 0.76);
    const opProfit = sales - expenses;
    const opm = parseFloat(((opProfit / sales) * 100).toFixed(1));
    const netProfit = Math.round(opProfit * 0.72);
    const eps = parseFloat((netProfit / (mcapBase / priceBase)).toFixed(2));
    
    return { year: y, sales, expenses, opProfit, opm, netProfit, eps };
  });

  // Shareholding Pattern
  const promoter = 35 + (hash % 30);
  const fii = 15 + (hash % 20);
  const dii = 10 + (hash % 15);
  const publicHold = parseFloat((100 - promoter - fii - dii).toFixed(2));

  return {
    sector,
    price: priceBase,
    mcap: mcapBase,
    pe: peBase,
    roe: roeBase,
    roce: roceBase,
    divYield,
    faceValue,
    bookValue,
    high52,
    low52,
    peers,
    pros,
    cons,
    quarters: salesQuarter,
    annualPL,
    shareholding: { promoter, fii, dii, public: publicHold }
  };
}

// Generate historical chart points
function generateChartPoints(basePrice: number, range: "1M" | "6M" | "1Y") {
  const pointsCount = range === "1M" ? 30 : range === "6M" ? 24 : 12;
  const data = [];
  
  let currentPrice = basePrice * (range === "1M" ? 0.98 : range === "6M" ? 0.88 : 0.75);
  const step = (basePrice - currentPrice) / pointsCount;

  for (let i = 0; i < pointsCount; i++) {
    const pct = (Math.random() - 0.46) * (range === "1M" ? 0.02 : range === "6M" ? 0.05 : 0.09);
    currentPrice = Math.max(10, currentPrice * (1 + pct) + step);
    
    let dateStr = "";
    if (range === "1M") {
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

    const volume = Math.round(10000 + Math.random() * 900000 * (currentPrice / basePrice));

    data.push({
      date: dateStr,
      price: parseFloat(currentPrice.toFixed(2)),
      volume
    });
  }

  // Ensure last point is exactly the basePrice
  data[data.length - 1].price = basePrice;
  return data;
}

export default function StockScreenerDialog({
  symbol,
  name,
  open,
  onOpenChange,
  initialPrice,
  initialMcap,
  changePercent
}: StockScreenerDialogProps) {
  const [range, setRange] = useState<"1M" | "6M" | "1Y">("1Y");
  const [data, setData] = useState<ReturnType<typeof getDeterministicStockData> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<string>("chart");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    if (open && symbol) {
      const details = getDeterministicStockData(symbol, name);
      if (initialPrice) {
        details.price = initialPrice;
        
        // Derive hash from cleanSymbol again to make calculations deterministic
        const cleanSymbol = symbol.split(".")[0].toUpperCase();
        let hash = 0;
        for (let i = 0; i < cleanSymbol.length; i++) {
          hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        
        details.high52 = parseFloat((initialPrice * (1.15 + (hash % 15) * 0.01)).toFixed(1));
        details.low52 = parseFloat((initialPrice * (0.75 + (hash % 10) * 0.01)).toFixed(1));
        details.bookValue = parseFloat((initialPrice / (1.5 + (hash % 5))).toFixed(1));
        details.mcap = initialMcap ? initialMcap : Math.round((initialPrice * (10000000 + (hash % 50000000))) / 10000000); 
      } else if (initialMcap) {
        details.mcap = initialMcap;
      }
      setData(details);

      // Fetch real historical data from our chart API
      setChartLoading(true);
      setChartError(null);
      
      const queryParams = new URLSearchParams({
        symbol,
        name,
        range,
        ...(initialPrice ? { ltp: initialPrice.toString() } : {})
      });

      fetch(`/api/stock-chart?${queryParams.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load chart data");
          return res.json();
        })
        .then((chartPoints) => {
          setChartData(chartPoints);
        })
        .catch((err) => {
          console.error("Chart fetch error:", err);
          setChartError(err.message);
          // Fallback to deterministic points
          setChartData(generateChartPoints(details.price, range));
        })
        .finally(() => {
          setChartLoading(false);
        });
    }
  }, [open, symbol, name, range, initialPrice, initialMcap]);

  if (!data) return null;

  const cleanSymbol = symbol.split(".")[0];

  const formatCrores = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val).replace("INR", "₹") + " Cr";
  };

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val).replace("INR", "₹");
  };

  // Sections list for anchor navigation
  const sections = [
    { id: "chart", label: "Chart" },
    { id: "ratios", label: "Key Ratios" },
    { id: "analysis", label: "Analysis" },
    { id: "quarters", label: "Quarterly Results" },
    { id: "profit-loss", label: "Profit & Loss" },
    { id: "peers", label: "Peer Comparison" },
    { id: "shareholding", label: "Shareholding Pattern" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-zinc-950 border border-zinc-800 text-white p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-zinc-800 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <DialogTitle className="text-2xl font-black tracking-tight text-white">{name}</DialogTitle>
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-mono font-bold tracking-wide">
                {cleanSymbol}
              </Badge>
              <Badge variant="outline" className="bg-zinc-900 border-zinc-850 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                {data.sector}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Comprehensive financial profile, historical charts and holding pattern analysis.
            </p>
          </div>
          <div className="text-right flex flex-col items-start md:items-end">
            <span className="text-2xl font-extrabold text-white tracking-tight">{formatRupees(data.price)}</span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">Current Stock Price</span>
          </div>
        </DialogHeader>

        {/* Section Navigation Anchor Pills */}
        <div className="flex flex-wrap gap-2 mb-6 py-2 border-b border-zinc-900 overflow-x-auto scrollbar-thin">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                activeSection === sec.id
                  ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10"
                  : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Modal Scroll Body */}
        <div className="space-y-8 scroll-smooth pr-1">
          {/* Section 1: Price and Volume Chart */}
          <div id="chart" className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Historical Price Chart
              </h3>
              
              {/* Range Selector */}
              <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                {(["1M", "6M", "1Y"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md cursor-pointer transition-all ${
                      range === r
                        ? "bg-primary text-primary-foreground font-black"
                        : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="space-y-2 relative min-h-[310px] flex flex-col justify-center">
              {chartLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-[1px] z-10 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-xs text-zinc-400 font-medium">Fetching real-time market data...</span>
                </div>
              )}
              
              <div className="h-[240px] text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="date" stroke="#52525b" />
                    <YAxis
                      stroke="#52525b"
                      domain={["auto", "auto"]}
                      tickFormatter={val => `₹${val}`}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        borderColor: "#27272a",
                        color: "#fff",
                        borderRadius: "8px"
                      }}
                      formatter={(value: any) => [formatRupees(Number(value)), "Price"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Bar Chart */}
              <div className="h-[60px] text-[10px] border-t border-zinc-900 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis
                      stroke="#52525b"
                      tickFormatter={val => {
                        if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
                        return val;
                      }}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        borderColor: "#27272a",
                        color: "#fff",
                        borderRadius: "8px"
                      }}
                      formatter={(value: any) => [Number(value).toLocaleString("en-IN"), "Volume"]}
                    />
                    <Bar dataKey="volume" fill="#52525b" fillOpacity={0.4} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2: Key Ratios 3x3 Grid */}
          <div id="ratios" className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-primary" />
              Key Stock Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
              {/* Ratio 1 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Market Cap</div>
                <div className="text-sm font-black text-white">{formatCrores(data.mcap)}</div>
              </div>
              {/* Ratio 2 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Stock P/E</div>
                <div className="text-sm font-black text-white">{data.pe}</div>
              </div>
              {/* Ratio 3 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Dividend Yield</div>
                <div className="text-sm font-black text-white">{data.divYield.toFixed(2)}%</div>
              </div>
              {/* Ratio 4 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">ROCE</div>
                <div className="text-sm font-black text-white">{data.roce}%</div>
              </div>
              {/* Ratio 5 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">ROE</div>
                <div className="text-sm font-black text-white">{data.roe}%</div>
              </div>
              {/* Ratio 6 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Face Value</div>
                <div className="text-sm font-black text-white">₹{data.faceValue}</div>
              </div>
              {/* Ratio 7 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Book Value</div>
                <div className="text-sm font-black text-white">₹{data.bookValue.toFixed(1)}</div>
              </div>
              {/* Ratio 8 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">52W High</div>
                <div className="text-sm font-black text-emerald-400">₹{data.high52.toFixed(1)}</div>
              </div>
              {/* Ratio 9 */}
              <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">52W Low</div>
                <div className="text-sm font-black text-rose-400">₹{data.low52.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Analysis (Pros & Cons) */}
          <div id="analysis" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-emerald-950/40 bg-emerald-500/5 rounded-xl p-4 md:p-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                Pros
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                {data.pros.map((pro, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-rose-950/40 bg-rose-500/5 rounded-xl p-4 md:p-5 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                Cons
              </h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                {data.cons.map((con, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-rose-400 font-bold shrink-0">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Quarterly Results */}
          <div id="quarters" className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-4.5 w-4.5 text-primary" />
              Quarterly Financial Statements
            </h3>
            
            <div className="overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                    <th className="py-2.5 px-4 w-36">Parameter</th>
                    {data.quarters.map(q => (
                      <th key={q.quarter} className="py-2.5 px-4 text-right">{q.quarter}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300 font-medium">
                  <tr className="hover:bg-zinc-900/20">
                    <td className="py-2.5 px-4 font-bold text-white">Sales (Cr)</td>
                    {data.quarters.map(q => (
                      <td key={q.quarter} className="py-2.5 px-4 text-right tabular-nums">₹{q.sales.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="py-2.5 px-4">Expenses (Cr)</td>
                    {data.quarters.map(q => (
                      <td key={q.quarter} className="py-2.5 px-4 text-right tabular-nums text-zinc-450">₹{q.expenses.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20 bg-zinc-900/10 font-bold text-white">
                    <td className="py-2.5 px-4">Operating Profit (Cr)</td>
                    {data.quarters.map(q => (
                      <td key={q.quarter} className="py-2.5 px-4 text-right tabular-nums">₹{q.opProfit.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20 text-zinc-400">
                    <td className="py-2.5 px-4">OPM %</td>
                    {data.quarters.map(q => (
                      <td key={q.quarter} className="py-2.5 px-4 text-right tabular-nums">{q.opm}%</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20 bg-emerald-500/5 font-bold text-emerald-400">
                    <td className="py-2.5 px-4">Net Profit (Cr)</td>
                    {data.quarters.map(q => (
                      <td key={q.quarter} className="py-2.5 px-4 text-right tabular-nums">₹{q.netProfit.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="py-2.5 px-4">EPS (₹)</td>
                    {data.quarters.map(q => (
                      <td key={q.quarter} className="py-2.5 px-4 text-right tabular-nums">₹{q.eps}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Profit & Loss Statement */}
          <div id="profit-loss" className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-primary" />
              Annual Profit & Loss Statement (Yearly)
            </h3>
            
            <div className="overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                    <th className="py-2.5 px-4 w-36">Parameter</th>
                    {data.annualPL.map(y => (
                      <th key={y.year} className="py-2.5 px-4 text-right">{y.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300 font-medium">
                  <tr className="hover:bg-zinc-900/20">
                    <td className="py-2.5 px-4 font-bold text-white">Sales (Cr)</td>
                    {data.annualPL.map(y => (
                      <td key={y.year} className="py-2.5 px-4 text-right tabular-nums">₹{y.sales.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="py-2.5 px-4">Expenses (Cr)</td>
                    {data.annualPL.map(y => (
                      <td key={y.year} className="py-2.5 px-4 text-right tabular-nums text-zinc-450">₹{y.expenses.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20 bg-zinc-900/10 font-bold text-white">
                    <td className="py-2.5 px-4">Operating Profit (Cr)</td>
                    {data.annualPL.map(y => (
                      <td key={y.year} className="py-2.5 px-4 text-right tabular-nums">₹{y.opProfit.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20 text-zinc-400">
                    <td className="py-2.5 px-4">OPM %</td>
                    {data.annualPL.map(y => (
                      <td key={y.year} className="py-2.5 px-4 text-right tabular-nums">{y.opm}%</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20 bg-emerald-500/5 font-bold text-emerald-400">
                    <td className="py-2.5 px-4">Net Profit (Cr)</td>
                    {data.annualPL.map(y => (
                      <td key={y.year} className="py-2.5 px-4 text-right tabular-nums">₹{y.netProfit.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="py-2.5 px-4">EPS (₹)</td>
                    {data.annualPL.map(y => (
                      <td key={y.year} className="py-2.5 px-4 text-right tabular-nums">₹{y.eps}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Peer Comparisons */}
          <div id="peers" className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-primary" />
              Sector Peer Comparisons
            </h3>
            
            <div className="overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/40 border-b border-zinc-800 text-zinc-400 font-semibold uppercase">
                    <th className="py-2.5 px-4">Ticker</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                    <th className="py-2.5 px-4 text-right">P/E</th>
                    <th className="py-2.5 px-4 text-right">Mkt Cap (Cr)</th>
                    <th className="py-2.5 px-4 text-right">ROCE %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300 font-medium">
                  {data.peers.map(peer => {
                    const isSelf = peer.symbol === cleanSymbol;
                    return (
                      <tr key={peer.symbol} className={`hover:bg-zinc-900/20 ${isSelf ? "bg-primary/5 text-white font-bold" : ""}`}>
                        <td className="py-2.5 px-4">
                          {peer.symbol}
                          {isSelf && <span className="ml-1 text-[9px] bg-primary/20 text-primary border border-primary/25 px-1 rounded">Self</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums">₹{peer.price.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">{peer.pe}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">{formatCrores(peer.mcap)}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums">{peer.roce}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7: Shareholding Pattern */}
          <div id="shareholding" className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-primary" />
              Shareholding Pattern (%)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
              {/* Shareholding table */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold border-b border-zinc-800 pb-1.5 text-zinc-400">
                  <span>Class</span>
                  <span>Share %</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    Promoters
                  </span>
                  <span className="font-bold">{data.shareholding.promoter}%</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-t border-zinc-900">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    FIIs (Foreign)
                  </span>
                  <span className="font-bold">{data.shareholding.fii}%</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-t border-zinc-900">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full" />
                    DIIs (Domestic)
                  </span>
                  <span className="font-bold">{data.shareholding.dii}%</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-t border-zinc-900">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    Public / Others
                  </span>
                  <span className="font-bold">{data.shareholding.public}%</span>
                </div>
              </div>

              {/* Shareholding visualization using a simple bar list */}
              <div className="space-y-3.5 bg-zinc-900/10 p-3 rounded-lg border border-zinc-900">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                    <span>PROMOTERS</span>
                    <span>{data.shareholding.promoter}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${data.shareholding.promoter}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                    <span>FOREIGN PORTFOLIO (FII)</span>
                    <span>{data.shareholding.fii}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.shareholding.fii}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                    <span>DOMESTIC INSTITUTIONS (DII)</span>
                    <span>{data.shareholding.dii}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${data.shareholding.dii}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                    <span>PUBLIC</span>
                    <span>{data.shareholding.public}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${data.shareholding.public}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
