import axios from "axios";

// Test MF NAV price API
async function testMFNav(schemeCode, name) {
  try {
    // Try moneycontrol MF price API
    const url = `https://api.moneycontrol.com/mcapi/v1/mf/scheme-details?scId=${schemeCode}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    console.log(`  ✅ ${name}: ${JSON.stringify(res.data).slice(0, 300)}`);
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.response?.status || e.message}`);
  }
}

// Try mfapi.in (popular free MF NAV API)
async function testMfApiIn(query) {
  console.log(`\n=== mfapi.in search: "${query}" ===`);
  try {
    const res = await axios.get(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`, {
      timeout: 5000,
    });
    if (Array.isArray(res.data)) {
      console.log(`  ${res.data.length} results`);
      for (const mf of res.data.slice(0, 3)) {
        console.log(`  - ${mf.schemeName} (code: ${mf.schemeCode})`);
        // Get NAV for this scheme
        try {
          const navRes = await axios.get(`https://api.mfapi.in/mf/${mf.schemeCode}/latest`, { timeout: 5000 });
          const d = navRes.data?.data?.[0] || navRes.data;
          console.log(`    NAV: ₹${d?.nav || d?.data?.[0]?.nav} as of ${d?.date || d?.data?.[0]?.date}`);
        } catch (e2) {
          console.log(`    NAV fetch error: ${e2.message}`);
        }
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.response?.status || e.message}`);
  }
}

await testMfApiIn("SBI small cap");
await testMfApiIn("HDFC flexi cap");
await testMfApiIn("nippon nifty");
