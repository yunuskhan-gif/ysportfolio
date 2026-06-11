const axios = require('axios');
axios.get('https://www.google.com/finance/quote/TCS:NSE').then(res => {
   const html = res.data;
   const m = html.match(/data-last-price="([\d.]+)"/);
   console.log('Google:', m ? m[1] : 'not found');
});
axios.get('https://www.screener.in/company/TCS/').then(res => {
   const html = res.data;
   const m = html.match(/Current Price\s*₹\s*([\d,]+(?:\.\d+)?)/i);
   console.log('Screener:', m ? m[1] : 'not found');
});
