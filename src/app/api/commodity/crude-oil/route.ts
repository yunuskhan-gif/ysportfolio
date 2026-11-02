import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface MarketItem {
  name: string;
  link: string;
  actual: string;
  chg: string;
  pctChg: string;
}

interface CommodityResponse {
  timestamp: string;
  sections: {
    Commodity: MarketItem[];
    Index: MarketItem[];
    Share: MarketItem[];
    FX: MarketItem[];
    Crypto: MarketItem[];
    Bond: MarketItem[];
  };
}

let cachedData: CommodityResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 1000; // 1 minute cache

export async function GET() {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json(cachedData);
  }

  try {
    const res = await fetch("https://tradingeconomics.com/commodity/crude-oil", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`TradingEconomics returned status ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const sectionKeys = ["Commodity", "Index", "Share", "FX", "Crypto", "Bond"] as const;
    const sections: Record<string, MarketItem[]> = {
      Commodity: [],
      Index: [],
      Share: [],
      FX: [],
      Crypto: [],
      Bond: [],
    };

    sectionKeys.forEach((sec) => {
      const pane = $(`#${sec}`);
      pane.find("table tbody tr").each((_, tr) => {
        const tds = $(tr).find("td");
        if (tds.length >= 4) {
          const name = $(tds[0]).text().trim();
          const href = $(tds[0]).find("a").attr("href") || "";
          const actual = $(tds[1]).text().trim();
          const chg = $(tds[2]).text().trim();
          const pctChg = $(tds[3]).text().trim();

          if (name && actual) {
            sections[sec].push({
              name,
              link: href.startsWith("http")
                ? href
                : `https://tradingeconomics.com${href}`,
              actual,
              chg,
              pctChg,
            });
          }
        }
      });
    });

    const result: CommodityResponse = {
      timestamp: new Date().toISOString(),
      sections: sections as CommodityResponse["sections"],
    };

    cachedData = result;
    lastFetchTime = now;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error scraping TradingEconomics crude-oil data:", error);

    // If cache exists even if expired, return it as fallback
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      { error: "Failed to fetch market data", message: error.message },
      { status: 500 }
    );
  }
}

