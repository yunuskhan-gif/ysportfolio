import fetch from "node-fetch";

async function testChartLatestPrice() {
  try {
    const symbol = "HDFCBANK.NS";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d`;
    console.log("Fetching URL:", url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0"
      }
    });
    if (!res.ok) {
      console.error("HTTP error status:", res.status);
      const text = await res.text();
      console.error("Response:", text);
      return;
    }
    const data = await res.json();
    console.log("Success! Data:");
    const meta = data.chart.result[0].meta;
    console.log("Meta:", meta);
    console.log("Regular Market Price:", meta.regularMarketPrice);
    console.log("Chart Price Array Last Element:", data.chart.result[0].indicators.quote[0].close?.slice(-1)[0]);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testChartLatestPrice();
