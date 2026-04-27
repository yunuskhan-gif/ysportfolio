import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import * as OTPAuth from "otpauth";
import HoldingModel from "@/lib/models/Holding";
import MotilalConfigModel from "@/lib/models/MotilalConfig";

const DEFAULT_KEY = "default";

type MotilalRequestBody = {
  clientcode?: string;
  userid?: string;
  password?: string;
  dob?: string;
  totp?: string;
  apiKey?: string;
  apiSecretKey?: string;
  vendorinfo?: string;
  persistHoldings?: boolean;
};

const normalizeSymbolFromScripName = (scripName: string) => {
  const normalized = scripName
    .replace(/\b(EQ|BE|BZ|SM|ST)\b/gi, "")
    .replace(/[^\w\s&.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  const compact = normalized.replace(/\s+/g, "");
  return compact ? `${compact}.NS` : "";
};

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = (await request.json()) as MotilalRequestBody;
    const config = await MotilalConfigModel.findOne({ key: DEFAULT_KEY });

    const payload = {
      clientcode: body.clientcode || config?.clientcode || "",
      userid: body.userid || config?.userid || "",
      password: body.password || "",
      dob: body.dob || config?.dob || "",
      totp: body.totp || "",
      apiKey: body.apiKey || config?.apiKey || "",
      apiSecretKey: body.apiSecretKey || config?.apiSecretKey || "",
      vendorinfo: body.vendorinfo || config?.vendorinfo || "TRADYLYTICS",
      totpSecret: config?.totpSecret || "",
      savedAuthorization: config?.session?.authorization || "",
      savedAccessToken: config?.session?.accessToken || "",
    };

    // Auto-generate TOTP if not provided but secret is available
    if (!payload.totp && payload.totpSecret) {
      try {
        const totp = new OTPAuth.TOTP({
          issuer: "Motilal",
          label: payload.userid,
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: payload.totpSecret.replace(/\s+/g, ""),
        });
        payload.totp = totp.generate();
      } catch (e) {
        console.error("Failed to auto-generate TOTP", e);
      }
    }

    if (!payload.userid || !payload.apiKey || !payload.apiSecretKey) {
      return NextResponse.json(
        { message: "Motilal configuration is incomplete.", skipped: true },
        { status: 400 }
      );
    }

    const fetchHoldings = async (authorization: string, accessToken: string) =>
      axios.post(
        "https://openapi.motilaloswal.com/rest/report/v3/getdpholding",
        payload.clientcode ? { clientcode: payload.clientcode } : {},
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "MOSL/V.1.1.0",
            Authorization: authorization,
            ApiKey: payload.apiKey,
            ClientLocalIp: "127.0.0.1",
            ClientPublicIp: "127.0.0.1",
            MacAddress: "00:00:00:00:00:00",
            SourceId: "WEB",
            vendorinfo: payload.vendorinfo,
            osname: "Windows",
            osversion: "10",
            devicemodel: "Desktop",
            manufacturer: "Generic",
            productname: "Tradylytics",
            productversion: "1.0.0",
            browsername: "Chrome",
            browserversion: "1.0",
            apisecretkey: payload.apiSecretKey,
            accesstoken: accessToken,
          },
          timeout: 15000,
        }
      );

    const loginAndCreateSession = async () => {
      if (!payload.userid || !payload.password || !payload.dob) {
        return null;
      }

      const hashedPassword = crypto
        .createHash("sha256")
        .update(`${payload.password}${payload.apiKey}`)
        .digest("hex");

      const authResponse = await axios.post(
        "https://openapi.motilaloswal.com/rest/login/v7/authdirectapi",
        {
          userid: payload.userid,
          password: hashedPassword,
          "2FA": payload.dob,
          ...(payload.totp ? { totp: payload.totp } : {}),
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "MOSL/V.1.1.0",
            ApiKey: payload.apiKey,
          },
          timeout: 15000,
        }
      );

      if (authResponse.data?.status !== "SUCCESS" || !authResponse.data?.AuthToken) {
        throw new Error(authResponse.data?.message || "Motilal login failed.");
      }

      const authorization = String(authResponse.data.AuthToken);

      const accessTokenResponse = await axios.post(
        "https://openapi.motilaloswal.com/rest/login/v1/getaccesstoken",
        {},
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "MOSL/V.1.1.0",
            Authorization: authorization,
            ApiKey: payload.apiKey,
            ClientLocalIp: "127.0.0.1",
            ClientPublicIp: "127.0.0.1",
            MacAddress: "00:00:00:00:00:00",
            SourceId: "WEB",
            vendorinfo: payload.vendorinfo,
            osname: "Windows",
            osversion: "10",
            devicemodel: "Desktop",
            manufacturer: "Generic",
            productname: "Tradylytics",
            productversion: "1.0.0",
            browsername: "Chrome",
            browserversion: "1.0",
            apisecretkey: payload.apiSecretKey,
          },
          timeout: 15000,
        }
      );

      if (accessTokenResponse.data?.status !== "SUCCESS" || !accessTokenResponse.data?.accesstoken) {
        throw new Error(accessTokenResponse.data?.message || "Motilal access token failed.");
      }

      return {
        authorization,
        accessToken: String(accessTokenResponse.data.accesstoken),
      };
    };

    let authorization = payload.savedAuthorization;
    let accessToken = payload.savedAccessToken;
    let reusedSession = Boolean(authorization && accessToken);
    let response;

    if (authorization && accessToken) {
      try {
        response = await fetchHoldings(authorization, accessToken);
      } catch (error: any) {
        const errorCode = error?.response?.data?.errorcode || "";
        const canRefresh = ["MO8001", "MO8002", "MO8003", "MO2007"].includes(errorCode);

        if (!canRefresh) throw error;

        const session = await loginAndCreateSession();
        if (!session) {
          if (config) {
            config.session = { authorization: "", accessToken: "", savedAt: "" };
            await config.save();
          }
          return NextResponse.json(
            { message: "Motilal session expired. Re-auth required.", requiresReauth: true },
            { status: 401 }
          );
        }
        authorization = session.authorization;
        accessToken = session.accessToken;
        reusedSession = false;
        response = await fetchHoldings(authorization, accessToken);
      }
    } else {
      const session = await loginAndCreateSession();
      if (!session) {
        return NextResponse.json(
          { message: "Credentials required.", requiresReauth: true },
          { status: 400 }
        );
      }
      authorization = session.authorization;
      accessToken = session.accessToken;
      reusedSession = false;
      response = await fetchHoldings(authorization, accessToken);
    }

    if (response.data?.status !== "SUCCESS" || !Array.isArray(response.data?.data)) {
      return NextResponse.json(
        { message: response.data?.message || "Import failed." },
        { status: 502 }
      );
    }

    const holdings = response.data.data
      .map((item: any) => {
        const name = String(item?.scripname || "").trim();
        const qty = Number(item?.dpquantity || 0);
        const avgPrice = Number(item?.buyavgprice || 0);
        const symbol = normalizeSymbolFromScripName(name);

        if (!name || !symbol || qty <= 0 || avgPrice <= 0) return null;

        return {
          symbol,
          name,
          qty,
          avgPrice,
          app: "MOFS API",
        };
      })
      .filter(Boolean);

    // Save session to DB
    const nextConfig = await MotilalConfigModel.findOneAndUpdate(
      { key: DEFAULT_KEY },
      {
        $set: {
          clientcode: payload.clientcode,
          userid: payload.userid,
          dob: payload.dob,
          apiKey: payload.apiKey,
          apiSecretKey: payload.apiSecretKey,
          vendorinfo: payload.vendorinfo,
          totpSecret: payload.totpSecret,
          session: {
            authorization,
            accessToken,
            savedAt: new Date().toISOString(),
          },
        },
      },
      { new: true, upsert: true }
    );

    if (body.persistHoldings) {
      await HoldingModel.deleteMany({});
      if (holdings.length > 0) {
        await HoldingModel.insertMany(holdings);
      }
    }

    return NextResponse.json({
      holdings,
      session: {
        savedAt: nextConfig.session?.savedAt || "",
        reusedSession,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.response?.data?.message || error.message || "Failed to import." },
      { status: 500 }
    );
  }
}
