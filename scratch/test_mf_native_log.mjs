async function test() {
  const url = "https://api.mfapi.in/mf/120713";
  try {
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const json = await res.json();
    console.log("Keys:", Object.keys(json));
    if (json.meta) console.log("Meta:", json.meta);
    if (json.data) {
      console.log("Data length:", json.data.length);
      console.log("First 3 points:", json.data.slice(0, 3));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
