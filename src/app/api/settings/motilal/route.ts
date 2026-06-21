import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getMotilalConfigModel } from "@/lib/models/MotilalConfig";

const DEFAULT_KEY = "default";

type MotilalPayload = {
  clientcode?: string;
  userid?: string;
  dob?: string;
  apiKey?: string;
  apiSecretKey?: string;
  vendorinfo?: string;
  totpSecret?: string;
};

function serializeConfig(doc: {
  clientcode?: string;
  userid?: string;
  dob?: string;
  apiKey?: string;
  apiSecretKey?: string;
  vendorinfo?: string;
  totpSecret?: string;
  session?: {
    authorization?: string;
    accessToken?: string;
    savedAt?: string;
  };
} | null) {
  return {
    clientcode: doc?.clientcode || "",
    userid: doc?.userid || "",
    dob: doc?.dob || "",
    apiKey: doc?.apiKey || "",
    apiSecretKey: doc?.apiSecretKey || "",
    vendorinfo: doc?.vendorinfo || "",
    totpSecret: doc?.totpSecret || "",
    session: {
      hasSession: Boolean(doc?.session?.authorization && doc?.session?.accessToken),
      savedAt: doc?.session?.savedAt || "",
    },
  };
}

export async function GET() {
  await connectToDatabase();
  const MotilalConfigModel = await getMotilalConfigModel();
  const config = await MotilalConfigModel.findOne({ key: DEFAULT_KEY }).lean();
  return NextResponse.json(serializeConfig(config));
}

export async function PUT(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as MotilalPayload;

  const payload = {
    clientcode: body.clientcode || "",
    userid: body.userid || "",
    dob: body.dob || "",
    apiKey: body.apiKey || "",
    apiSecretKey: body.apiSecretKey || "",
    vendorinfo: body.vendorinfo || "",
    totpSecret: body.totpSecret || "",
  };

  const MotilalConfigModel = await getMotilalConfigModel();
  const config = await MotilalConfigModel.findOneAndUpdate(
    { key: DEFAULT_KEY },
    {
      $set: payload,
      $setOnInsert: { key: DEFAULT_KEY },
    },
    {
      new: true,
      upsert: true,
    }
  ).lean();

  return NextResponse.json(serializeConfig(config));
}

export async function DELETE() {
  await connectToDatabase();
  const MotilalConfigModel = await getMotilalConfigModel();
  await MotilalConfigModel.findOneAndDelete({ key: DEFAULT_KEY });
  return NextResponse.json({ success: true });
}
