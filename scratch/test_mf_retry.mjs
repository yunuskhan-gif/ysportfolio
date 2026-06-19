async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} fetching ${url}...`);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (res.ok) {
        return await res.json();
      }
      console.log(`Failed with status: ${res.status}`);
    } catch (err) {
      console.log(`Attempt ${i + 1} error: ${err.message}`);
    }
    if (i < retries - 1) {
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

async function run() {
  try {
    const data = await fetchWithRetry("https://api.mfapi.in/mf/120713");
    console.log("Success! Meta:", data.meta);
    console.log("Data points count:", data.data?.length);
    if (data.data && data.data.length > 0) {
      console.log("Sample point:", data.data[0]);
    }
  } catch (err) {
    console.error("Final failure:", err.message);
  }
}

run();
