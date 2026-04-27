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
          ClientLocalIp: "192.168.1.1",
          ClientPublicIp: "59.178.203.152",
          MacAddress: "00-1B-63-84-45-E6",
          SourceId: "WEB",
          vendorinfo: config.vendorinfo || config.clientcode || "",
          osname: "Windows 10",
          osversion: "10.0.19041",
          devicemodel: "Desktop",
          manufacturer: "Generic",
          productname: "ysportfolio",
          productversion: "1.1.0",
          browsername: "Chrome",
          browserversion: "110.0.5481.178",
          apisecretkey: config.apiSecretKey,
        },
        timeout: 15000,
      }
    );

    if (response.data?.status !== "SUCCESS" || !response.data?.accesstoken) {
      throw new Error(response.data?.message || "Failed to generate access token.");
    }

    const accessToken = String(response.data.accesstoken);

    const nextPath = request.headers.get("cookie")?.split("; ").find(c => c.startsWith("motilal_next="))?.split("=")[1] || "/settings";
    const decodedPath = decodeURIComponent(nextPath);

    console.log("Saving Motilal Session:", {
      authtoken: authtoken.substring(0, 5) + "...",
      accessToken: accessToken.substring(0, 5) + "...",
      nextPath: decodedPath
    });

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

    const redirectUrl = new URL(decodedPath, request.url);

    // Redirect back to settings or original page
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.cookies.delete("motilal_next");
    return redirectResponse;
  } catch (error: any) {
    console.error("Motilal Callback Error:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || "Failed to complete Motilal login." },
      { status: 500 }
    );
  }
}
