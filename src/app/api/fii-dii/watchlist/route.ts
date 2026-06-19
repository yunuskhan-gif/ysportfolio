import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/fii-dii/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Access denied. Active session token missing." }, { status: 401 });
    }

    const db = getDB();
    const userId = db.sessions?.[token];

    if (!userId || !db.users[userId]) {
      return NextResponse.json({ error: "Invalid or expired session token." }, { status: 403 });
    }

    if (!db.watchlists) db.watchlists = {};
    if (!db.watchlists[userId]) {
      db.watchlists[userId] = [];
      saveDB(db);
    }

    return NextResponse.json({ watchlist: db.watchlists[userId] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
