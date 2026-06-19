import axios from "axios";

async function search(query) {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0`;
    console.log(`Searching: "${query}"`);
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const quotes = res.data.quotes || [];
    console.log(`Found: ${quotes.length} quotes`);
    quotes.slice(0, 3).forEach(q => {
      console.log(`- Symbol: ${q.symbol}, Name: ${q.shortname || q.longname}, Exchange: ${q.exchange}, Type: ${q.quoteType}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function run() {
  await search("SBI Mutual");
  await search("SBI Blue");
  await search("SBI Equity");
}
run();
