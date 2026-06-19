async function searchMF(query) {
  const url = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      console.log(`Query "${query}" found ${data.length} results.`);
      const matches = data.filter(item => item.schemeName.toLowerCase().includes("blue"));
      console.log("Blue matches:", matches.slice(0, 10));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
searchMF("SBI");
