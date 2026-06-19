import axios from "axios";

async function testYahooMFChart() {
  try {
    const symbol = "0P00005UP6.BO";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    const result = res.data.chart?.result?.[0];
    if (result) {
      console.log("Data points count:", result.timestamp?.length);
      const timestamps = result.timestamp || [];
      const closePrices = result.indicators.quote[0].close || [];
      
      const last5 = timestamps.slice(-5).map((ts, i) => {
        const idx = timestamps.length - 5 + i;
        return {
          date: new Date(ts * 1000).toLocaleDateString("en-IN"),
          nav: closePrices[idx]
        };
      });
      console.log("Last 5 points:", last5);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testYahooMFChart();
