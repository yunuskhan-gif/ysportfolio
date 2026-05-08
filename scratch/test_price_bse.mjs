
import axios from 'axios';

async function testPrice() {
  const scId = "SJ01";
  try {
    const url = `https://priceapi.moneycontrol.com/pricefeed/bse/equitycash/${scId}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 3000,
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

testPrice();
