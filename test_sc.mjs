import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  for (const symbol of ['TMPV', 'TMCV']) {
    const url = `https://www.screener.in/company/${symbol}/`;
    console.log("Fetching", url);
    try {
      const response = await axios.get(url, { 
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        } 
      });
      const $ = cheerio.load(response.data);
      const priceStr = $('#top-ratios li:contains("Current Price") .number').text() || $('.top-ratios li:contains("Current Price") .number').text();
      console.log('PRICE:', priceStr);
    } catch(e) {
      console.error("ERR:", e.message);
    }
  }
}
test();
