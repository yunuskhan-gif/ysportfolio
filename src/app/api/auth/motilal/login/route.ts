import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalConfigModel from "@/lib/models/MotilalConfig";

const DEFAULT_KEY = "default";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/settings";

    const config = await MotilalConfigModel.findOne({ key: DEFAULT_KEY });

    if (!config?.apiKey) {
      return NextResponse.json(
        { message: "API Key is missing in Motilal Settings." },
        { status: 400 }
      );
    }

    const portalUrl = `https://invest.motilaloswal.com/OpenAPI/Login.aspx?apikey=${config.apiKey}`;
    
    const response = NextResponse.redirect(portalUrl);
    // Store the 'next' destination in a cookie for the callback to use
    response.cookies.set("motilal_next", next, { maxAge: 600, path: "/" });
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to initiate Motilal login." },
      { status: 500 }
    );
  }
}
