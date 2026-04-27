import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalScripModel from "@/lib/models/MotilalScrip";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch NSE Master
    const response = await axios.get("https://openapi.motilaloswal.com/getscripmastercsv?name=NSE", {
      timeout: 30000,
    });

    const lines = response.data.split("\n");
    // Skip header
    const dataRows = lines.slice(1);

    const ops = dataRows
      .map((line: string) => {
        const parts = line.split(",");
        if (parts.length < 6) return null;

        const scripCode = parseInt(parts[2]);
        const scripShortName = parts[5].trim();
        const scripFullName = parts[3].trim();

        if (isNaN(scripCode) || !scripShortName) return null;

        // Motilal uses short name like 'RELIANCE'
        // We want to store it as 'RELIANCE.NS' for consistency
        const symbol = `${scripShortName.toUpperCase()}.NS`;

        return {
          updateOne: {
            filter: { symbol, exchange: "NSE" },
            update: {
              $set: {
                symbol,
                scripCode,
                name: scripFullName,
                exchange: "NSE",
              },
            },
            upsert: true,
          },
        };
      })
      .filter(Boolean);

    if (ops.length > 0) {
      // Run in batches of 1000 to avoid memory issues
      for (let i = 0; i < ops.length; i += 1000) {
        const batch = ops.slice(i, i + 1000);
        await MotilalScripModel.bulkWrite(batch);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${ops.length} NSE scrips.`,
    });
  } catch (error: any) {
    console.error("Master sync failed:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
