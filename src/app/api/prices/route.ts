import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

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

const scrapePriceFromYahooPage = async (symbol: string) => {
  try {
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 8000,
    });

    const html = response.data as string;
    const priceMatch = html.match(/"regularMarketPrice"\s*:\s*\{"raw"\s*:\s*([0-9.]+)/);
    const changeMatch = html.match(/"regularMarketChange"\s*:\s*\{"raw"\s*:\s*([-0-9.]+)/);
    const changePercentMatch = html.match(/"regularMarketChangePercent"\s*:\s*\{"raw"\s*:\s*([-0-9.]+)/);

    const price = priceMatch ? parseFloat(priceMatch[1]) : NaN;
    const change = changeMatch ? parseFloat(changeMatch[1]) : 0;
    const changePercent = changePercentMatch ? parseFloat(changePercentMatch[1]) : 0;

    if (isNaN(price)) {
      throw new Error(`Could not parse Yahoo Finance HTML for ${symbol}`);
    }

    return {
      symbol,
      price,
      change: isNaN(change) ? 0 : change,
      changePercent: isNaN(changePercent) ? 0 : changePercent,
      source: "Yahoo Finance (Scraped)",
    };
  } catch (error: any) {
    console.warn(`Yahoo HTML scrape failed for ${symbol}:`, error.message);
    return null;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsStr = searchParams.get("symbols");

  if (!symbolsStr) {
    return NextResponse.json({ message: "Symbols are required" }, { status: 400 });
  }

  const symbols = symbolsStr.split(",");

  try {
    // 1. Try Yahoo Finance API first
    try {
      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`;
      const yahooRes = await axios.get(yahooUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 5000,
      });

      const quotes = yahooRes.data?.quoteResponse?.result;
      if (quotes && quotes.length > 0) {
        const prices = quotes
          .map((quote: any) => ({
            symbol: quote.symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            source: "Yahoo API",
          }))
          .filter((quote: any) => typeof quote.price === "number" && !isNaN(quote.price));

        if (prices.length === symbols.length) {
          return NextResponse.json(prices);
        }

        // Handle missing symbols
        const missingSymbols = symbols.filter(
          (symbol) => !prices.some((price: any) => price.symbol === symbol)
        );
        const screenerMissing = await Promise.all(
          missingSymbols.map((symbol) => scrapePriceFromScreener(symbol))
        );
        const stillMissing = missingSymbols.filter(
          (symbol) => !screenerMissing.some((result) => result?.symbol === symbol)
        );
        const yahooMissing = await Promise.all(
          stillMissing.map((symbol) => scrapePriceFromYahooPage(symbol))
        );

        const combined = [
          ...prices,
          ...screenerMissing.filter((result) => result !== null),
          ...yahooMissing.filter((result) => result !== null),
        ];

        return NextResponse.json(combined);
      }
    } catch (err: any) {
      console.warn("Yahoo API failed, falling back to scraping...", err.message);
    }

    // 2. Fallback: Scrape Screener and Yahoo
    const screenerResults = await Promise.all(symbols.map((symbol) => scrapePriceFromScreener(symbol)));
    const validScreenerResults = screenerResults.filter((result) => result !== null);

    if (validScreenerResults.length === symbols.length) {
      return NextResponse.json(validScreenerResults);
    }

    const missingSymbols = symbols.filter(
      (symbol) => !validScreenerResults.some((result) => result?.symbol === symbol)
    );
    const yahooScrapeResults = await Promise.all(
      missingSymbols.map((symbol) => scrapePriceFromYahooPage(symbol))
    );
    const validResults = [
      ...validScreenerResults,
      ...yahooScrapeResults.filter((result) => result !== null),
    ];

    if (validResults.length === 0) {
      return NextResponse.json(
        { message: "All price sources failed." },
        { status: 503 }
      );
    }

    return NextResponse.json(validResults);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
