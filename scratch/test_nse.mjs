
import axios from 'axios';

async function testNSE() {
  const symbol = "SPICEJET";
  try {
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.nseindia.com/",
      },
      timeout: 5000,
    });
    console.log(JSON.stringify(res.data?.priceInfo, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

testNSE();
