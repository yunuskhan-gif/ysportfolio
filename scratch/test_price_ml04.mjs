
import axios from 'axios';

async function testPrice() {
  const scId = "ML04";
  try {
    const url = `https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/${scId}`;
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
