import fs from "fs";
import path from "path";

const REPO_DB_FILE = path.join(process.cwd(), "data_db.json");
const isVercel = process.env.VERCEL === "1" || process.env.NOW_BUILDER !== undefined;
const DB_FILE = isVercel ? path.join("/tmp", "data_db.json") : REPO_DB_FILE;

// Sector list with realistic base AUC (Assets Under Custody) in Crores Rs
const SECTORS_BASE = [
  { name: "Financial Services", baseAuc: 420000 },
  { name: "Information Technology", baseAuc: 280000 },
  { name: "Oil, Gas & Consumable Fuels", baseAuc: 190000 },
  { name: "FMCG", baseAuc: 150000 },
  { name: "Healthcare", baseAuc: 110000 },
  { name: "Automobile & Auto Components", baseAuc: 95000 },
  { name: "Power", baseAuc: 75000 },
  { name: "Telecommunication", baseAuc: 65000 },
  { name: "Capital Goods", baseAuc: 55000 },
  { name: "Metals & Mining", baseAuc: 50000 },
  { name: "Chemicals", baseAuc: 40000 },
  { name: "Construction Materials", baseAuc: 35000 },
  { name: "Consumer Services", baseAuc: 30000 }
];

// Mapping of NSE Sectors to their prominent stocks
export const SECTOR_STOCKS: Record<
  string,
  { name: string; ticker: string; price: number; mcap: number; fiiWeight: number; diiWeight: number }[]
> = {
  "Financial Services": [
    { name: "U. Y. Fincorp", ticker: "UYFINCORP", price: 14.51, mcap: 276.04, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "F Mec Intl. Fin.", ticker: "539552", price: 14.06, mcap: 68.76, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "GDL Leasing", ticker: "530855", price: 77.61, mcap: 38.88, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "Akme Fintrade", ticker: "AFIL", price: 10.91, mcap: 465.58, fiiWeight: 0.20, diiWeight: 0.20 },
    { name: "Manba Finance", ticker: "MANBA", price: 132.35, mcap: 664.92, fiiWeight: 0.25, diiWeight: 0.25 }
  ],
  "Information Technology": [
    { name: "eMudhra", ticker: "EMUDHRA", price: 459.85, mcap: 3808.1, fiiWeight: 0.40, diiWeight: 0.40 },
    { name: "Maxposure", ticker: "MAXPOSURE", price: 34.45, mcap: 78.34, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "Brightcom Group", ticker: "BCG", price: 10.29, mcap: 2076.44, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "Zaggle Prepaid", ticker: "ZAGGLE", price: 213.17, mcap: 2866.25, fiiWeight: 0.20, diiWeight: 0.20 }
  ],
  "Oil, Gas & Consumable Fuels": [
    { name: "Asian Energy", ticker: "ASIANENE", price: 367.25, mcap: 1785.24, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "FMCG": [
    { name: "Nikki Glob.Fin.", ticker: "531272", price: 21.5, mcap: 7.35, fiiWeight: 0.5, diiWeight: 0.5 },
    { name: "Cont. Securities", ticker: "538868", price: 12.74, mcap: 38.8, fiiWeight: 0.5, diiWeight: 0.5 }
  ],
  "Healthcare": [
    { name: "Gujarat Kidney", ticker: "GKSL", price: 128.42, mcap: 1012.51, fiiWeight: 0.4, diiWeight: 0.4 },
    { name: "Yatharth Hospit.", ticker: "YATHARTH", price: 839.75, mcap: 8091.36, fiiWeight: 0.6, diiWeight: 0.6 }
  ],
  "Automobile & Auto Components": [
    { name: "Ashika Credit", ticker: "ASHIKA", price: 398.7, mcap: 2939.44, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "Power": [
    { name: "JOJO", ticker: "531910", price: 214.95, mcap: 741.16, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "Telecommunication": [
    { name: "CitiPort Fin.", ticker: "531235", price: 36.88, mcap: 11.43, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "Capital Goods": [
    { name: "Committed Cargo", ticker: "COMMITTED", price: 298.4, mcap: 345.39, fiiWeight: 0.5, diiWeight: 0.5 },
    { name: "ITCONS E-Soluti.", ticker: "543806", price: 309, mcap: 278.36, fiiWeight: 0.5, diiWeight: 0.5 }
  ],
  "Metals & Mining": [
    { name: "Enbee Trade", ticker: "512441", price: 0.31, mcap: 54.94, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "Chemicals": [
    { name: "Mangal Credit", ticker: "MANCREDIT", price: 217.77, mcap: 459.8, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "Construction Materials": [
    { name: "Gowra Leasing", ticker: "530709", price: 134.96, mcap: 104.56, fiiWeight: 1.0, diiWeight: 1.0 }
  ],
  "Consumer Services": [
    { name: "Travels & Rent.", ticker: "544242", price: 10.38, mcap: 22.17, fiiWeight: 0.4, diiWeight: 0.4 },
    { name: "Pansari Develop.", ticker: "PANSARI", price: 301.25, mcap: 525.58, fiiWeight: 0.6, diiWeight: 0.6 }
  ]
};

// Generates detailed stock list breakdown with shares & values
export function getStocksForSector(sectorName: string, fiiAuc: number, diiAuc: number, priceWalkFactor: number = 1.0) {
  const stockTemplates = SECTOR_STOCKS[sectorName] || [];
  return stockTemplates.map(s => {
    const walkedPrice = parseFloat((s.price * priceWalkFactor).toFixed(2));
    const walkedMcap = parseFloat((s.mcap * priceWalkFactor).toFixed(2));
    const fiiValue = parseFloat((fiiAuc * s.fiiWeight).toFixed(2));
    const diiValue = parseFloat((diiAuc * s.diiWeight).toFixed(2));
    
    // Shares (in Crores) = Value (in Crores) / Price (in Rupees)
    const fiiShares = parseFloat((fiiValue / walkedPrice).toFixed(4));
    const diiShares = parseFloat((diiValue / walkedPrice).toFixed(4));
    
    return {
      stockName: s.name,
      ticker: s.ticker,
      price: walkedPrice,
      mcap: walkedMcap,
      fiiShares,
      fiiValue,
      diiShares,
      diiValue
    };
  });
}

export function calculateNextFortnight(dateStr: string): string {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-indexed
  const day = parseInt(parts[2], 10);

  if (day === 15) {
    // End of the month
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  } else {
    // 15th of the next month
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    return `${nextYear}-${String(nextMonth).padStart(2, "0")}-15`;
  }
}

// Generate simulated historical reports using a random-walk algorithm
export function generateHistoricalDatabase() {
  console.log("[DB] Generating initial historical database with simulated FII/DII data...");
  const db: any = {
    users: {},
    sessions: {},
    watchlists: {},
    schedulerInfo: {
      frequency: "fortnightly",
      cronExpression: "0 0 1,15 * *",
      lastRun: null,
      lastStatus: "idle",
      lastError: null,
      nextRun: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      runCount: 0,
      logs: []
    },
    reports: {}
  };

  // 13 fortnights of historical data
  const dates = [
    "2025-12-15",
    "2025-12-31",
    "2026-01-15",
    "2026-01-31",
    "2026-02-15",
    "2026-02-28",
    "2026-03-15",
    "2026-03-31",
    "2026-04-15",
    "2026-04-30",
    "2026-05-15",
    "2026-05-31",
    "2026-06-15"
  ];

  // Base reports setup
  let currentSectors = SECTORS_BASE.map(s => {
    const fiiAuc = s.baseAuc;
    const diiAuc = parseFloat((s.baseAuc * 0.70).toFixed(2)); // DII starts at 70% of FII AUC
    const stocks = getStocksForSector(s.name, fiiAuc, diiAuc, 1.0);
    return {
      sectorName: s.name,
      auc: fiiAuc, // backward compatibility
      netInvestment: 0,
      percentageChange: 0,
      fiiAuc,
      fiiNetInvestment: 0,
      fiiPercentageChange: 0,
      diiAuc,
      diiNetInvestment: 0,
      diiPercentageChange: 0,
      stocks
    };
  });

  // Initial record
  db.reports[dates[0]] = JSON.parse(JSON.stringify(currentSectors));

  for (let i = 1; i < dates.length; i++) {
    const prevDate = dates[i - 1];
    const prevReport = db.reports[prevDate];
    const newReport: any[] = [];

    // Let's do a small stock price random walk
    const priceWalkFactor = 1 + (-0.02 + Math.random() * 0.05);

    for (const prevSec of prevReport) {
      // FII Random walk: percentage change between -3% and +3.5%
      const randPctFii = -3 + Math.random() * 6.5;
      const newFiiAuc = Math.max(1000, prevSec.fiiAuc * (1 + randPctFii / 100));
      const netInvFii = newFiiAuc - prevSec.fiiAuc;
      
      // DII Random walk: percentage change between -2.5% and +3%
      const randPctDii = -2.5 + Math.random() * 5.5;
      const newDiiAuc = Math.max(1000, prevSec.diiAuc * (1 + randPctDii / 100));
      const netInvDii = newDiiAuc - prevSec.diiAuc;
      
      const stocks = getStocksForSector(prevSec.sectorName, newFiiAuc, newDiiAuc, priceWalkFactor);

      newReport.push({
        sectorName: prevSec.sectorName,
        auc: parseFloat(newFiiAuc.toFixed(2)),
        netInvestment: parseFloat(netInvFii.toFixed(2)),
        percentageChange: parseFloat(randPctFii.toFixed(2)),
        
        fiiAuc: parseFloat(newFiiAuc.toFixed(2)),
        fiiNetInvestment: parseFloat(netInvFii.toFixed(2)),
        fiiPercentageChange: parseFloat(randPctFii.toFixed(2)),
        
        diiAuc: parseFloat(newDiiAuc.toFixed(2)),
        diiNetInvestment: parseFloat(netInvDii.toFixed(2)),
        diiPercentageChange: parseFloat(randPctDii.toFixed(2)),
        stocks
      });
    }

    db.reports[dates[i]] = newReport;
  }

  return db;
}

// Retrieve DB. Creates if not present.
export function getDB() {
  let db: any;

  if (isVercel && !fs.existsSync(DB_FILE)) {
    try {
      if (fs.existsSync(REPO_DB_FILE)) {
        console.log("[DB] Copying pre-built database to /tmp for Vercel write access...");
        fs.copyFileSync(REPO_DB_FILE, DB_FILE);
      }
    } catch (err) {
      console.error("[DB] Failed to copy pre-built database to /tmp", err);
    }
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("Failed to parse database, generating new", e);
    }
  }
  if (!db) {
    db = generateHistoricalDatabase();
  }
  
  // Ensure basic schema structures exist
  if (!db.users) db.users = {};
  if (!db.sessions) db.sessions = {};
  if (!db.watchlists) db.watchlists = {};
  if (!db.reports) db.reports = {};
  if (!db.schedulerInfo) {
    db.schedulerInfo = {
      frequency: "fortnightly",
      cronExpression: "0 0 1,15 * *",
      lastRun: null,
      lastStatus: "idle",
      lastError: null,
      nextRun: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      runCount: 0,
      logs: []
    };
  }

  // Schema Upgrade: check if any reports lack fiiAuc or use old stocks. If so, regenerate.
  const dates = Object.keys(db.reports);
  let needsRegen = false;
  if (dates.length > 0) {
    const firstReport = db.reports[dates[0]];
    if (firstReport && firstReport.length > 0) {
      const hasOldStocks = firstReport[0].stocks && firstReport[0].stocks.some((stk: any) => stk.ticker === "HDFCBANK");
      const lacksMcap = firstReport[0].stocks && firstReport[0].stocks.some((stk: any) => stk.mcap === undefined);
      if (hasOldStocks || lacksMcap || firstReport[0].fiiAuc === undefined) {
        needsRegen = true;
      }
    }
  } else {
    needsRegen = true;
  }

  if (needsRegen) {
    console.log("[DB] Upgrading existing schema to support dual FII/DII tracking...");
    const newDb = generateHistoricalDatabase();
    // Preserve existing users, sessions, watchlists
    newDb.users = db.users || {};
    newDb.sessions = db.sessions || {};
    newDb.watchlists = db.watchlists || {};
    newDb.schedulerInfo = db.schedulerInfo || newDb.schedulerInfo;
    db = newDb;
  }

  // Auto-initialize default user and session to bypass login/register gate
  if (!db.users["default_user"]) {
    db.users["default_user"] = {
      id: "default_user",
      username: "Admin",
      passwordHash: "",
      salt: "",
      createdAt: new Date().toISOString()
    };
  }
  db.sessions["default_token"] = "default_user";
  if (!db.watchlists["default_user"]) {
    db.watchlists["default_user"] = [];
  }
  // Persist enhancements if we had to initialize them
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Failed to write database update", err);
  }
  return db;
}

export function saveDB(db: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB] Failed to save database", err);
  }
}
