import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const url = 'https://www.google.com/finance/quote/TATAMOTORS:NSE';
  console.log("Fetching", url);
  const response = await axios.get(url, { 
    headers: { 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    } 
  });
  const $ = cheerio.load(response.data);
  const priceStr = $('.YMlKec.fxKbKc').first().text();
  console.log('PRICE GF:', priceStr);
}
test();
