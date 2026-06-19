import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data_db.json");

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
  { name: string; ticker: string; price: number; fiiWeight: number; diiWeight: number }[]
> = {
  "Financial Services": [
    { name: "HDFC Bank Ltd", ticker: "HDFCBANK", price: 1500, fiiWeight: 0.35, diiWeight: 0.30 },
    { name: "ICICI Bank Ltd", ticker: "ICICIBANK", price: 1000, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "State Bank of India", ticker: "SBIN", price: 750, fiiWeight: 0.18, diiWeight: 0.20 },
    { name: "Kotak Mahindra Bank Ltd", ticker: "KOTAKBANK", price: 1800, fiiWeight: 0.12, diiWeight: 0.15 },
    { name: "Axis Bank Ltd", ticker: "AXISBANK", price: 1100, fiiWeight: 0.10, diiWeight: 0.10 }
  ],
  "Information Technology": [
    { name: "Tata Consultancy Services Ltd", ticker: "TCS", price: 3800, fiiWeight: 0.35, diiWeight: 0.30 },
    { name: "Infosys Ltd", ticker: "INFY", price: 1500, fiiWeight: 0.30, diiWeight: 0.30 },
    { name: "HCL Technologies Ltd", ticker: "HCLTECH", price: 1400, fiiWeight: 0.15, diiWeight: 0.20 },
    { name: "Wipro Ltd", ticker: "WIPRO", price: 480, fiiWeight: 0.12, diiWeight: 0.10 },
    { name: "Tech Mahindra Ltd", ticker: "TECHM", price: 1250, fiiWeight: 0.08, diiWeight: 0.10 }
  ],
  "Oil, Gas & Consumable Fuels": [
    { name: "Reliance Industries Ltd", ticker: "RELIANCE", price: 2900, fiiWeight: 0.55, diiWeight: 0.50 },
    { name: "Oil & Natural Gas Corporation Ltd", ticker: "ONGC", price: 270, fiiWeight: 0.18, diiWeight: 0.20 },
    { name: "Bharat Petroleum Corporation Ltd", ticker: "BPCL", price: 600, fiiWeight: 0.10, diiWeight: 0.12 },
    { name: "Indian Oil Corporation Ltd", ticker: "IOC", price: 170, fiiWeight: 0.09, diiWeight: 0.10 },
    { name: "Hindustan Petroleum Corporation Ltd", ticker: "HPCL", price: 500, fiiWeight: 0.08, diiWeight: 0.08 }
  ],
  "FMCG": [
    { name: "ITC Ltd", ticker: "ITC", price: 430, fiiWeight: 0.40, diiWeight: 0.35 },
    { name: "Hindustan Unilever Ltd", ticker: "HINDUNILVR", price: 2400, fiiWeight: 0.30, diiWeight: 0.35 },
    { name: "Nestle India Ltd", ticker: "NESTLEIND", price: 2500, fiiWeight: 0.12, diiWeight: 0.12 },
    { name: "Britannia Industries Ltd", ticker: "BRITANNIA", price: 5000, fiiWeight: 0.10, diiWeight: 0.10 },
    { name: "Tata Consumer Products Ltd", ticker: "TATACONSUM", price: 1100, fiiWeight: 0.08, diiWeight: 0.08 }
  ],
  "Healthcare": [
    { name: "Sun Pharmaceutical Industries Ltd", ticker: "SUNPHARMA", price: 1550, fiiWeight: 0.35, diiWeight: 0.30 },
    { name: "Cipla Ltd", ticker: "CIPLA", price: 1400, fiiWeight: 0.22, diiWeight: 0.25 },
    { name: "Dr. Reddy's Laboratories Ltd", ticker: "DRREDDY", price: 6100, fiiWeight: 0.18, diiWeight: 0.20 },
    { name: "Apollo Hospitals Enterprise Ltd", ticker: "APOLLOHOSP", price: 6200, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "Divi's Laboratories Ltd", ticker: "DIVISLAB", price: 3800, fiiWeight: 0.10, diiWeight: 0.10 }
  ],
  "Automobile & Auto Components": [
    { name: "Tata Motors Ltd", ticker: "TATAMOTORS", price: 950, fiiWeight: 0.30, diiWeight: 0.30 },
    { name: "Mahindra & Mahindra Ltd", ticker: "M&M", price: 2100, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "Maruti Suzuki India Ltd", ticker: "MARUTI", price: 12500, fiiWeight: 0.20, diiWeight: 0.20 },
    { name: "Bajaj Auto Ltd", ticker: "BAJAJ-AUTO", price: 9000, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "Eicher Motors Ltd", ticker: "EICHERMOT", price: 4600, fiiWeight: 0.10, diiWeight: 0.10 }
  ],
  "Power": [
    { name: "NTPC Ltd", ticker: "NTPC", price: 360, fiiWeight: 0.40, diiWeight: 0.35 },
    { name: "Power Grid Corporation of India Ltd", ticker: "POWERGRID", price: 280, fiiWeight: 0.30, diiWeight: 0.35 },
    { name: "Adani Power Ltd", ticker: "ADANIPOWER", price: 620, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "Tata Power Co Ltd", ticker: "TATAPOWER", price: 430, fiiWeight: 0.15, diiWeight: 0.15 }
  ],
  "Telecommunication": [
    { name: "Bharti Airtel Ltd", ticker: "BHARTIARTL", price: 1250, fiiWeight: 0.70, diiWeight: 0.65 },
    { name: "Vodafone Idea Ltd", ticker: "IDEA", price: 13, fiiWeight: 0.20, diiWeight: 0.20 },
    { name: "Tata Communications Ltd", ticker: "TATACOMM", price: 1850, fiiWeight: 0.10, diiWeight: 0.15 }
  ],
  "Capital Goods": [
    { name: "Larsen & Toubro Ltd", ticker: "LT", price: 3600, fiiWeight: 0.50, diiWeight: 0.45 },
    { name: "Siemens Ltd", ticker: "SIEMENS", price: 5500, fiiWeight: 0.20, diiWeight: 0.20 },
    { name: "Bharat Electronics Ltd", ticker: "BEL", price: 230, fiiWeight: 0.18, diiWeight: 0.20 },
    { name: "ABB India Ltd", ticker: "ABB", price: 6500, fiiWeight: 0.12, diiWeight: 0.15 }
  ],
  "Metals & Mining": [
    { name: "Tata Steel Ltd", ticker: "TATASTEEL", price: 155, fiiWeight: 0.35, diiWeight: 0.30 },
    { name: "JSW Steel Ltd", ticker: "JSWSTEEL", price: 850, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "Hindalco Industries Ltd", ticker: "HINDALCO", price: 620, fiiWeight: 0.20, diiWeight: 0.25 },
    { name: "Coal India Ltd", ticker: "COALINDIA", price: 450, fiiWeight: 0.20, diiWeight: 0.20 }
  ],
  "Chemicals": [
    { name: "Pidilite Industries Ltd", ticker: "PIDILITIND", price: 2800, fiiWeight: 0.45, diiWeight: 0.40 },
    { name: "SRF Ltd", ticker: "SRF", price: 2300, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "Tata Chemicals Ltd", ticker: "TATACHEM", price: 1100, fiiWeight: 0.18, diiWeight: 0.20 },
    { name: "Aarti Industries Ltd", ticker: "AARTIIND", price: 650, fiiWeight: 0.12, diiWeight: 0.15 }
  ],
  "Construction Materials": [
    { name: "UltraTech Cement Ltd", ticker: "ULTRACEMCO", price: 9800, fiiWeight: 0.50, diiWeight: 0.45 },
    { name: "Grasim Industries Ltd", ticker: "GRASIM", price: 2300, fiiWeight: 0.25, diiWeight: 0.25 },
    { name: "Ambuja Cements Ltd", ticker: "AMBUJACEM", price: 620, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "ACC Ltd", ticker: "ACC", price: 2500, fiiWeight: 0.10, diiWeight: 0.15 }
  ],
  "Consumer Services": [
    { name: "Zomato Ltd", ticker: "ZOMATO", price: 180, fiiWeight: 0.40, diiWeight: 0.35 },
    { name: "Titan Company Ltd", ticker: "TITAN", price: 3400, fiiWeight: 0.35, diiWeight: 0.35 },
    { name: "Indian Hotels Co Ltd", ticker: "INDHOTEL", price: 580, fiiWeight: 0.15, diiWeight: 0.15 },
    { name: "Trent Ltd", ticker: "TRENT", price: 4200, fiiWeight: 0.10, diiWeight: 0.15 }
  ]
};

// Generates detailed stock list breakdown with shares & values
export function getStocksForSector(sectorName: string, fiiAuc: number, diiAuc: number, priceWalkFactor: number = 1.0) {
  const stockTemplates = SECTOR_STOCKS[sectorName] || [];
  return stockTemplates.map(s => {
    const walkedPrice = parseFloat((s.price * priceWalkFactor).toFixed(2));
    const fiiValue = parseFloat((fiiAuc * s.fiiWeight).toFixed(2));
    const diiValue = parseFloat((diiAuc * s.diiWeight).toFixed(2));
    
    // Shares (in Crores) = Value (in Crores) / Price (in Rupees)
    const fiiShares = parseFloat((fiiValue / walkedPrice).toFixed(4));
    const diiShares = parseFloat((diiValue / walkedPrice).toFixed(4));
    
    return {
      stockName: s.name,
      ticker: s.ticker,
      price: walkedPrice,
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

  // Schema Upgrade: check if any reports lack fiiAuc. If so, regenerate.
  const dates = Object.keys(db.reports);
  let needsRegen = false;
  if (dates.length > 0) {
    const firstReport = db.reports[dates[0]];
    if (firstReport && firstReport.length > 0 && firstReport[0].fiiAuc === undefined) {
      needsRegen = true;
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
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  return db;
}

export function saveDB(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}
