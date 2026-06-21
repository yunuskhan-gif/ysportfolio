import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getOtherInvestmentModel } from "@/lib/models/OtherInvestment";

type InvestmentInput = {
  particulars: string;
  amount: number;
};

function normalizeInvestment(inv: InvestmentInput) {
  return {
    particulars: inv.particulars.trim(),
    amount: Number(inv.amount),
  };
}

function serializeInvestment(doc: any) {
  return {
    id: doc._id.toString(),
    particulars: doc.particulars,
    amount: doc.amount,
  };
}

async function getSerializedInvestments() {
  const OtherInvestmentModel = await getOtherInvestmentModel();
  const investments = await OtherInvestmentModel.find({}).sort({ createdAt: 1 }).lean();
  return investments.map(serializeInvestment);
}

export async function GET() {
  await connectToDatabase();
  return NextResponse.json(await getSerializedInvestments());
}

export async function PUT(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as { investments?: InvestmentInput[] };
  const investments = Array.isArray(body.investments) ? body.investments.map(normalizeInvestment) : [];

  const OtherInvestmentModel = await getOtherInvestmentModel();
  await OtherInvestmentModel.deleteMany({});

  if (investments.length > 0) {
    await OtherInvestmentModel.insertMany(investments);
  }

  return NextResponse.json(await getSerializedInvestments());
}

export async function PATCH(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as {
    mode?: "append" | "upsert";
    investments?: InvestmentInput[];
    investment?: InvestmentInput;
    id?: string;
  };

  const OtherInvestmentModel = await getOtherInvestmentModel();

  if (body.mode === "append") {
    const investments = Array.isArray(body.investments) ? body.investments.map(normalizeInvestment) : [];

    if (investments.length > 0) {
      await OtherInvestmentModel.insertMany(investments);
    }

    return NextResponse.json(await getSerializedInvestments());
  }

  if (!body.investment) {
    return NextResponse.json({ message: "Investment payload is required." }, { status: 400 });
  }

  const payload = normalizeInvestment(body.investment);

  if (body.id) {
    await OtherInvestmentModel.findByIdAndUpdate(body.id, payload, { new: true });
  } else {
    await OtherInvestmentModel.create(payload);
  }

  return NextResponse.json(await getSerializedInvestments());
}

export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Investment id is required." }, { status: 400 });
  }

  const OtherInvestmentModel = await getOtherInvestmentModel();
  await OtherInvestmentModel.findByIdAndDelete(id);
  return NextResponse.json(await getSerializedInvestments());
}
