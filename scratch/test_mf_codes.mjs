async function fetchMF(code) {
  const url = `https://api.mfapi.in/mf/${code}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const data = await res.json();
      console.log(`Code ${code} Success:`, data.meta.scheme_name || "EMPTY NAME");
      console.log(`Data points:`, data.data?.length || 0);
      if (data.data?.length > 0) {
        console.log(`Sample point:`, data.data[0]);
      }
      return true;
    } else {
      console.log(`Code ${code} Failed with status: ${res.status}`);
    }
  } catch (err) {
    console.log(`Code ${code} Error: ${err.message}`);
  }
  return false;
}

async function run() {
  const codes = ["119551", "120586", "102885", "120713"];
  for (const c of codes) {
    await fetchMF(c);
    await new Promise(r => setTimeout(r, 500));
  }
}
run();
