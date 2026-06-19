import axios from "axios";

async function testMFSearch(name) {
  try {
    // Try clean name (first 3 words)
    const words = name.split(" ").slice(0, 3).join(" ");
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(words)}&newsCount=0`;
    console.log(`\nSearching for: "${words}"`);
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    const quotes = res.data.quotes || [];
    console.log(`Found ${quotes.length} quotes:`);
    quotes.slice(0, 5).forEach(q => {
      console.log(`- Symbol: ${q.symbol}, Name: ${q.shortname || q.longname}, Exchange: ${q.exchange}, Type: ${q.quoteType}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function run() {
  await testMFSearch("Nippon India Growth Fund - Direct Plan - Growth");
  await testMFSearch("SBI Bluechip Fund");
  await testMFSearch("ICICI Prudential Bluechip");
}
run();
