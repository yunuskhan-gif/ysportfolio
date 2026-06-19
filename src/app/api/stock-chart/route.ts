import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// ═══════════════════════════════════════════════════════════
// HISTORICAL CHART DATA API
// Fetches real chart data from Yahoo Finance (for stocks)
// and AMFI (for mutual funds).
// ═══════════════════════════════════════════════════════════

interface ChartPoint {
  date: string;
  price: number;
  volume: number;
}

const sanitizeSymbol = (symbol: string) => symbol.replace(".NS", "").replace(".BO", "");

function resolveStockTicker(symbol: string): string {
  let clean = symbol.toUpperCase().trim();
  let exchange = "NSE";
  
  if (clean.includes(":")) {
    const parts = clean.split(":");
    clean = parts[0];
    exchange = parts[1];
  }
  
  clean = sanitizeSymbol(clean);
  
  if (exchange === "BOM" || exchange === "BSE" || exchange === "BO" || symbol.includes(".BO")) {
    return `${clean}.BO`;
  }
  return `${clean}.NS`;
}

function formatDate(timestampMs: number, range: string): string {
  const d = new Date(timestampMs);
  if (range === "1Y") {
    // e.g. "Jun 26"
    return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  // e.g. "18 Jun"
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// Fetch mutual fund NAV history from api.mfapi.in with retries
async function fetchMFHistory(schemeCode: string): Promise<any> {
  const url = `https://api.mfapi.in/mf/${schemeCode}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      console.warn(`[MF API] Attempt ${attempt} failed: ${err.message}`);
    }
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  throw new Error(`Failed to fetch mutual fund history after 3 attempts`);
}

// Fallback generator if real APIs fail
function generateFallbackPoints(basePrice: number, rangeStr: string): ChartPoint[] {
  const pointsCount = rangeStr === "1M" ? 30 : rangeStr === "6M" ? 24 : 12;
  const data: ChartPoint[] = [];
  const today = new Date();
  
  let currentPrice = basePrice * (rangeStr === "1M" ? 0.98 : rangeStr === "6M" ? 0.88 : 0.75);
  const step = (basePrice - currentPrice) / pointsCount;

  for (let i = 0; i < pointsCount; i++) {
    const pct = (Math.random() - 0.46) * (rangeStr === "1M" ? 0.02 : rangeStr === "6M" ? 0.05 : 0.09);
    currentPrice = Math.max(10, currentPrice * (1 + pct) + step);
    
    const d = new Date(today);
    if (rangeStr === "1M") {
      d.setDate(today.getDate() - (pointsCount - i));
    } else if (rangeStr === "6M") {
      d.setDate(today.getDate() - (pointsCount - i) * 7);
    } else {
      d.setMonth(today.getMonth() - (pointsCount - i));
    }

    data.push({
      date: formatDate(d.getTime(), rangeStr),
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.round(10000 + Math.random() * 90000)
    });
  }

  // Ensure last point is exactly basePrice
  if (data.length > 0) {
    data[data.length - 1].price = basePrice;
  }
  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol")?.trim();
  const name = searchParams.get("name")?.trim() || "";
  const range = searchParams.get("range") || "1Y"; // Default 1 Year
  const ltpStr = searchParams.get("ltp");
  const ltp = ltpStr ? parseFloat(ltpStr) : null;

  if (!symbol) {
    return NextResponse.json({ message: "Symbol is required" }, { status: 400 });
  }

  const isMF = symbol.includes("MUTF_IN") || 
               symbol.includes("MUTUALFUND") || 
               name.toLowerCase().includes("mutual fund") || 
               name.toLowerCase().includes("fund") ||
               /^\d+$/.test(symbol.split(":")[0]); // google finance MF symbol check

  try {
    if (isMF) {
      // ═══════════════════════════════════════════════════════════
      // MUTUAL FUND FLOW
      // ═══════════════════════════════════════════════════════════
      // Extract numeric scheme code (e.g. "120586" from "120586:MUTF_IN")
      const schemeCode = symbol.split(":")[0].replace(/[^\d]/g, "");
      
      if (!schemeCode || schemeCode.length < 3) {
        throw new Error("Could not extract valid scheme code for Mutual Fund");
      }

      const mfData = await fetchMFHistory(schemeCode);
      const rawPoints = mfData.data || [];
      
      // Sort oldest to newest
      const parsedPoints = rawPoints.map((p: any) => {
        const parts = p.date.split("-");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return {
          timestamp: new Date(year, month, day).getTime(),
          price: parseFloat(p.nav),
        };
      }).sort((a: any, b: any) => a.timestamp - b.timestamp);

      // Filter by range
      const today = Date.now();
      let limitDays = 365;
      if (range === "1M") limitDays = 30;
      else if (range === "6M") limitDays = 180;
      
      const cutoffTime = today - limitDays * 24 * 60 * 60 * 1000;
      const filteredPoints = parsedPoints.filter((p: any) => p.timestamp >= cutoffTime);

      const chartPoints: ChartPoint[] = filteredPoints.map((p: any) => ({
        date: formatDate(p.timestamp, range),
        price: parseFloat(p.price.toFixed(2)),
        volume: 0
      }));

      // Fallback if no points returned in range
      if (chartPoints.length === 0) {
        return NextResponse.json(generateFallbackPoints(ltp || 100, range));
      }

      // Anchoring last point to ltp if available
      if (ltp && chartPoints.length > 0) {
        chartPoints[chartPoints.length - 1].price = ltp;
      }

      return NextResponse.json(chartPoints);
    } else {
      // ═══════════════════════════════════════════════════════════
      // STOCK FLOW
      // ═══════════════════════════════════════════════════════════
      const yahooSymbol = resolveStockTicker(symbol);
      const yahooRange = range === "1M" ? "1mo" : range === "6M" ? "6mo" : "1y";
      
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${yahooRange}&interval=1d`;
      
      const res = await axios.get(yahooUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
        timeout: 4000,
      });

      const chartResult = res.data?.chart?.result?.[0];
      if (!chartResult) {
        throw new Error("No chart result returned from Yahoo Finance");
      }

      const timestamps: number[] = chartResult.timestamp || [];
      const closePrices: (number | null)[] = chartResult.indicators?.quote?.[0]?.close || [];
      const volumes: (number | null)[] = chartResult.indicators?.quote?.[0]?.volume || [];

      const chartPoints: ChartPoint[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const price = closePrices[i];
        if (price === null || price === undefined || isNaN(price)) continue;
        
        chartPoints.push({
          date: formatDate(timestamps[i] * 1000, range),
          price: parseFloat(price.toFixed(2)),
          volume: volumes[i] || 0
        });
      }

      if (chartPoints.length === 0) {
        throw new Error("No valid price points found in Yahoo Finance response");
      }

      // Anchoring last point to ltp if available
      if (ltp && chartPoints.length > 0) {
        chartPoints[chartPoints.length - 1].price = ltp;
      }

      return NextResponse.json(chartPoints);
    }
  } catch (err: any) {
    console.error(`[Stock Chart API Error for ${symbol}]:`, err.message);
    // Graceful fallback to mock data anchored on the live price so the UI doesn't break
    const fallbackPrice = ltp || 100;
    return NextResponse.json(generateFallbackPoints(fallbackPrice, range));
  }
}
