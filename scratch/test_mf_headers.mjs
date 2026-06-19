import axios from "axios";

async function test() {
  try {
    const res = await axios.get("https://api.mfapi.in/mf/120713", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      },
      timeout: 5000
    });
    console.log("Success! Meta:", res.data.meta);
    console.log("First point:", res.data.data?.[0]);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
