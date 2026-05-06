const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const query = 'Sundaram Large Cap';
  const searchUrl = `https://www.google.com/search?q=site:google.com/finance/quote+${encodeURIComponent(query)}`;
  console.log('Searching:', searchUrl);
  
  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    console.log('Links found:');
    $('a').each((i, el) => {
      const href = $(el).attr('href') || "";
      const match = href.match(/\/finance\/quote\/([A-Z0-9_]+):([A-Z0-9_]+)/i);
      if (match) {
        console.log(`- ${match[1]}:${match[2]}`);
      }
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
