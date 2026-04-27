import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalConfigModel from "@/lib/models/MotilalConfig";

const DEFAULT_KEY = "default";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authtoken = searchParams.get("authtoken");

  if (!authtoken) {
    return NextResponse.json(
      { message: "Authentication token missing from Motilal redirect." },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const config = await MotilalConfigModel.findOne({ key: DEFAULT_KEY });

    if (!config?.apiKey || !config?.apiSecretKey) {
      return NextResponse.json(
        { message: "Motilal configuration (API Key/Secret) is incomplete." },
        { status: 400 }
      );
    }

    // Exchange authtoken for accesstoken
    const response = await axios.post(
      "https://openapi.motilaloswal.com/rest/login/v1/getaccesstoken",
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "MOSL/V.1.1.0",
          Authorization: authtoken,
          ApiKey: config.apiKey,
          ClientLocalIp: "127.0.0.1",
          ClientPublicIp: "127.0.0.1",
          MacAddress: "00:00:00:00:00:00",
          SourceId: "WEB",
          vendorinfo: config.vendorinfo || "TRADYLYTICS",
          osname: "Windows",
          osversion: "10",
          devicemodel: "Desktop",
          manufacturer: "Generic",
          productname: "Tradylytics",
          productversion: "1.0.0",
          browsername: "Chrome",
          browserversion: "1.0",
          apisecretkey: config.apiSecretKey,
        },
        timeout: 15000,
      }
    );

    if (response.data?.status !== "SUCCESS" || !response.data?.accesstoken) {
      throw new Error(response.data?.message || "Failed to generate access token.");
    }

    const accessToken = String(response.data.accesstoken);

    // Save session to DB
    await MotilalConfigModel.findOneAndUpdate(
      { key: DEFAULT_KEY },
      {
        $set: {
          session: {
            authorization: authtoken,
            accessToken: accessToken,
            savedAt: new Date().toISOString(),
          },
        },
      },
      { upsert: true }
    );

    // Redirect back to settings
    return NextResponse.redirect(new URL("/settings", request.url));
  } catch (error: any) {
    console.error("Motilal Callback Error:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || "Failed to complete Motilal login." },
      { status: 500 }
    );
  }
}
