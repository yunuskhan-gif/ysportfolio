import { NextResponse } from "next/server";
import { getDB } from "@/lib/fii-dii/db";
import { initScheduler } from "@/lib/fii-dii/scheduler";

export async function GET() {
  try {
    // Lazily initialize background scheduler when database is requested
    initScheduler();

    const db = getDB();
    const dates = Object.keys(db.reports || {}).sort((a, b) => b.localeCompare(a));
    return NextResponse.json({ fortnights: dates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
