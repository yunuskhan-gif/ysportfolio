import axios from "axios";

async function testMF() {
  try {
    const code = "120713"; // SBI Bluechip Direct Growth
    const url = `https://api.mfapi.in/mf/${code}`;
    console.log(`Fetching AMFI MF: ${url}`);
    const res = await axios.get(url);
    console.log("Response keys:", Object.keys(res.data));
    if (res.data.meta) {
      console.log("Meta:", res.data.meta);
    }
    if (res.data.data) {
      console.log("Data length:", res.data.data.length);
      console.log("First 3 data points:", res.data.data.slice(0, 3));
    }
  } catch (err) {
    console.error("AMFI error:", err.message);
  }
}

testMF();
