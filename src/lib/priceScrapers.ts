import axios from "axios";
import * as cheerio from "cheerio";

export interface CachedPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  source: string;
  fetchedAt: number;
}

export const sanitizeSymbol = (symbol: string) => symbol.replace(".NS", "").replace(".BO", "");

export const isValidPrice = (price: number): boolean => {
  return typeof price === "number" && !isNaN(price) && isFinite(price) && price > 0 && price < 10_000_000;
};

export async function scrapePriceFromGoogleFinance(symbol: string, exchange: string = "NSE"): Promise<CachedPrice | null> {
  try {
    let cleanSymbol = sanitizeSymbol(symbol);
    let exchanges = exchange === "NSE" ? ["NSE", "BOM", "MUTF_IN"] : [exchange];

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
          },
          timeout: 4000,
        });

        const $ = cheerio.load(response.data);
        const html = response.data as string;
        let price = NaN;

        for (const sel of [".YMlKec.fxKbKc", ".YMlS1d", ".AHmHk .fxKbKc", ".rPF6Lc", ".kf1m0"]) {
          const text = $(sel).first().text().replace(/,/g, "").replace(/[₹$]/g, "").trim();
          if (text) {
            price = parseFloat(text);
            if (isValidPrice(price)) break;
          }
        }

        if (!isValidPrice(price)) {
          const attr = $("[data-last-price]").attr("data-last-price");
          if (attr) price = parseFloat(attr);
        }

        if (!isValidPrice(price)) {
          const match = html.match(/data-last-price="([\d.]+)"/);
          if (match) price = parseFloat(match[1]);
        }

        if (isValidPrice(price)) {
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
        continue;
      }
    }
    return null;
  } catch (error: any) {
    return null;
  }
}

export async function fetchStockLTP(scId: string): Promise<{ ltp: number; change: number; changePercent: number } | null> {
  const exchanges = ["nse", "bse"];
  let bestData: { ltp: number; change: number; changePercent: number; ts: number } | null = null;

  for (const exch of exchanges) {
    try {
      const res = await axios.get(`https://priceapi.moneycontrol.com/pricefeed/${exch}/equitycash/${scId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 3000,
      });
      const d = res.data?.data;
      if (d?.pricecurrent) {
        const ltp = parseFloat(String(d.pricecurrent).replace(/,/g, ""));
        const ts = parseInt(d.lastupd_epoch || "0");
        
        if (isValidPrice(ltp) && (!bestData || ts > bestData.ts)) {
          bestData = {
            ltp,
            change: parseFloat(d.pricechange || "0"),
            changePercent: parseFloat(d.pricepercentchange || "0"),
            ts
          };
        }
      }
    } catch {
      continue;
    }
  }
  return bestData ? { ltp: bestData.ltp, change: bestData.change, changePercent: bestData.changePercent } : null;
}
