import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// ═══════════════════════════════════════════════════════════
// LIVE STOCK & MUTUAL FUND SEARCH API
// Proxies Moneycontrol's autocomplete to get accurate NSE
// symbols and company names. Also fetches LTP for top results
// from the Moneycontrol Price API.
// ═══════════════════════════════════════════════════════════

interface SearchResult {
  /** NSE symbol (e.g. "RELIANCE", "GVT&D") or MF scheme name */
  symbol: string;
  /** Full company/scheme name */
  name: string;
  /** Sector (stocks) or empty */
  sector: string;
  /** "stock" or "mf" */
  type: "stock" | "mf";
  /** Last traded price / NAV */
  ltp?: number;
  /** Price change (absolute) */
  change?: number;
  /** Price change (%) */
  changePercent?: number;
  /** Moneycontrol sc_id (for price fetching) */
  scId?: string;
  /** MF scheme code from mfapi.in (for NAV fetching) */
  mfSchemeCode?: string;
}

/**
 * Extracts the NSE ticker symbol from the Moneycontrol `pdt_dis_nm` field.
 */
function extractNSESymbol(pdtDisNm: string | undefined): string | null {
  if (!pdtDisNm) return null;
  const spanMatch = pdtDisNm.match(/<span>([^<]+)<\/span>/);
  if (!spanMatch) return null;
  const parts = spanMatch[1].split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const nseSymbol = parts[1];
    if (nseSymbol && !/^\d+$/.test(nseSymbol)) return nseSymbol;
  }
  return null;
}

// Simple in-memory cache
const SEARCH_CACHE = new Map<string, { results: SearchResult[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch LTP from Moneycontrol Price API for a given sc_id.
 */
async function fetchPriceForScId(
  scId: string
): Promise<{ ltp: number; change: number; changePercent: number } | null> {
  try {
    const url = `https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${scId}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 3000,
    });
    const d = res.data?.data;
    if (!d?.pricecurrent) return null;

    return {
      ltp: parseFloat(String(d.pricecurrent).replace(/,/g, "")),
      change: parseFloat(d.pricechange || "0"),
      changePercent: parseFloat(d.pricepercentchange || "0"),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const includeMF = request.nextUrl.searchParams.get("mf") !== "0"; // include MF by default

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  // Check cache
  const cacheKey = `${query.toLowerCase()}_${includeMF ? "mf" : "eq"}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.results);
  }

  const results: SearchResult[] = [];

  try {
    // ── Fetch stocks (type=1) ──
    const stockUrl = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${encodeURIComponent(query)}&type=1&format=json`;

    const stockPromise = axios
      .get(stockUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        timeout: 5000,
      })
      .catch(() => ({ data: [] }));

    // ── Fetch mutual funds (type=2) ──
    let mfPromise: Promise<any> = Promise.resolve({ data: [] });
    if (includeMF) {
      const mfUrl = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${encodeURIComponent(query)}&type=2&format=json`;
      mfPromise = axios
        .get(mfUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          timeout: 5000,
        })
        .catch(() => ({ data: [] }));
    }

    const [stockRes, mfRes] = await Promise.all([stockPromise, mfPromise]);

    // ── Process stock results ──
    const stockItems: SearchResult[] = [];
    if (Array.isArray(stockRes.data)) {
      for (const item of stockRes.data) {
        const nseSymbol = extractNSESymbol(item.pdt_dis_nm);
        if (!nseSymbol) continue;
        if (nseSymbol.includes(":")) continue; // skip US stocks

        stockItems.push({
          symbol: nseSymbol,
          name: item.stock_name || item.name || nseSymbol,
          sector: item.sc_sector || "",
          type: "stock",
          scId: item.sc_id,
        });
      }
    }

    // Fetch LTP for top 5 stock results in parallel
    const topStocks = stockItems.slice(0, 5);
    const pricePromises = topStocks.map(async (stock) => {
      if (!stock.scId) return;
      const price = await fetchPriceForScId(stock.scId);
      if (price) {
        stock.ltp = price.ltp;
        stock.change = price.change;
        stock.changePercent = price.changePercent;
      }
    });

    await Promise.allSettled(pricePromises);
    results.push(...stockItems.slice(0, 8));

    // ── Process mutual fund results ──
    if (Array.isArray(mfRes.data)) {
      for (const item of mfRes.data.slice(0, 4)) {
        // Extract MF scheme code from link_src (e.g. "/mutual-funds/nav/sbi-small-cap/MSA031")
        const linkMatch = item.link_src?.match(/\/([A-Z0-9]+)$/i);
        results.push({
          symbol: linkMatch?.[1] || "",
          name: item.name || "",
          sector: "Mutual Fund",
          type: "mf",
        });
      }
    }

    // Cache the result
    SEARCH_CACHE.set(cacheKey, { results, ts: Date.now() });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Stock search error:", error.message);
    return NextResponse.json([]);
  }
}
