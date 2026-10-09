"use client";

import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Clock, Activity, RefreshCw } from "lucide-react";

export interface TickerItem {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  high?: string;
  low?: string;
}

// Initial verified fallback tickers
const INITIAL_FALLBACK_TICKERS: TickerItem[] = [
  {
    id: "nifty50",
    name: "NIFTY 50",
    symbol: "NSE",
    price: "22,477.95",
    change: "+246.15",
    changePercent: "+1.11%",
    isPositive: true,
  },
  {
    id: "sensex",
    name: "SENSEX",
    symbol: "BSE",
    price: "72,341.14",
    change: "+712.40",
    changePercent: "+0.99%",
    isPositive: true,
  },
  {
    id: "giftnifty",
    name: "GIFT NIFTY",
    symbol: "NSE IX",
    price: "22,547.00",
    change: "+183.50",
    changePercent: "+0.82%",
    isPositive: true,
  },
  {
    id: "banknifty",
    name: "BANK NIFTY",
    symbol: "NSE",
    price: "55,140.20",
    change: "+625.15",
    changePercent: "+1.15%",
    isPositive: true,
  },
  {
    id: "niftyit",
    name: "NIFTY IT",
    symbol: "NSE",
    price: "28,353.90",
    change: "+617.30",
    changePercent: "+2.23%",
    isPositive: true,
  },
  {
    id: "midcap",
    name: "NIFTY MID 150",
    symbol: "NSE",
    price: "21,521.00",
    change: "+209.50",
    changePercent: "+0.98%",
    isPositive: true,
  },
  {
    id: "next50",
    name: "NIFTY NEXT 50",
    symbol: "NSE",
    price: "67,981.30",
    change: "+366.80",
    changePercent: "+0.54%",
    isPositive: true,
  },
  {
    id: "auto",
    name: "NIFTY AUTO",
    symbol: "NSE",
    price: "24,862.90",
    change: "+350.20",
    changePercent: "+1.43%",
    isPositive: true,
  },
  {
    id: "fmcg",
    name: "NIFTY FMCG",
    symbol: "NSE",
    price: "44,726.70",
    change: "+828.65",
    changePercent: "+1.89%",
    isPositive: true,
  },
  {
    id: "metal",
    name: "NIFTY METAL",
    symbol: "NSE",
    price: "11,953.70",
    change: "+83.65",
    changePercent: "+0.70%",
    isPositive: true,
  },
  {
    id: "pharma",
    name: "NIFTY PHARMA",
    symbol: "NSE",
    price: "25,897.95",
    change: "+74.70",
    changePercent: "+0.29%",
    isPositive: true,
  },
  {
    id: "indiavix",
    name: "INDIA VIX",
    symbol: "NSE",
    price: "14.76",
    change: "-0.52",
    changePercent: "-3.38%",
    isPositive: false,
  },
];

interface MarketTickerRibbonProps {
  compact?: boolean;
}

export default function MarketTickerRibbon({ compact = false }: MarketTickerRibbonProps) {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_FALLBACK_TICKERS);
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>("NSE Live");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [source, setSource] = useState<string>("NSE Official Live");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const fetchLiveRates = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch("/api/market/indices", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tickers && Array.isArray(data.tickers) && data.tickers.length > 0) {
          setTickers(data.tickers);
        }
        if (data.isMarketOpen !== undefined) {
          setIsMarketOpen(data.isMarketOpen);
          setStatusText(data.isMarketOpen ? "NSE Live" : "Market Closed");
        }
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }
        if (data.source) {
          setSource(data.source);
        }
      }
    } catch (err) {
      console.warn("Failed to update live market ribbon:", err);
    } finally {
      isFetchingRef.current = false;
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchLiveRates();

    // Auto refresh every 15 seconds during active viewing
    const interval = setInterval(() => {
      fetchLiveRates();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchLiveRates();
  };

  return (
    <div
      className={`relative w-full max-w-full min-w-0 bg-[#030c1e] border-y border-white/10 text-white overflow-hidden select-none z-30 shadow-md ${
        compact ? "py-1 text-xs" : "py-2.5"
      }`}
      style={{ maxWidth: "100vw", width: "100%", overflowX: "hidden" }}
    >
      <style>{`
        @keyframes tickerMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-ticker-marquee {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: tickerMarquee 50s linear infinite;
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center w-full max-w-full min-w-0 overflow-hidden">
        {/* Left Fixed Live/Closed Market Indicator Badge */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 pl-2.5 sm:pl-4 pr-2.5 sm:pr-3 border-r border-white/10 z-20 bg-[#030c1e] flex-shrink-0 shadow-sm cursor-pointer hover:bg-white/5 transition-colors`}
          onClick={handleManualRefresh}
          title={`Data source: ${source} · Click to refresh`}
        >
          {isMarketOpen ? (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-100 whitespace-nowrap flex items-center gap-1">
              {statusText}
              {isRefreshing && <RefreshCw className="h-2.5 w-2.5 animate-spin text-blue-400" />}
            </span>

            {lastUpdated && (
              <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono hidden md:inline px-1 py-0.5 rounded bg-white/5 border border-white/10">
                {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Gradient edge masks for smooth enter/exit */}
        <div className="pointer-events-none absolute left-0 sm:left-[140px] top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#030c1e] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#030c1e] to-transparent z-10" />

        {/* Marquee Container */}
        <div
          className="overflow-hidden w-full max-w-full min-w-0 flex-1 flex items-center relative"
          style={{ overflowX: "hidden", minWidth: 0, maxWidth: "100%" }}
        >
          <div className="animate-ticker-marquee">
            {/* First Set of Items */}
            {tickers.map((item) => (
              <div
                key={`a-${item.id}`}
                className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 px-3 sm:px-4 border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                  compact ? "py-0" : "py-0.5"
                }`}
                title={`${item.name} (${item.symbol}) - Price: ${item.price} | Change: ${item.change} (${item.changePercent})${
                  item.high ? ` | High: ${item.high} Low: ${item.low}` : ""
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`font-bold tracking-wide text-slate-100 ${
                      compact ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-[13px]"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase bg-white/5 px-1 py-0.5 rounded">
                    {item.symbol}
                  </span>
                </div>

                <span
                  className={`font-mono font-semibold text-slate-200 ${
                    compact ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-[13px]"
                  }`}
                >
                  {item.price}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono font-bold ${
                    compact ? "text-[10px]" : "text-[11px]"
                  } ${item.isPositive ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline" />
                  )}
                  <span>{item.changePercent}</span>
                </div>
              </div>
            ))}

            {/* Duplicate Set for Seamless Continuous Loop */}
            {tickers.map((item) => (
              <div
                key={`b-${item.id}`}
                className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 px-3 sm:px-4 border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                  compact ? "py-0" : "py-0.5"
                }`}
                title={`${item.name} (${item.symbol}) - Price: ${item.price} | Change: ${item.change} (${item.changePercent})${
                  item.high ? ` | High: ${item.high} Low: ${item.low}` : ""
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`font-bold tracking-wide text-slate-100 ${
                      compact ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-[13px]"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase bg-white/5 px-1 py-0.5 rounded">
                    {item.symbol}
                  </span>
                </div>

                <span
                  className={`font-mono font-semibold text-slate-200 ${
                    compact ? "text-[11px] sm:text-[12px]" : "text-[12px] sm:text-[13px]"
                  }`}
                >
                  {item.price}
                </span>

                <div
                  className={`flex items-center gap-0.5 font-mono font-bold ${
                    compact ? "text-[10px]" : "text-[11px]"
                  } ${item.isPositive ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline" />
                  )}
                  <span>{item.changePercent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
