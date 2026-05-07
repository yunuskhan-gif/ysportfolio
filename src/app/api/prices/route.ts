import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalConfigModel from "@/lib/models/MotilalConfig";
import MotilalScripModel from "@/lib/models/MotilalScrip";

const sanitizeSymbol = (symbol: string) => symbol.replace(".NS", "").replace(".BO", "");

// ═══════════════════════════════════════════════════════════
// IN-MEMORY PRICE CACHE — Avoid hammering scrapers
// Prices are cached for 5 minutes. Stale prices are returned
// as fallback if all scrapers fail.
// ═══════════════════════════════════════════════════════════
interface CachedPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  source: string;
  fetchedAt: number; // timestamp
}

const PRICE_CACHE = new Map<string, CachedPrice>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STALE_TTL_MS = 60 * 60 * 1000; // 1 hour (for fallback)

const getCachedPrice = (symbol: string): CachedPrice | null => {
  const cached = PRICE_CACHE.get(symbol.toUpperCase());
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
  return null; // expired
};

const getStaleCachedPrice = (symbol: string): CachedPrice | null => {
  const cached = PRICE_CACHE.get(symbol.toUpperCase());
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt < STALE_TTL_MS) return { ...cached, source: `${cached.source} (cached)` };
  return null;
};

const setCachedPrice = (symbol: string, data: CachedPrice) => {
  PRICE_CACHE.set(symbol.toUpperCase(), { ...data, fetchedAt: Date.now() });
};

// ═══════════════════════════════════════════════════════════
// PRICE VALIDATION — Sanity check scraped prices
// ═══════════════════════════════════════════════════════════
const isValidPrice = (price: number): boolean => {
  return typeof price === "number" && !isNaN(price) && isFinite(price) && price > 0 && price < 10_000_000;
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 1: Screener.in — Most reliable for Indian stocks
// ═══════════════════════════════════════════════════════════
const scrapePriceFromScreener = async (symbol: string): Promise<CachedPrice | null> => {
  const cleanSymbol = sanitizeSymbol(symbol);
  const urls = [
    `https://www.screener.in/company/${cleanSymbol}/`,
    `https://www.screener.in/company/${cleanSymbol}/consolidated/`,
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 5000,
        maxRedirects: 3,
      });

      const $ = cheerio.load(response.data);
      let price = NaN;

      // Method 1: Structured #top-ratios
      $("#top-ratios li").each((_, el) => {
        const name = $(el).find(".name").text().replace(/\s+/g, " ").trim().toLowerCase();
        if (name === "current price") {
          const raw = $(el).find(".value .number").first().text().replace(/,/g, "").trim();
          if (raw) price = parseFloat(raw);
        }
      });

      // Method 2: Broader selector
      if (!isValidPrice(price)) {
        const text = $('#top-ratios li:contains("Current Price") .number').first().text().replace(/,/g, "").trim();
        if (text) price = parseFloat(text);
      }

      // Method 3: Regex on body text
      if (!isValidPrice(price)) {
        const pageText = $("body").text().replace(/\s+/g, " ");
        const match = pageText.match(/Current Price\s*₹\s*([\d,]+(?:\.\d+)?)/i);
        if (match) price = parseFloat(match[1].replace(/,/g, ""));
      }

      if (isValidPrice(price)) {
        return { symbol, price, change: 0, changePercent: 0, source: "Screener", fetchedAt: Date.now() };
      }
    } catch (e: any) {
      if (e.response?.status !== 404) {
        console.warn(`Screener [${url}]:`, e.message);
      }
    }
  }
  return null;
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 2: Google Finance
// ═══════════════════════════════════════════════════════════
const scrapePriceFromGoogleFinance = async (symbol: string, exchange: string = "NSE"): Promise<CachedPrice | null> => {
  try {
    let cleanSymbol = sanitizeSymbol(symbol);
    let exchanges = exchange === "NSE" ? ["NSE", "BOM", "MUTF_IN"] : [exchange];

    // If symbol already has an exchange (e.g. "RELIANCE:NSE" or "ID:MUTF_IN")
    if (symbol.includes(":")) {
      const parts = symbol.split(":");
      cleanSymbol = parts[0];
      exchanges = [parts[1]];
    }
    
    for (const exch of exchanges) {
      const url = `https://www.google.com/finance/quote/${cleanSymbol}:${exch}`;
      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
          timeout: 4000,
        });

        const $ = cheerio.load(response.data);
        const html = response.data as string;
        let price = NaN;

        // Method 1: Known class selectors (including new ones found in beta)
        for (const sel of [".YMlKec.fxKbKc", ".YMlS1d", ".AHmHk .fxKbKc", ".rPF6Lc", ".kf1m0"]) {
          const text = $(sel).first().text().replace(/,/g, "").replace(/[₹$]/g, "").trim();
          if (text) {
            price = parseFloat(text);
            if (isValidPrice(price)) break;
          }
        }

        // Method 2: data-last-price attribute
        if (!isValidPrice(price)) {
          const attr = $("[data-last-price]").attr("data-last-price");
          if (attr) price = parseFloat(attr);
        }

        // Method 3: Regex in raw HTML
        if (!isValidPrice(price)) {
          const match = html.match(/data-last-price="([\d.]+)"/);
          if (match) price = parseFloat(match[1]);
        }

        if (isValidPrice(price)) {
          // Also try to get change percent
          let changePercent = 0;
          const cpText = $(".Jw7X9 .P29nLc").first().text().replace(/[()%]/g, "").trim();
          if (cpText) changePercent = parseFloat(cpText);

          return { 
            symbol, 
            price, 
            change: 0, 
            changePercent, 
            source: `Google Finance (${exch})`, 
            fetchedAt: Date.now() 
          };
        }
      } catch (e) {
        continue; // Try next exchange
      }
    }
    return null;
  } catch (error: any) {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 3: Yahoo Finance page scrape (NOT the API)
// ═══════════════════════════════════════════════════════════
const scrapePriceFromYahooPage = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    const yahooSymbol = `${cleanSymbol}.NS`;
    const url = `https://finance.yahoo.com/quote/${yahooSymbol}/`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 5000,
    });

    const html = response.data as string;
    let price = NaN;

    // Method 1: regularMarketPrice in JSON
    const m1 = html.match(/"regularMarketPrice":\s*\{[^}]*"raw":\s*([\d.]+)/);
    if (m1) price = parseFloat(m1[1]);

    // Method 2: fin-streamer tag
    if (!isValidPrice(price)) {
      const $ = cheerio.load(html);
      const val = $('fin-streamer[data-field="regularMarketPrice"]').attr("data-value") ||
                  $('fin-streamer[data-field="regularMarketPrice"]').text().replace(/,/g, "").trim();
      if (val) price = parseFloat(val);
    }

    // Method 3: currentPrice in JSON
    if (!isValidPrice(price)) {
      const m2 = html.match(/"currentPrice":\s*\{[^}]*"raw":\s*([\d.]+)/);
      if (m2) price = parseFloat(m2[1]);
    }

    if (isValidPrice(price)) {
      return { symbol, price, change: 0, changePercent: 0, source: "Yahoo Finance", fetchedAt: Date.now() };
    }
    return null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 4: Moneycontrol Price API — Fast JSON endpoint
// Uses search to find sc_id, then hits the price API directly
// ═══════════════════════════════════════════════════════════

// Cache sc_id lookups so we only search once per symbol
const SCID_CACHE = new Map<string, { scId: string; ts: number }>();
const SCID_TTL = 24 * 60 * 60 * 1000; // 24 hours

function extractNSESymbolFromMC(pdtDisNm: string | undefined): string | null {
  if (!pdtDisNm) return null;
  const spanMatch = pdtDisNm.match(/<span>([^<]+)<\/span>/);
  if (!spanMatch) return null;
  const parts = spanMatch[1].split(",").map((s: string) => s.trim());
  if (parts.length >= 2 && parts[1] && !/^\d+$/.test(parts[1])) return parts[1];
  return null;
}

const findMoneycontrolScId = async (symbol: string): Promise<string | null> => {
  const cleanSymbol = sanitizeSymbol(symbol);
  const cacheKey = cleanSymbol.toUpperCase();

  // Check sc_id cache
  const cached = SCID_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < SCID_TTL) return cached.scId;

  try {
    const searchUrl = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${encodeURIComponent(cleanSymbol)}&type=1&format=json`;
    const searchRes = await axios.get(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 4000,
    });

    if (!Array.isArray(searchRes.data) || searchRes.data.length === 0) return null;

    // Find exact NSE symbol match
    const match = searchRes.data.find((item: any) => {
      const nse = extractNSESymbolFromMC(item.pdt_dis_nm);
      return nse?.toUpperCase() === cleanSymbol.toUpperCase();
    }) || searchRes.data[0];

    if (!match?.sc_id) return null;

    SCID_CACHE.set(cacheKey, { scId: match.sc_id, ts: Date.now() });
    return match.sc_id;
  } catch {
    return null;
  }
};

const scrapePriceFromMoneycontrol = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const scId = await findMoneycontrolScId(symbol);
    if (!scId) return null;

    const priceUrl = `https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${scId}`;
    const res = await axios.get(priceUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 4000,
    });

    const d = res.data?.data;
    if (!d?.pricecurrent) return null;

    const price = parseFloat(String(d.pricecurrent).replace(/,/g, ""));
    const change = parseFloat(d.pricechange || "0");
    const changePercent = parseFloat(d.pricepercentchange || "0");

    if (isValidPrice(price)) {
      return { symbol, price, change, changePercent, source: "Moneycontrol", fetchedAt: Date.now() };
    }
    return null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 4b: Moneycontrol Mutual Fund API — For NAV fetching
// ═══════════════════════════════════════════════════════════
const scrapePriceFromMoneycontrolMF = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    // For MFs, the symbol is usually the scheme code (e.g., MSA031 or MSN1536)
    const priceUrl = `https://priceapi.moneycontrol.com/pricefeed/mutualfund/nav/${cleanSymbol}`;
    const res = await axios.get(priceUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 4000,
    });

    const d = res.data?.data;
    if (!d?.nav) return null;

    const price = parseFloat(String(d.nav).replace(/,/g, ""));
    const change = parseFloat(d.navChange || "0");
    const changePercent = parseFloat(d.navPChange || "0");

    if (isValidPrice(price)) {
      return { symbol, price, change, changePercent, source: "Moneycontrol MF", fetchedAt: Date.now() };
    }
    return null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 4c: Moneycontrol MF Web Scrape — Fallback for API
// Scrapes the actual NAV from the web page title or .amt class
// ═══════════════════════════════════════════════════════════
const scrapePriceFromMoneycontrolMFPage = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    // Use the short redirect URL pattern
    const url = `https://www.moneycontrol.com/mutual-funds/nav/-/${cleanSymbol}`;
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 6000,
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);
    let price = NaN;

    // Method 1: Title Tag [NAV]
    const title = $("title").text();
    const titleMatch = title.match(/\[([\d\.,]+)\]/);
    if (titleMatch) {
      price = parseFloat(titleMatch[1].replace(/,/g, ""));
    }

    // Method 2: .amt class
    if (!isValidPrice(price)) {
      const amtText = $(".amt").first().text().replace(/,/g, "").trim();
      if (amtText) price = parseFloat(amtText);
    }

    // Method 3: og:title meta
    if (!isValidPrice(price)) {
      const ogTitle = $('meta[property="og:title"]').attr("content");
      const ogMatch = ogTitle?.match(/\[([\d\.,]+)\]/);
      if (ogMatch) price = parseFloat(ogMatch[1].replace(/,/g, ""));
    }

    // Method 4: Regex in body text (searching for "NAV 73.74")
    if (!isValidPrice(price)) {
      const bodyText = $("body").text().replace(/\s+/g, " ");
      const navMatch = bodyText.match(/NAV\s*(?:as on[^:]+)?[:\s]+₹?\s*([\d\.,]+)/i);
      if (navMatch) price = parseFloat(navMatch[1].replace(/,/g, ""));
    }

    if (isValidPrice(price)) {
      // Try to get change from .percentage or .p_change
      let changePercent = 0;
      const pcText = $(".percentage, .p_change, .amt_pct").first().text().replace(/[()%]/g, "").trim();
      if (pcText) changePercent = parseFloat(pcText);

      return { 
        symbol, 
        price, 
        change: 0, 
        changePercent, 
        source: "Moneycontrol MF (Web)", 
        fetchedAt: Date.now() 
      };
    }
    return null;
  } catch (e: any) {
    console.warn(`Moneycontrol MF Web [${symbol}]:`, e.message);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 5: NSE India official website
// ═══════════════════════════════════════════════════════════
const scrapePriceFromNSE = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    // Try API first
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(cleanSymbol)}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
      },
      timeout: 5000,
    });

    const data = response.data;
    let price = data?.priceInfo?.lastPrice || data?.priceInfo?.close;

    // Fallback: If API returns no price, try scraping the page directly
    if (!isValidPrice(price)) {
      const pageUrl = `https://www.nseindia.com/get-quote/equity?symbol=${encodeURIComponent(cleanSymbol)}`;
      const pageRes = await axios.get(pageUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36" },
        timeout: 5000
      });
      const $ = cheerio.load(pageRes.data);
      // Looking for the price in the structure identified: <span class="val">328.10</span>
      const valText = $("span.val").first().text().replace(/,/g, "").trim();
      if (valText) price = parseFloat(valText);
    }

    if (isValidPrice(price)) {
      const change = data?.priceInfo?.change || 0;
      const pChange = data?.priceInfo?.pChange || 0;
      return { symbol, price, change, changePercent: pChange, source: "NSE India", fetchedAt: Date.now() };
    }
    return null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// MASTER FETCHER — Race all scrapers, first valid result wins
// Moneycontrol Price API is now a primary scraper since it
// handles special symbols (GVT&D, etc.) and returns change%.
// ═══════════════════════════════════════════════════════════
const fetchPriceForSymbol = async (symbol: string, retryCount = 0): Promise<CachedPrice | null> => {
  const cleanSymbol = sanitizeSymbol(symbol);
  
  // 1. Check fresh cache first
  const cached = getCachedPrice(symbol);
  if (cached) {
    return cached;
  }

  // 2. Detect and route Mutual Funds (MF symbols are usually alphanumeric codes like MSA031 or Google Finance IDs)
  const isMF = /^[A-Z]{2,}[A-Z0-9_]*[0-9]+$/.test(cleanSymbol) || 
               cleanSymbol.includes("_") || 
               cleanSymbol.includes(":") || 
               cleanSymbol.length > 12 ||
               /fund|growth|direct|regular/i.test(cleanSymbol);
  
  if (isMF) {
    // Try Moneycontrol API then Web Page
    try {
      const apiResult = await scrapePriceFromMoneycontrolMF(symbol);
      if (apiResult) {
        setCachedPrice(symbol, apiResult);
        return apiResult;
      }
      
      const webResult = await scrapePriceFromMoneycontrolMFPage(symbol);
      if (webResult) {
        setCachedPrice(symbol, webResult);
        return webResult;
      }
    } catch { /* fallback to normal scrapers just in case */ }
  }

  // 3. Race the top 3 scrapers for speed
  try {
    const raceResult = await Promise.any([
      scrapePriceFromMoneycontrol(symbol).then(r => { if (!r) throw new Error("no result"); return r; }),
      scrapePriceFromScreener(symbol).then(r => { if (!r) throw new Error("no result"); return r; }),
      scrapePriceFromGoogleFinance(symbol, isMF ? "MUTF_IN" : "NSE").then(r => { if (!r) throw new Error("no result"); return r; }),
    ]);

    if (raceResult) {
      setCachedPrice(symbol, raceResult);
      return raceResult;
    }
  } catch {
    // All primary scrapers failed
  }

  // 4. Sequential Fallback (Try MC Web Scraper again if not already tried for MF)
  const fallbackScrapers = isMF ? [scrapePriceFromYahooPage] : [scrapePriceFromYahooPage, scrapePriceFromNSE];
  
  // If MF and we haven't tried MC Web yet (unlikely given logic above, but safe)
  if (isMF) {
    const mcWeb = await scrapePriceFromMoneycontrolMFPage(symbol);
    if (mcWeb) {
      setCachedPrice(symbol, mcWeb);
      return mcWeb;
    }
  }

  for (const scraper of fallbackScrapers) {
    try {
      const result = await scraper(symbol);
      if (result) {
        setCachedPrice(symbol, result);
        return result;
      }
    } catch { continue; }
  }

  // 5. DEEP SEARCH FALLBACK (For Excel/Broker names that don't match tickers)
  if (retryCount === 0) {
    const scId = await findMoneycontrolScId(cleanSymbol);
    if (scId) {
      const res = await scrapePriceFromMoneycontrol(symbol); 
      if (res) {
        setCachedPrice(symbol, res);
        return res;
      }
    }
  }

  // 6. Last resort: return stale cached price
  const stale = getStaleCachedPrice(symbol);
  if (stale) return stale;

  console.error(`🚫 ALL SOURCES FAILED for ${cleanSymbol}`);
  return null;
};

// ═══════════════════════════════════════════════════════════
// API ROUTE HANDLER
// ═══════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsStr = searchParams.get("symbols");

  if (!symbolsStr) {
    return NextResponse.json({ message: "Symbols are required" }, { status: 400 });
  }

  const symbols = symbolsStr.split(",");

  // ═══════════════════════════════════════════════════════════
  // SCRIP MAPPING — Correct common broker/excel mismatches
  // ═══════════════════════════════════════════════════════════
  const SCRIP_MAPPING: Record<string, string> = {
    "TMPV": "TMCV",          // Motilal uses TMPV, NSE uses TMCV
    "GE VERNOVA": "GVT&D",
    "GVT&D": "GVT&D",
    "TATACAP": "TATAINVEST",
    "ITCHOTELS": "ITC",
    "BAJAJHFL": "BAJAJHFL",  // Bajaj Housing
    "RELIANCE IND": "RELIANCE",
    "TATA MOTORS": "TMCV",
    "HDFC BANK": "HDFCBANK",
  };

  const mappedSymbols = symbols.map(s => {
    let base = s.replace(".NS", "").toUpperCase().trim();
    
    // Check direct mapping
    if (SCRIP_MAPPING[base]) {
      return `${SCRIP_MAPPING[base]}.NS`;
    }

    // Handle names that might be passed as symbols from Excel
    return (s.includes(".") || s.includes(":")) ? s : `${s}.NS`;
  });

  try {
    // Fetch all symbols in parallel
    const results = await Promise.all(
      mappedSymbols.map((mappedSymbol, idx) =>
        fetchPriceForSymbol(mappedSymbol).then(result => {
          if (result) return { ...result, symbol: symbols[idx] };
          return null;
        })
      )
    );

    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0) {
      return NextResponse.json({ message: "All price sources failed." }, { status: 503 });
    }

    console.log(`📊 Prices: ${validResults.length}/${symbols.length} resolved`);
    return NextResponse.json(validResults);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal error", error: error.message }, { status: 500 });
  }
}
