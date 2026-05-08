
async function testSearch() {
  const query = "SpiceJet";
  const url = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?classic=true&query=${encodeURIComponent(query)}&type=1&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const data = await res.json();
  console.log("Results count:", data.length);
  if (data.length > 0) {
    console.log("First Result:", JSON.stringify(data[0], null, 2));
  }
}

testSearch();
