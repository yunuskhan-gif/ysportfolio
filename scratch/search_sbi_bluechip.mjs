async function searchMF(query) {
  const url = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`;
  for (let i = 0; i < 3; i++) {
    try {
      console.log(`Searching: ${url} (Attempt ${i+1})`);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log("Success!");
        console.log(data.slice(0, 10));
        return;
      }
    } catch (err) {
      console.log("Error:", err.message);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
searchMF("SBI Bluechip");
