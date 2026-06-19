async function test() {
  const urls = [
    "https://api.mfapi.in/mf/120713",
    "http://api.mfapi.in/mf/120713"
  ];
  
  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}`);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });
      clearTimeout(id);
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        console.log("Success! Data points:", json.data?.length);
        break;
      }
    } catch (err) {
      console.error("Error:", err.name === "AbortError" ? "Timeout" : err.message);
    }
  }
}

test();
