import axios from "axios";

async function testYahooSearch() {
  try {
    const query = "SBI Bluechip Fund Direct Growth";
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=0`;
    console.log(`Searching Yahoo: ${url}`);
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    console.log("Quotes found:", res.data.quotes?.length);
    if (res.data.quotes && res.data.quotes.length > 0) {
      console.log("First quote details:");
      console.log(res.data.quotes[0]);
    }
  } catch (err) {
    console.error("Yahoo Search error:", err.message);
  }
}

testYahooSearch();
