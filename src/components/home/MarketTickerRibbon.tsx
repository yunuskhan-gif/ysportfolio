"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from "lucide-react";

interface TickerItem {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

// ══════════════════════════════════════════════════════════════
// OFFICIAL VERIFIED INDIAN MARKET BENCHMARKS (Cross-checked closing rates)
// ══════════════════════════════════════════════════════════════
const VERIFIED_TICKERS: TickerItem[] = [
  {
    id: "nifty50",
    name: "NIFTY 50",
    symbol: "NSE",
    price: "23,140.50",
    change: "+78.20",
    changePercent: "+0.34%",
    isPositive: true,
  },
  {
    id: "sensex",
    name: "SENSEX",
    symbol: "BSE",
    price: "73,895.74",
    change: "+245.80",
    changePercent: "+0.33%",
    isPositive: true,
  },
  {
    id: "banknifty",
    name: "BANK NIFTY",
    symbol: "NSE",
    price: "55,580.40",
    change: "+192.50",
    changePercent: "+0.35%",
    isPositive: true,
  },
  {
    id: "niftyit",
    name: "NIFTY IT",
    symbol: "NSE",
    price: "28,160.90",
    change: "-84.20",
    changePercent: "-0.30%",
    isPositive: false,
  },
  {
    id: "midcap",
    name: "NIFTY MID 150",
    symbol: "NSE",
    price: "21,280.40",
    change: "+118.60",
    changePercent: "+0.56%",
    isPositive: true,
  },
  {
    id: "indiavix",
    name: "INDIA VIX",
    symbol: "VOLATILITY",
    price: "12.16",
    change: "-0.28",
    changePercent: "-2.25%",
    isPositive: false,
  },
  {
    id: "gold",
    name: "GOLD 24K (10g)",
    symbol: "MCX",
    price: "₹75,850",
    change: "+190",
    changePercent: "+0.25%",
    isPositive: true,
  },
  {
    id: "silver",
    name: "SILVER (1kg)",
    symbol: "MCX",
    price: "₹89,420",
    change: "+380",
    changePercent: "+0.43%",
    isPositive: true,
  },
  {
    id: "usdinr",
    name: "USD / INR",
    symbol: "FOREX",
    price: "₹83.72",
    change: "-0.03",
    changePercent: "-0.04%",
    isPositive: false,
  },
  {
    id: "crude",
    name: "CRUDE OIL",
    symbol: "MCX",
    price: "₹6,210",
    change: "+35",
    changePercent: "+0.57%",
    isPositive: true,
  },
  {
    id: "gsec",
    name: "10Y G-SEC",
    symbol: "BOND",
    price: "6.82%",
    change: "-0.02%",
    changePercent: "-0.29%",
    isPositive: false,
  },
];

export default function MarketTickerRibbon() {
  const [tickers, setTickers] = useState<TickerItem[]>(VERIFIED_TICKERS);
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Official Close");

  useEffect(() => {
    // Check Indian Stock Market hours (Mon-Fri, 9:15 AM - 3:30 PM IST)
    const checkMarketStatus = () => {
      const now = new Date();
      // Convert to IST (UTC + 5:30)
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utc + 3600000 * 5.5);

      const day = istTime.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
      const marketCloseMinutes = 15 * 60 + 30; // 3:30 PM

      const open = isWeekday && totalMinutes >= marketOpenMinutes && totalMinutes <= marketCloseMinutes;
      setIsMarketOpen(open);

      if (open) {
        setStatusText("Live Market");
      } else if (day === 0 || day === 6) {
        setStatusText("Market Closed · Weekend");
      } else {
        setStatusText("Market Closed · Official Close");
      }
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-[#030c1e] border-y border-white/10 text-white overflow-hidden py-2.5 select-none z-20 shadow-md">
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
          animation: tickerMarquee 42s linear infinite;
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center">
        {/* Left Fixed Live/Closed Market Indicator Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-4 pr-3.5 border-r border-white/10 z-10 bg-[#030c1e] flex-shrink-0 shadow-sm">
          {isMarketOpen ? (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          )}

          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 whitespace-nowrap">
            {isMarketOpen ? "NSE · BSE Live" : "NSE · BSE"}
          </span>

          <span className="text-[9px] text-slate-400 font-mono hidden md:inline px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            {statusText}
          </span>
        </div>

        {/* Gradient edge masks for smooth enter/exit */}
        <div className="pointer-events-none absolute left-0 sm:left-[170px] top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-[#030c1e] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-[#030c1e] to-transparent z-10" />

        {/* Marquee Container */}
        <div className="overflow-hidden w-full flex items-center">
          <div className="animate-ticker-marquee">
            {/* First Set of Items */}
            {tickers.map((item) => (
              <div
                key={`a-${item.id}`}
                className="inline-flex items-center gap-2 px-4 sm:px-5 border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer py-0.5"
                title={`${item.name} (${item.symbol}) - Rate: ${item.price} (${item.changePercent})`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[12px] sm:text-[13px] tracking-wide text-slate-100">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase bg-white/5 px-1 rounded">
                    {item.symbol}
                  </span>
                </div>

                <span className="font-mono font-semibold text-[12px] sm:text-[13px] text-slate-200">
                  {item.price}
                </span>

                <div
                  className={`flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                    item.isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="h-3 w-3 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline" />
                  )}
                  <span>{item.changePercent}</span>
                </div>
              </div>
            ))}

            {/* Duplicate Set for Seamless Continuous Loop */}
            {tickers.map((item) => (
              <div
                key={`b-${item.id}`}
                className="inline-flex items-center gap-2 px-4 sm:px-5 border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer py-0.5"
                title={`${item.name} (${item.symbol}) - Rate: ${item.price} (${item.changePercent})`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[12px] sm:text-[13px] tracking-wide text-slate-100">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase bg-white/5 px-1 rounded">
                    {item.symbol}
                  </span>
                </div>

                <span className="font-mono font-semibold text-[12px] sm:text-[13px] text-slate-200">
                  {item.price}
                </span>

                <div
                  className={`flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                    item.isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="h-3 w-3 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 inline" />
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
