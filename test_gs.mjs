import axios from 'axios';

async function test() {
  const symbol = "TMPV";
  const queries = [`${symbol} share price`, `${symbol} eq share price`, `NSE ${symbol}`];
  
  for (const q of queries) {
    console.log("Testing:", q);
    const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    const response = await axios.get(url, { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9" 
      } 
    });
    const html = response.data;
    
    // Attempt 1
    let m = html.match(/<span[^>]*jsname="vWLAgc"[^>]*>([^<]+)<\/span>/);
    if (!m) m = html.match(/<span[^>]*jsname="L3mUVe"[^>]*>([^<]+)<\/span>/);
    
    // General match for Indian Rupees symbol followed by numbers and decimals
    if (!m) {
        m = html.match(/₹\s*([0-9,]+\.[0-9]+)/);
    }
    
    if (m) {
       console.log("Found:", m[1]);
    } else {
       console.log("Not found in", q);
    }
  }
}
test();
