import { NextResponse } from "next/server";
import { runScheduledFetch } from "@/lib/fii-dii/scheduler";

export async function POST() {
  try {
    const result = await runScheduledFetch();
    return NextResponse.json({
      success: true,
      message: result.isSimulated 
        ? "Scrape failed or bypassed; simulated random-walk record generated." 
        : "Live NSDL FPI sector AUC report fetched successfully.",
      dateAdded: result.dateAdded,
      isSimulated: result.isSimulated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Scraping failed" }, { status: 500 });
  }
}
