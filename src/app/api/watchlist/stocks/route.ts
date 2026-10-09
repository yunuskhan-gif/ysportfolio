import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getWatchlistStockModel } from "@/lib/models/WatchlistStock";
import { getCurrentUser } from "@/lib/models/dynamicHelper";
import { getDB, saveDB } from "@/lib/fii-dii/db";

interface WatchlistStockItem {
  id?: string;
  symbol: string;
  name: string;
  sector?: string;
  type?: "stock" | "mf";
  ltp?: number;
  change?: number;
  changePercent?: number;
  notes?: string;
  createdAt?: string;
}

const sanitizeSymbol = (s: string) => s.trim().toUpperCase();

export async function GET() {
  const user = await getCurrentUser();
  const itemsMap = new Map<string, WatchlistStockItem>();

  // 1. Try MongoDB
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const Model = await getWatchlistStockModel();
      const docs = await Model.find({}).sort({ createdAt: -1 }).lean();
      docs.forEach((doc: any) => {
        const sym = sanitizeSymbol(doc.symbol);
        itemsMap.set(sym, {
          id: doc._id.toString(),
          symbol: doc.symbol,
          name: doc.name,
          sector: doc.sector || "Equities",
          type: doc.type || "stock",
          ltp: doc.ltp,
          change: doc.change,
          changePercent: doc.changePercent,
          notes: doc.notes || "",
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn("MongoDB read failed in watchlist stocks, using file fallback", err);
    }
  }

  // 2. File DB fallback / sync
  try {
    const db = getDB();
    if (!db.stockWatchlists) db.stockWatchlists = {};
    const userList: WatchlistStockItem[] = db.stockWatchlists[user] || [];
    userList.forEach((item) => {
      const sym = sanitizeSymbol(item.symbol);
      if (!itemsMap.has(sym)) {
        itemsMap.set(sym, {
          id: item.id || sym,
          symbol: item.symbol,
          name: item.name,
          sector: item.sector || "Equities",
          type: item.type || "stock",
          ltp: item.ltp,
          change: item.change,
          changePercent: item.changePercent,
          notes: item.notes || "",
          createdAt: item.createdAt || new Date().toISOString(),
        });
      }
    });
  } catch (err) {
    console.warn("File DB read failed in watchlist stocks", err);
  }

  const list = Array.from(itemsMap.values());
  return NextResponse.json({
    success: true,
    user,
    count: list.length,
    watchlist: list,
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      symbol,
      name,
      sector = "Equities",
      type = "stock",
      ltp = 0,
      change = 0,
      changePercent = 0,
      action = "toggle", // 'toggle' | 'add' | 'remove'
    } = body;

    if (!symbol) {
      return NextResponse.json({ success: false, message: "Stock symbol is required" }, { status: 400 });
    }

    const cleanSymbol = sanitizeSymbol(symbol);
    const cleanName = (name || symbol).trim();

    let isFavorite = false;
    let updatedDocId = cleanSymbol;

    // 1. Check & modify in MongoDB
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const Model = await getWatchlistStockModel();
        const existing = await Model.findOne({ symbol: cleanSymbol });

        if (action === "remove" || (action === "toggle" && existing)) {
          if (existing) {
            await Model.deleteOne({ _id: existing._id });
          }
          isFavorite = false;
        } else {
          // Add or keep
          if (!existing) {
            const created = await Model.create({
              symbol: cleanSymbol,
              name: cleanName,
              sector,
              type,
              ltp,
              change,
              changePercent,
            });
            updatedDocId = created._id.toString();
          } else {
            updatedDocId = existing._id.toString();
          }
          isFavorite = true;
        }
      } catch (err) {
        console.warn("MongoDB modify watchlist stock failed, continuing to file DB", err);
      }
    }

    // 2. Sync to file DB
    try {
      const db = getDB();
      if (!db.stockWatchlists) db.stockWatchlists = {};
      if (!db.stockWatchlists[user]) db.stockWatchlists[user] = [];

      const list: WatchlistStockItem[] = db.stockWatchlists[user];
      const index = list.findIndex((i) => sanitizeSymbol(i.symbol) === cleanSymbol);

      if (action === "remove" || (action === "toggle" && index >= 0)) {
        if (index >= 0) {
          list.splice(index, 1);
        }
        isFavorite = false;
      } else {
        if (index === -1) {
          list.unshift({
            id: updatedDocId,
            symbol: cleanSymbol,
            name: cleanName,
            sector,
            type,
            ltp,
            change,
            changePercent,
            createdAt: new Date().toISOString(),
          });
        }
        isFavorite = true;
      }

      saveDB(db);
    } catch (err) {
      console.warn("File DB save watchlist stock failed", err);
    }

    return NextResponse.json({
      success: true,
      symbol: cleanSymbol,
      name: cleanName,
      isFavorite,
      message: isFavorite
        ? `${cleanName} added to your Favorites / Wishlist`
        : `${cleanName} removed from your Wishlist`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to update watchlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ success: false, message: "Symbol is required" }, { status: 400 });
    }

    const cleanSymbol = sanitizeSymbol(symbol);

    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const Model = await getWatchlistStockModel();
        await Model.deleteOne({ symbol: cleanSymbol });
      } catch (err) {
        console.warn("MongoDB delete watchlist stock failed", err);
      }
    }

    try {
      const db = getDB();
      if (db.stockWatchlists && db.stockWatchlists[user]) {
        db.stockWatchlists[user] = db.stockWatchlists[user].filter(
          (i: any) => sanitizeSymbol(i.symbol) !== cleanSymbol
        );
        saveDB(db);
      }
    } catch (err) {
      console.warn("File DB delete watchlist stock failed", err);
    }

    return NextResponse.json({
      success: true,
      symbol: cleanSymbol,
      message: "Removed from wishlist",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
