import { NextResponse } from "next/server";
import { getDB } from "@/lib/fii-dii/db";

export async function GET(request: Request) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    let date = searchParams.get("date");

    if (!date) {
      const dates = Object.keys(db.reports || {}).sort();
      date = dates[dates.length - 1] || null;
    }

    if (!date || !db.reports[date]) {
      return NextResponse.json({ error: "No report found for specified date" }, { status: 404 });
    }

    return NextResponse.json({ date, sectors: db.reports[date] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
