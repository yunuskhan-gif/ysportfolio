import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getHoldingModel } from "@/lib/models/Holding";

type HoldingInput = {
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  app?: string;
  sourceUrl?: string;
};

function normalizeHolding(holding: HoldingInput) {
  return {
    symbol: holding.symbol.trim().toUpperCase(),
    name: holding.name.trim(),
    qty: Number(holding.qty),
    avgPrice: Number(holding.avgPrice),
    app: (holding.app || "Manual").trim(),
    sourceUrl: (holding.sourceUrl || "").trim(),
  };
}

function serializeHolding(doc: {
  _id: { toString: () => string };
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  app?: string;
  sourceUrl?: string;
}) {
  return {
    id: doc._id.toString(),
    symbol: doc.symbol,
    name: doc.name,
    qty: doc.qty,
    avgPrice: doc.avgPrice,
    app: doc.app || "Manual",
    sourceUrl: doc.sourceUrl || "",
  };
}

async function getSerializedHoldings() {
  const HoldingModel = await getHoldingModel();
  const holdings = await HoldingModel.find({}).sort({ createdAt: 1 }).lean();
  return holdings.map(serializeHolding);
}

export async function GET() {
  await connectToDatabase();
  return NextResponse.json(await getSerializedHoldings());
}

export async function PUT(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as { holdings?: HoldingInput[] };
  const holdings = Array.isArray(body.holdings) ? body.holdings.map(normalizeHolding) : [];

  const HoldingModel = await getHoldingModel();
  await HoldingModel.deleteMany({});

  if (holdings.length > 0) {
    await HoldingModel.insertMany(holdings);
  }

  return NextResponse.json(await getSerializedHoldings());
}

export async function PATCH(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as {
    mode?: "append" | "upsert";
    holdings?: HoldingInput[];
    holding?: HoldingInput;
    id?: string;
  };

  const HoldingModel = await getHoldingModel();

  if (body.mode === "append") {
    const holdings = Array.isArray(body.holdings) ? body.holdings.map(normalizeHolding) : [];

    if (holdings.length > 0) {
      await HoldingModel.insertMany(holdings);
    }

    return NextResponse.json(await getSerializedHoldings());
  }

  if (!body.holding) {
    return NextResponse.json({ message: "Holding payload is required." }, { status: 400 });
  }

  const payload = normalizeHolding(body.holding);

  if (body.id) {
    await HoldingModel.findByIdAndUpdate(body.id, payload, { new: true });
  } else {
    await HoldingModel.create(payload);
  }

  return NextResponse.json(await getSerializedHoldings());
}

export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Holding id is required." }, { status: 400 });
  }

  const HoldingModel = await getHoldingModel();
  await HoldingModel.findByIdAndDelete(id);
  return NextResponse.json(await getSerializedHoldings());
}
