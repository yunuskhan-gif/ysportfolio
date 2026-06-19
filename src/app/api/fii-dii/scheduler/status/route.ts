import { NextResponse } from "next/server";
import { getDB } from "@/lib/fii-dii/db";
import { initScheduler } from "@/lib/fii-dii/scheduler";

export async function GET() {
  try {
    // Ensure scheduler is active
    initScheduler();

    const db = getDB();
    return NextResponse.json({
      schedulerInfo: db.schedulerInfo || {}
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
