import { NextResponse } from "next/server";
import { runScheduledFetch } from "@/lib/fii-dii/scheduler";

export async function POST() {
  try {
    const result = await runScheduledFetch();
    return NextResponse.json({
      success: true,
      message: result.isSimulated 
        ? "Scheduler manually executed: Simulation fallback run." 
        : "Scheduler manually executed: Live scrape completed.",
      dateAdded: result.dateAdded,
      isSimulated: result.isSimulated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Manual trigger execution failed" }, { status: 500 });
  }
}
