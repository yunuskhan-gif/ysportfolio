import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// ═══════════════════════════════════════════════════════════
// LIVE STOCK & MUTUAL FUND SEARCH API
// Uses Moneycontrol's autocomplete for both stocks and MFs,
// then fetches live LTP/NAV for top results.
// ═══════════════════════════════════════════════════════════

interface SearchResult {
  symbol: string;
  name: string;
  sector: string;
  type: "stock" | "mf";
  ltp?: number;
  change?: number;
  changePercent?: number;
  scId?: string;
  mfSchemeCode?: string;
}

// In-memory cache: 5 minutes
const SEARCH_CACHE = new Map<string, { results: SearchResult[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Extracts the NSE ticker symbol from the Moneycontrol `pdt_dis_nm` field.
 * Format: "<span>Company Name, SYMBOL, BSE_CODE</span>"
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

/**
 * Scrapes Google Search to find Google Finance quote links.
 * This is a powerful fallback to get accurate GF symbols.
 */
async function searchGoogleFinance(query: string): Promise<SearchResult[]> {
  try {
    // Search Google for the finance quote page
    const searchUrl = `https://www.google.com/search?q=site:google.com/finance/quote+${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    // Parse links that match Google Finance quote patterns
    $('a').each((i, el) => {
      const href = $(el).attr('href') || "";
      const text = $(el).text() || "";
      
      // Look for /quote/SYMBOL:EXCHANGE in the href
      // This matches direct links or links within Google's /url?q=... redirector
      const gfMatch = href.match(/quote\/([A-Z0-9_]+):([A-Z0-9_]+)/i);
      
      if (gfMatch && results.length < 6) {
        const symbol = gfMatch[1];
        const exchange = gfMatch[2];
        
        // Skip common non-asset links
        if (symbol === "INDEXNSE" || symbol === "INDEXBOM" || symbol === "SENSEX" || symbol === "NIFTY_50") return;

        // Try to find the title in the closest h3 or the link text itself
        const h3 = $(el).find('h3');
        const nameText = h3.length > 0 ? h3.text() : text;
        
        // Clean up name
        const name = nameText
          .replace(/ - Google Finance.*/i, "")
          .replace(/Mutual Fund Price.*/i, "")
          .replace(/ \(\w+\) .*/i, "")
          .trim();

        const fullSymbol = `${symbol}:${exchange}`; // Always use colon format for GF results
        
        // Avoid duplicate symbols in the results
        if (results.some(r => r.symbol === fullSymbol)) return;

        results.push({
          symbol: fullSymbol,
          name: name || symbol,
          sector: exchange === 'MUTF_IN' ? 'Mutual Fund' : 'Stock',
          type: exchange === 'MUTF_IN' ? 'mf' : 'stock',
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Google Finance search error:", error);
    return [];
  }
}

/**
 * Fetch live stock price from Moneycontrol price API using sc_id.
 */
async function fetchStockLTP(scId: string): Promise<{ ltp: number; change: number; changePercent: number } | null> {
  try {
    const res = await axios.get(`https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${scId}`, {
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

/**
 * Fetch live MF NAV from Moneycontrol NAV API using scheme code (e.g. MSN1536).
 */
async function fetchMFNav(schemeCode: string): Promise<{ ltp: number; change: number; changePercent: number } | null> {
  try {
    const res = await axios.get(`https://priceapi.moneycontrol.com/pricefeed/mutualfund/nav/${schemeCode}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 3000,
    });
    const d = res.data?.data;
    if (!d?.nav) return null;
    return {
      ltp: parseFloat(String(d.nav).replace(/,/g, "")),
      change: parseFloat(d.navChange || "0"),
      changePercent: parseFloat(d.navPChange || "0"),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const includeMF = request.nextUrl.searchParams.get("mf") !== "0";

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  // Cache check
  const cacheKey = `${query.toLowerCase()}_${includeMF ? "mf" : "eq"}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.results);
  }

  try {
    // 1. Fetch from Google Finance Search (Primary for Mutual Funds)
    const gfPromise = searchGoogleFinance(query);

    // 2. Fetch stocks (type=1) from Moneycontrol
    const stockPromise = axios
      .get(
        `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${encodeURIComponent(query)}&type=1&format=json`,
        {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          timeout: 5000,
        }
      )
      .catch(() => ({ data: [] }));

    // 3. Fetch mutual funds (type=2) from Moneycontrol
    const mfPromise = includeMF
      ? axios
          .get(
            `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${encodeURIComponent(query)}&type=2&format=json`,
            {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
              timeout: 5000,
            }
          )
          .catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] });

    const [gfResults, stockRes, mfRes] = await Promise.all([gfPromise, stockPromise, mfPromise]);
    console.log(`🔍 Search Results - GF: ${gfResults.length}, Stocks: ${stockRes.data?.length || 0}, MF: ${mfRes.data?.length || 0}`);

    const results: SearchResult[] = [];

    // Interleave and prioritize:
    // If query looks like a fund, put GF results and MF results at the top
    const looksLikeFund = /fund|cap|growth|direct|regular|plan|mutual|equity|index/i.test(query);
    console.log(`📊 Query: "${query}", LooksLikeFund: ${looksLikeFund}`);

    if (looksLikeFund) {
      results.push(...gfResults);
    } else {
      // For stock-like queries, put a mix but prioritize GF matches if any
      results.push(...gfResults.slice(0, 3));
    }

    // Process stocks
    const stockItems: SearchResult[] = [];
    if (Array.isArray(stockRes.data)) {
      for (const item of stockRes.data.slice(0, 8)) {
        const nseSymbol = extractNSESymbol(item.pdt_dis_nm);
        if (!nseSymbol || nseSymbol.includes(":")) continue;
        if (results.some(r => r.symbol === nseSymbol)) continue;

        stockItems.push({
          symbol: nseSymbol,
          name: item.stock_name || item.name || nseSymbol,
          sector: item.sc_sector || "",
          type: "stock",
          scId: item.sc_id,
        });
      }
    }

    // Process mutual funds
    const mfItems: SearchResult[] = [];
    if (includeMF && Array.isArray(mfRes.data)) {
      for (const item of mfRes.data.slice(0, 6)) {
        const linkMatch = item.link_src?.match(/\/([A-Z0-9]+)$/i);
        const symbol = linkMatch?.[1] || "";
        if (!symbol || results.some(r => r.symbol === symbol)) continue;

        mfItems.push({
          symbol,
          name: item.name || symbol,
          sector: "Mutual Fund",
          type: "mf",
        });
      }
    }

    if (looksLikeFund) {
      results.push(...mfItems);
      results.push(...stockItems);
    } else {
      results.push(...stockItems);
      results.push(...mfItems);
    }

    // Fetch LTP for top 8 results in parallel
    const topResults = results.slice(0, 8);
    await Promise.allSettled(
      topResults.map(async (item) => {
        try {
          if (item.scId && item.type === "stock") {
            const price = await fetchStockLTP(item.scId);
            if (price) {
              item.ltp = price.ltp;
              item.change = price.change;
              item.changePercent = price.changePercent;
            }
          } else {
            // For GF symbols or MF codes, use our internal prices API as a universal fetcher
            const priceUrl = `${request.nextUrl.origin}/api/prices?symbols=${encodeURIComponent(item.symbol)}`;
            const res = await axios.get(priceUrl, { timeout: 3000 }).catch(() => null);
            if (res?.data?.[0]) {
              item.ltp = res.data[0].price;
              item.changePercent = res.data[0].changePercent;
            }
          }
        } catch { /* skip */ }
      })
    );

    // Cache and return
    const finalResults = results.slice(0, 12);
    SEARCH_CACHE.set(cacheKey, { results: finalResults, ts: Date.now() });
    return NextResponse.json(finalResults);
  } catch (error: any) {
    console.error("Search error:", error.message);
    return NextResponse.json([]);
  }
}
