import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/fii-dii/db";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: true, message: "No session active" });
    }

    const db = getDB();
    if (db.sessions && db.sessions[token]) {
      delete db.sessions[token];
      saveDB(db);
    }

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid logout request" }, { status: 400 });
  }
}
