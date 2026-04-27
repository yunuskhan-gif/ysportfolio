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
const scrapePriceFromGoogleFinance = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    const url = `https://www.google.com/finance/quote/${cleanSymbol}:NSE`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);
    const html = response.data as string;
    let price = NaN;

    // Method 1: Known class selectors
    for (const sel of [".YMlKec.fxKbKc", ".AHmHk .fxKbKc", ".rPF6Lc", ".kf1m0"]) {
      const text = $(sel).first().text().replace(/,/g, "").replace("₹", "").trim();
      if (text) { price = parseFloat(text); if (isValidPrice(price)) break; }
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
      return { symbol, price, change: 0, changePercent: 0, source: "Google Finance", fetchedAt: Date.now() };
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
// SCRAPER 4: Moneycontrol — Another major Indian finance site
// ═══════════════════════════════════════════════════════════
const scrapePriceFromMoneycontrol = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    // Search for the stock on Moneycontrol
    const searchUrl = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${cleanSymbol}&type=1&format=json`;
    const searchRes = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 4000,
    });

    if (!searchRes.data || searchRes.data.length === 0) return null;

    // Find best match
    const match = searchRes.data.find((item: any) =>
      item.nse_scrip_code?.toUpperCase() === cleanSymbol.toUpperCase() ||
      item.sc_id?.toUpperCase() === cleanSymbol.toUpperCase()
    ) || searchRes.data[0];

    if (!match?.link_src) return null;

    // Fetch the stock page
    const pageUrl = `https://www.moneycontrol.com${match.link_src}`;
    const pageRes = await axios.get(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(pageRes.data);
    let price = NaN;

    // Method 1: NSE price element
    const priceText = $("#secStockVal, #nseMainPrice, .nseMainPrice .nsePrice, .pcstkspr .nseprice span, #nsemainprice .nsecp").first().text().replace(/,/g, "").trim();
    if (priceText) price = parseFloat(priceText);

    // Method 2: Broader search
    if (!isValidPrice(price)) {
      const raw = $(".inprice1 .nsecp, .nse_prc_adj .nsePrice").first().text().replace(/,/g, "").trim();
      if (raw) price = parseFloat(raw);
    }

    if (isValidPrice(price)) {
      return { symbol, price, change: 0, changePercent: 0, source: "Moneycontrol", fetchedAt: Date.now() };
    }
    return null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SCRAPER 5: NSE India official website
// ═══════════════════════════════════════════════════════════
const scrapePriceFromNSE = async (symbol: string): Promise<CachedPrice | null> => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
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
    const price = data?.priceInfo?.lastPrice || data?.priceInfo?.close;

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
// Uses Promise.any for speed, with sequential fallback
// ═══════════════════════════════════════════════════════════
const fetchPriceForSymbol = async (symbol: string): Promise<CachedPrice | null> => {
  // 1. Check fresh cache first
  const cached = getCachedPrice(symbol);
  if (cached) {
    console.log(`⚡ Cache hit: ${sanitizeSymbol(symbol)} = ₹${cached.price}`);
    return cached;
  }

  // 2. Race the top 2 scrapers (Screener + Google) for speed
  try {
    const raceResult = await Promise.any([
      scrapePriceFromScreener(symbol).then(r => { if (!r) throw new Error("no result"); return r; }),
      scrapePriceFromGoogleFinance(symbol).then(r => { if (!r) throw new Error("no result"); return r; }),
    ]);

    if (raceResult) {
      console.log(`✅ ${raceResult.source}: ${sanitizeSymbol(symbol)} = ₹${raceResult.price}`);
      setCachedPrice(symbol, raceResult);
      return raceResult;
    }
  } catch {
    // All primary scrapers failed, continue to fallbacks
  }

  // 3. Try secondary scrapers sequentially
  const fallbackScrapers = [scrapePriceFromYahooPage, scrapePriceFromMoneycontrol, scrapePriceFromNSE];
  for (const scraper of fallbackScrapers) {
    try {
      const result = await scraper(symbol);
      if (result) {
        console.log(`✅ ${result.source}: ${sanitizeSymbol(symbol)} = ₹${result.price}`);
        setCachedPrice(symbol, result);
        return result;
      }
    } catch {
      continue;
    }
  }

  // 4. Last resort: return stale cached price
  const stale = getStaleCachedPrice(symbol);
  if (stale) {
    console.warn(`⏰ Stale cache: ${sanitizeSymbol(symbol)} = ₹${stale.price} (from ${stale.source})`);
    return stale;
  }

  console.error(`🚫 ALL SOURCES FAILED for ${sanitizeSymbol(symbol)}`);
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

  // Motilal scrip code → actual NSE ticker mapping
  const SCRIP_MAPPING: Record<string, string> = {
    "TMPV": "TMCV",        // Tata Motors Passenger Vehicles scrip → Tata Motors Commercial Vehicles ticker
    "GVT&D": "GET&D",
    "TATACAP": "TATAINVEST",
    "ITCHOTELS": "ITC",
  };

  const mappedSymbols = symbols.map(s => {
    const base = s.replace(".NS", "").toUpperCase();
    if (SCRIP_MAPPING[base]) {
      return `${SCRIP_MAPPING[base]}.NS`;
    }
    return s.includes(".") ? s : `${s}.NS`;
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
