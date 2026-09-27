import fetch from "node-fetch";

async function run() {
  const res = await fetch("https://yscapital.com/assets/index-Bq3dsaO0.js");
  const text = await res.text();
  console.log("JS bundle length:", text.length);
  // Find image asset paths
  const matches = text.match(/\/assets\/[a-zA-Z0-9_\-]+\.(png|jpg|jpeg|svg|webp)/g);
  console.log("Assets:", [...new Set(matches)]);
}

run();
