import { NextResponse } from "next/server";
import { getDB } from "@/lib/fii-dii/db";
import { scrapeAiStocks } from "@/lib/fii-dii/scheduler";

export async function GET(request: Request) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    let date = searchParams.get("date");

    if (!date) {
      const dates = Object.keys(db.reports || {}).sort();
      date = dates[dates.length - 1] || null;
    }

    if (!date || !db.reports[date]) {
      return NextResponse.json({ error: "No report found for specified date" }, { status: 404 });
    }

    // Clone report to merge live scraped prices dynamically
    const sectors = JSON.parse(JSON.stringify(db.reports[date]));

    try {
      const livePrices = await scrapeAiStocks();
      if (livePrices && livePrices.length > 0) {
        const priceMap = new Map(livePrices.map(s => [s.ticker.toUpperCase(), s]));
        for (const sec of sectors) {
          if (sec.stocks) {
            for (const stk of sec.stocks) {
              const match = priceMap.get(stk.ticker.toUpperCase());
              if (match) {
                stk.price = match.price;
                stk.mcap = match.mcap;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Report API] Failed to merge live stock rates:", err);
    }

    return NextResponse.json({ date, sectors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
