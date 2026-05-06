const axios = require('axios');
const cheerio = require('cheerio');

async function testSearch() {
  const query = 'Sundaram Large Cap';
  const url = `https://www.google.com/finance/beta/search?q=${encodeURIComponent(query)}`;
  
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    console.log('HTML Length:', res.data.length);
    const $ = cheerio.load(res.data);
    
    // Look for script tags containing WIZ_global_data or similar
    $('script').each((i, el) => {
      const text = $(el).html();
      if (text.includes('WIZ_global_data')) {
        console.log(`Found WIZ_global_data in script tag ${i}`);
        // Look for typical search result patterns
        const match = text.match(/\["([^"]+)",\s*\[\[\s*"([^"]+)",\s*"([^"]+)"/);
        if (match) {
          console.log('Possible match:', match[1], match[2], match[3]);
        }
      }
    });

    // Check for the role="option" elements if they are server-side rendered
    const options = $('[role="option"]');
    console.log('Number of role="option" elements:', options.length);
    options.each((i, el) => {
      console.log(`Option ${i}:`, $(el).attr('data-fh-id'), $(el).text().trim().substring(0, 50));
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSearch();
