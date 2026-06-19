import axios from "axios";

async function testYahoo() {
  try {
    const symbol = "TCS.NS";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`;
    console.log(`Fetching Yahoo: ${url}`);
    const res = await axios.get(url);
    const chart = res.data.chart.result[0];
    const timestamps = chart.timestamp;
    const quotes = chart.indicators.quote[0];
    const prices = quotes.close;
    const volumes = quotes.volume;
    
    console.log("Yahoo success! Sample point:");
    if (timestamps && timestamps.length > 0) {
      const idx = timestamps.length - 1;
      const date = new Date(timestamps[idx] * 1000).toLocaleDateString("en-IN");
      console.log(`Date: ${date}, Price: ${prices[idx]}, Volume: ${volumes[idx]}`);
    }
  } catch (err) {
    console.error("Yahoo error:", err.message);
  }
}

async function testMF() {
  try {
    const code = "120713"; // SBI Bluechip Direct Growth
    const url = `https://api.mfapi.in/mf/${code}`;
    console.log(`Fetching AMFI MF: ${url}`);
    const res = await axios.get(url);
    console.log("AMFI success! Scheme Name:", res.data.meta.scheme_name);
    console.log("Sample point:", res.data.data[0]);
  } catch (err) {
    console.error("AMFI error:", err.message);
  }
}

async function run() {
  await testYahoo();
  console.log("\n-------------------\n");
  await testMF();
}

run();
