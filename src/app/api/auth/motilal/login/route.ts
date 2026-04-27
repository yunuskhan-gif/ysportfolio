import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalConfigModel from "@/lib/models/MotilalConfig";

const DEFAULT_KEY = "default";

export async function GET() {
  try {
    await connectToDatabase();
    const config = await MotilalConfigModel.findOne({ key: DEFAULT_KEY });

    if (!config?.apiKey) {
      return NextResponse.json(
        { message: "API Key is missing in Motilal Settings." },
        { status: 400 }
      );
    }

    const portalUrl = `https://invest.motilaloswal.com/OpenAPI/Login.aspx?apikey=${config.apiKey}`;
    
    return NextResponse.redirect(portalUrl);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to initiate Motilal login." },
      { status: 500 }
    );
  }
}
