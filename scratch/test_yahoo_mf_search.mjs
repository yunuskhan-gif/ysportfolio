import axios from "axios";

async function search(query) {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0`;
    console.log(`\nSearching Yahoo for: "${query}"`);
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    console.log("Quotes found:", res.data.quotes?.length);
    if (res.data.quotes && res.data.quotes.length > 0) {
      console.log("Matches:");
      res.data.quotes.slice(0, 5).forEach(q => {
        console.log(`- Symbol: ${q.symbol}, Name: ${q.shortname || q.longname}, Exchange: ${q.exchDisp || q.exchange}, Type: ${q.quoteType}`);
      });
    }
  } catch (err) {
    console.error("Yahoo Search error:", err.message);
  }
}

async function run() {
  await search("SBI Bluechip Fund");
  await search("HDFC Top 100");
  await search("Nippon India Growth");
  await search("ICICI Prudential");
}
run();
