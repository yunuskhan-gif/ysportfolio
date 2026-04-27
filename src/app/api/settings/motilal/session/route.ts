import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import MotilalConfigModel from "@/lib/models/MotilalConfig";

const DEFAULT_KEY = "default";

export async function DELETE() {
  await connectToDatabase();
  await MotilalConfigModel.findOneAndUpdate(
    { key: DEFAULT_KEY },
    {
      $set: {
        session: {
          authorization: "",
          accessToken: "",
          savedAt: "",
        },
      },
    },
    { upsert: false }
  );

  return NextResponse.json({ success: true });
}
