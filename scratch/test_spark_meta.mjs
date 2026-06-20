import fetch from "node-fetch";

async function testSparkMetaFull() {
  try {
    const symbol = "HDFCBANK.NS";
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbol}`;
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
    const meta = data.spark.result[0].response[0].meta;
    console.log("Full meta object keys:", Object.keys(meta));
    console.log("Full meta object details:");
    console.dir(meta, { depth: null });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testSparkMetaFull();
