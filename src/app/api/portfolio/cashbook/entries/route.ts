import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCashbookEntryModel } from "@/lib/models/CashbookEntry";

function serializeEntry(doc: any) {
  return {
    id: doc._id.toString(),
    accountId: doc.accountId.toString(),
    type: doc.type,
    amount: doc.amount,
    date: doc.date,
    remark: doc.remark || "",
    paymentMode: doc.paymentMode || "Cash",
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
  };
}

async function getSerializedEntries() {
  const CashbookEntryModel = await getCashbookEntryModel();
  const entries = await CashbookEntryModel.find({}).sort({ date: 1, createdAt: 1 }).lean();
  return entries.map(serializeEntry);
}

export async function GET() {
  await connectToDatabase();
  return NextResponse.json(await getSerializedEntries());
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const { id, accountId, type, amount, date, remark, paymentMode } = body;

  if (!accountId || !type || amount === undefined || !date) {
    return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
  }

  const payload = {
    accountId,
    type,
    amount: Number(amount) || 0,
    date,
    remark: remark ? remark.trim() : "",
    paymentMode: paymentMode || "Cash",
  };

  const CashbookEntryModel = await getCashbookEntryModel();
  if (id) {
    await CashbookEntryModel.findByIdAndUpdate(id, payload, { new: true });
  } else {
    await CashbookEntryModel.create(payload);
  }

  return NextResponse.json(await getSerializedEntries());
}

export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Entry ID is required." }, { status: 400 });
  }

  const CashbookEntryModel = await getCashbookEntryModel();
  await CashbookEntryModel.findByIdAndDelete(id);

  return NextResponse.json(await getSerializedEntries());
}
