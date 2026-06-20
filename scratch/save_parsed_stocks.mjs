import * as cheerio from "cheerio";
import fs from "fs";

async function run() {
  try {
    const filePath = "C:\\Users\\Mohd Aftab\\.gemini\\antigravity-ide\\brain\\298e4ac9-8b0e-4883-87c1-57b3f9c35893\\.system_generated\\steps\\56\\content.md";
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);
    
    const stocks = [];
    $("tr[data-row-company-id]").each((idx, el) => {
      const tds = $(el).find("td");
      if (tds.length >= 5) {
        const nameLink = $(tds[1]).find("a");
        const name = nameLink.text().trim();
        const href = nameLink.attr("href") || "";
        const tickerMatch = href.match(/\/company\/([^/]+)/);
        const ticker = tickerMatch ? tickerMatch[1] : "";
        
        const cmpVal = parseFloat($(tds[2]).text().trim());
        const peVal = parseFloat($(tds[3]).text().trim());
        const mcapVal = parseFloat($(tds[4]).text().trim());
        
        stocks.push({
          name,
          ticker,
          price: cmpVal,
          pe: peVal,
          mcap: mcapVal
        });
      }
    });
    
    fs.writeFileSync("scratch/parsed_ai_stocks.json", JSON.stringify(stocks, null, 2));
    console.log(`Saved ${stocks.length} stocks to scratch/parsed_ai_stocks.json`);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
