import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalConfigModel from "@/lib/models/MotilalConfig";
import MotilalScripModel from "@/lib/models/MotilalScrip";

const sanitizeSymbol = (symbol: string) => symbol.replace(".NS", "").replace(".BO", "");

const scrapePriceFromScreener = async (symbol: string) => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    const url = `https://www.screener.in/company/${cleanSymbol}/consolidated/`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);
    let price = NaN;

    $("#top-ratios li").each((_, element) => {
      const name = $(element).find(".name").text().replace(/\s+/g, " ").trim().toLowerCase();
      if (name === "current price") {
        const rawValue = $(element)
          .find(".value .number")
          .first()
          .text()
          .replace(/,/g, "")
          .trim();
        price = rawValue ? parseFloat(rawValue) : NaN;
      }
    });

    if (isNaN(price)) {
      const pageText = $("body").text().replace(/\s+/g, " ").trim();
      const currentPriceMatch = pageText.match(/Current Price\s*₹\s*([\d,]+(?:\.\d+)?)/i);
      price = currentPriceMatch ? parseFloat(currentPriceMatch[1].replace(/,/g, "")) : NaN;
    }

    if (isNaN(price)) {
      throw new Error(`Could not parse Screener current price for ${symbol}`);
    }

    return {
      symbol,
      price,
      change: 0,
      changePercent: 0,
      source: "Screener (Scraped)",
    };
  } catch (error: any) {
    console.warn(`Screener scrape failed for ${symbol}:`, error.message);
    return null;
  }
};

const scrapePriceFromGoogleFinance = async (symbol: string) => {
  try {
    const cleanSymbol = sanitizeSymbol(symbol);
    const url = `https://www.google.com/finance/quote/${cleanSymbol}:NSE`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      timeout: 5000,
    });
    const $ = cheerio.load(response.data);
    const priceStr = $(".YMlKec.fxKbKc").first().text().replace(/,/g, "").replace("₹", "").trim();
    const price = parseFloat(priceStr);
    
    if (!isNaN(price)) {
      return {
        symbol,
        price,
        change: 0,
        changePercent: 0,
        source: "Google Finance",
      };
    }
    return null;
  } catch (error: any) {
    console.warn(`Google Finance scrape failed for ${symbol}:`, error.message);
    return null;
  }
};

// Removed unreliable Yahoo scraper

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsStr = searchParams.get("symbols");

  if (!symbolsStr) {
    return NextResponse.json({ message: "Symbols are required" }, { status: 400 });
  }

  const symbols = symbolsStr.split(",");

  // Smart Mapping for Motilal-specific scrip names to actual listed symbols
  const SCRIP_MAPPING: Record<string, string> = {
    "TMPV": "TATAMOTORS",
    "TMCV": "TATAMOTORS",
    "GVT&D": "GET&D",
    "TATACAP": "TATAINVEST", // Tata Investment Corp is often used as a proxy or it might be unlisted
    "ITCHOTELS": "ITC",      // Currently ITC is the parent
  };

  const mappedSymbols = symbols.map(s => {
    const base = s.replace(".NS", "").toUpperCase();
    if (SCRIP_MAPPING[base]) {
      return `${SCRIP_MAPPING[base]}.NS`;
    }
    return s.includes(".") ? s : `${s}.NS`;
  });

  try {
    let validResults: any[] = [];
    
    // 1. Try Yahoo Finance API (Primary)
    try {
      const mappedSymbolsStr = mappedSymbols.join(',').toUpperCase();
      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${mappedSymbolsStr}`;
      const yahooRes = await axios.get(yahooUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });

      const quotes = yahooRes.data?.quoteResponse?.result;
      if (quotes && quotes.length > 0) {
        validResults = quotes
          .map((quote: any) => ({
            symbol: quote.symbol.toUpperCase(),
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            source: "Yahoo API",
          }))
          .filter((quote: any) => typeof quote.price === "number" && !isNaN(quote.price));
      }
    } catch (err: any) {
      console.warn("Yahoo API failed:", err.message);
    }

    // 2. Supplement missing symbols with Google Finance & Screener
    const fetchedSymbols = new Set(validResults.map(p => p.symbol.toUpperCase()));
    const missingSymbols = mappedSymbols.filter(s => !fetchedSymbols.has(s.toUpperCase()));

    if (missingSymbols.length > 0) {
      const fallbackResults = await Promise.all(
        missingSymbols.map(async (symbol) => {
          let result = await scrapePriceFromGoogleFinance(symbol);
          if (!result) {
            result = await scrapePriceFromScreener(symbol);
          }
          return result;
        })
      );
      
      fallbackResults.forEach(r => {
        if (r) validResults.push(r);
      });
    }

    // Map results back to original requested symbols
    const finalResults = symbols.map(originalSymbol => {
      const base = originalSymbol.replace(".NS", "").toUpperCase();
      const lookupSymbol = SCRIP_MAPPING[base] ? `${SCRIP_MAPPING[base]}.NS` : (originalSymbol.includes(".") ? originalSymbol : `${originalSymbol}.NS`);
      
      const found = validResults.find(r => r.symbol.toUpperCase() === lookupSymbol.toUpperCase() || r.symbol.toUpperCase() === lookupSymbol.replace(".NS", "").toUpperCase());
      
      if (found) {
        return {
          ...found,
          symbol: originalSymbol
        };
      }
      return null;
    }).filter(r => r !== null);

    if (finalResults.length === 0) {
      return NextResponse.json({ message: "All price sources failed." }, { status: 503 });
    }

    return NextResponse.json(finalResults);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal error", error: error.message }, { status: 500 });
  }
}
