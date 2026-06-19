import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/fii-dii/db";
import { setupCronScheduler } from "@/lib/fii-dii/scheduler";

export async function POST(request: Request) {
  try {
    const { frequency } = await request.json();

    if (frequency !== "daily" && frequency !== "fortnightly") {
      return NextResponse.json({ error: "Frequency must be 'daily' or 'fortnightly'" }, { status: 400 });
    }

    const db = getDB();

    // Map frequency to cron pattern
    // Daily: "0 0 * * *" (runs every midnight)
    // Fortnightly: "0 0 1,15 * *" (runs 1st and 15th of every month)
    const cronExp = frequency === "daily" ? "0 0 * * *" : "0 0 1,15 * *";

    db.schedulerInfo.frequency = frequency;
    db.schedulerInfo.cronExpression = cronExp;

    // Recalculate next run date
    const nextDays = frequency === "daily" ? 1 : 14;
    db.schedulerInfo.nextRun = new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString();

    db.schedulerInfo.logs = [{
      timestamp: new Date().toISOString(),
      event: "config_changed",
      message: `Frequency changed to ${frequency}. Cron expression: "${cronExp}"`
    }, ...(db.schedulerInfo.logs || [])].slice(0, 15);

    // Apply the scheduler change in memory immediately
    setupCronScheduler(cronExp);

    saveDB(db);

    return NextResponse.json({
      success: true,
      schedulerInfo: db.schedulerInfo
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid configuration request" }, { status: 400 });
  }
}
