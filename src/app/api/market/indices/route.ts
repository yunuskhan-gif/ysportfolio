import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TickerItem {
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

interface MarketResponse {
  success: boolean;
  source: string;
  isMarketOpen: boolean;
  marketStatusMessage: string;
  tradeDate: string;
  lastUpdated: string;
  tickers: TickerItem[];
}

let cachedResponse: MarketResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 1000; // 10 seconds in-memory cache to prevent spamming NSE

const formatNumber = (num: number, decimals = 2) => {
  if (isNaN(num) || num === undefined || num === null) return "0.00";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export async function GET() {
  const now = Date.now();

  // Return cached response if fresh
  if (cachedResponse && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  }

  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.nseindia.com/",
    };

    // Step 1: Establish session with NSE to acquire session cookies
    const sessionRes = await fetch("https://www.nseindia.com", {
      headers,
      signal: AbortSignal.timeout(4000),
    });

    const rawCookies = sessionRes.headers.get("set-cookie") || "";
    const cookies = rawCookies
      .split(",")
      .map((c) => c.split(";")[0])
      .join("; ");

    const nseReqHeaders = {
      ...headers,
      Cookie: cookies,
    };

    // Step 2: Fetch all indices & market status in parallel from NSE
    const [indicesRes, statusRes, sensexRes] = await Promise.allSettled([
      fetch("https://www.nseindia.com/api/allIndices", {
        headers: nseReqHeaders,
        signal: AbortSignal.timeout(5000),
      }).then((r) => (r.ok ? r.json() : null)),

      fetch("https://www.nseindia.com/api/marketStatus", {
        headers: nseReqHeaders,
        signal: AbortSignal.timeout(5000),
      }).then((r) => (r.ok ? r.json() : null)),

      fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN?interval=1d", {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(4000),
      }).then((r) => (r.ok ? r.json() : null)),
    ]);

    const indicesData = indicesRes.status === "fulfilled" ? indicesRes.value : null;
    const statusData = statusRes.status === "fulfilled" ? statusRes.value : null;
    const sensexData = sensexRes.status === "fulfilled" ? sensexRes.value : null;

    if (!indicesData?.data || !Array.isArray(indicesData.data)) {
      throw new Error("Invalid or empty indices data from NSE");
    }

    const nseIndicesMap = new Map<string, any>();
    indicesData.data.forEach((item: any) => {
      if (item && item.index) {
        nseIndicesMap.set(item.index.trim().toUpperCase(), item);
      }
    });

    // Market status detection
    let isMarketOpen = false;
    let marketStatusMessage = "Market Closed";
    let tradeDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (statusData?.marketState && Array.isArray(statusData.marketState)) {
      const cmState = statusData.marketState.find(
        (m: any) => m.market === "Capital Market"
      );
      if (cmState) {
        isMarketOpen = cmState.marketStatus?.toLowerCase() === "open";
        marketStatusMessage = cmState.marketStatusMessage || (isMarketOpen ? "Normal Market is Open" : "Market Closed");
        if (cmState.tradeDate) tradeDate = cmState.tradeDate;
      }
    }

    const tickers: TickerItem[] = [];

    // Helper to extract NSE index
    const pushNSEIndex = (keyName: string, id: string, displayName: string, symbol = "NSE") => {
      const data = nseIndicesMap.get(keyName.toUpperCase());
      if (data && typeof data.last === "number") {
        const last = data.last;
        const change = typeof data.variation === "number" ? data.variation : 0;
        const pct = typeof data.percentChange === "number" ? data.percentChange : 0;
        const isPos = change >= 0;

        tickers.push({
          id,
          name: displayName,
          symbol,
          price: formatNumber(last),
          change: `${isPos ? "+" : ""}${formatNumber(change)}`,
          changePercent: `${isPos ? "+" : ""}${pct.toFixed(2)}%`,
          isPositive: isPos,
          high: data.high ? formatNumber(data.high) : undefined,
          low: data.low ? formatNumber(data.low) : undefined,
        });
      }
    };

    // 1. NIFTY 50 (Official Benchmark)
    pushNSEIndex("NIFTY 50", "nifty50", "NIFTY 50", "NSE");

    // 2. SENSEX (BSE Benchmark)
    if (sensexData?.chart?.result?.[0]?.meta) {
      const meta = sensexData.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose || meta.previousClose;
      if (price) {
        const diff = prev ? price - prev : 0;
        const pct = prev ? (diff / prev) * 100 : 0;
        const isPos = diff >= 0;
        tickers.push({
          id: "sensex",
          name: "SENSEX",
          symbol: "BSE",
          price: formatNumber(price),
          change: `${isPos ? "+" : ""}${formatNumber(diff)}`,
          changePercent: `${isPos ? "+" : ""}${pct.toFixed(2)}%`,
          isPositive: isPos,
        });
      }
    }

    // 3. GIFT NIFTY (from NSE market status)
    if (statusData?.giftnifty?.LASTPRICE) {
      const gn = statusData.giftnifty;
      const gnPrice = Number(gn.LASTPRICE);
      const gnChange = Number(gn.DAYCHANGE || 0);
      const gnPct = Number(gn.PERCHANGE || 0);
      const isPos = gnChange >= 0;
      tickers.push({
        id: "giftnifty",
        name: "GIFT NIFTY",
        symbol: "NSE IX",
        price: formatNumber(gnPrice),
        change: `${isPos ? "+" : ""}${formatNumber(gnChange)}`,
        changePercent: `${isPos ? "+" : ""}${gnPct.toFixed(2)}%`,
        isPositive: isPos,
      });
    }

    // 4. BANK NIFTY
    pushNSEIndex("NIFTY BANK", "banknifty", "BANK NIFTY", "NSE");

    // 5. NIFTY IT
    pushNSEIndex("NIFTY IT", "niftyit", "NIFTY IT", "NSE");

    // 6. NIFTY MIDCAP 150
    pushNSEIndex("NIFTY MIDCAP 150", "midcap150", "NIFTY MID 150", "NSE");

    // 7. NIFTY NEXT 50
    pushNSEIndex("NIFTY NEXT 50", "next50", "NIFTY NEXT 50", "NSE");

    // 8. NIFTY AUTO
    pushNSEIndex("NIFTY AUTO", "auto", "NIFTY AUTO", "NSE");

    // 9. NIFTY FMCG
    pushNSEIndex("NIFTY FMCG", "fmcg", "NIFTY FMCG", "NSE");

    // 10. NIFTY METAL
    pushNSEIndex("NIFTY METAL", "metal", "NIFTY METAL", "NSE");

    // 11. NIFTY PHARMA
    pushNSEIndex("NIFTY PHARMA", "pharma", "NIFTY PHARMA", "NSE");

    // 12. INDIA VIX
    pushNSEIndex("INDIA VIX", "indiavix", "INDIA VIX", "NSE");

    // 13. USD / INR (from NSE currency future if available)
    if (statusData?.marketState) {
      const curr = statusData.marketState.find(
        (m: any) => m.underlying === "USDINR" || m.market === "currencyfuture"
      );
      if (curr && curr.last) {
        const val = parseFloat(curr.last);
        if (!isNaN(val) && val > 0) {
          tickers.push({
            id: "usdinr",
            name: "USD / INR",
            symbol: "NSE FOREX",
            price: `₹${val.toFixed(2)}`,
            change: "0.00",
            changePercent: "0.00%",
            isPositive: true,
          });
        }
      }
    }

    const payload: MarketResponse = {
      success: true,
      source: "NSE Official Live",
      isMarketOpen,
      marketStatusMessage,
      tradeDate,
      lastUpdated: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      tickers,
    };

    cachedResponse = payload;
    lastFetchTime = now;

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    console.warn("Failed to fetch fresh NSE indices, falling back:", error.message);

    // If cache exists, return it with stale flag
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        source: "NSE Official (Cached)",
      });
    }

    // Default static fallback if even first request fails
    return NextResponse.json(
      {
        success: false,
        source: "Fallback Benchmark",
        isMarketOpen: false,
        marketStatusMessage: "Market Closed",
        tradeDate: new Date().toLocaleDateString("en-IN"),
        lastUpdated: new Date().toLocaleTimeString("en-IN"),
        tickers: [
          {
            id: "nifty50",
            name: "NIFTY 50",
            symbol: "NSE",
            price: "22,480.65",
            change: "+248.85",
            changePercent: "+1.12%",
            isPositive: true,
          },
          {
            id: "sensex",
            name: "SENSEX",
            symbol: "BSE",
            price: "72,322.24",
            change: "+729.00",
            changePercent: "+1.02%",
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
            id: "indiavix",
            name: "INDIA VIX",
            symbol: "NSE",
            price: "14.76",
            change: "-0.52",
            changePercent: "-3.38%",
            isPositive: false,
          },
        ],
      },
      { status: 200 }
    );
  }
}
