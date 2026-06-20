import fetch from "node-fetch";

async function testSparkMeta() {
  try {
    const symbols = "HDFCBANK.NS,ICICIBANK.NS";
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols}`;
    console.log("Fetching URL:", url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0"
      }
    });
    if (!res.ok) {
      console.error("HTTP error status:", res.status);
      return;
    }
    const data = await res.json();
    for (const r of data.spark.result) {
      console.log("Symbol:", r.symbol);
      const meta = r.response[0].meta;
      console.log("Meta properties:", {
        regularMarketPrice: meta.regularMarketPrice,
        previousClose: meta.previousClose,
        regularMarketTime: meta.regularMarketTime
      });
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testSparkMeta();
