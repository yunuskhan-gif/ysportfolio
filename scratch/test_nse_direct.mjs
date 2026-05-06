import axios from "axios";

async function testNSE(symbol) {
  try {
    console.log(`Testing NSE for ${symbol}...`);
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
      },
      timeout: 5000,
    });
    console.log("NSE Response Status:", response.status);
    console.log("Data keys:", Object.keys(response.data));
    console.log("Price Info:", response.data?.priceInfo);
  } catch (error) {
    console.error("NSE Failed:", error.response?.status || error.message);
  }
}

testNSE("TATAMOTORS");
