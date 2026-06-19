async function run() {
  const url = "https://api.mfapi.in/mf/search?q=SBI%20Bluechip";
  try {
    console.log("Searching: " + url);
    const res = await fetch(url);
    const data = await res.json();
    console.log("Found:", data.slice(0, 5));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
