import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CashbookAccountModel from "@/lib/models/CashbookAccount";
import CashbookEntryModel from "@/lib/models/CashbookEntry";

function serializeAccount(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone || "",
    openingBalance: doc.openingBalance || 0,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
  };
}

async function getSerializedAccounts() {
  const accounts = await CashbookAccountModel.find({}).sort({ createdAt: 1 }).lean();
  if (accounts.length === 0) {
    const defaultAcc = await CashbookAccountModel.create({
      name: "Main Cash Drawer",
      openingBalance: 0,
    });
    return [serializeAccount(defaultAcc)];
  }
  return accounts.map(serializeAccount);
}

export async function GET() {
  await connectToDatabase();
  return NextResponse.json(await getSerializedAccounts());
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const { id, name, phone, openingBalance } = body;

  if (!name) {
    return NextResponse.json({ message: "Account name is required." }, { status: 400 });
  }

  const payload = {
    name: name.trim(),
    phone: phone ? phone.trim() : "",
    openingBalance: Number(openingBalance) || 0,
  };

  if (id) {
    await CashbookAccountModel.findByIdAndUpdate(id, payload, { new: true });
  } else {
    await CashbookAccountModel.create(payload);
  }

  return NextResponse.json(await getSerializedAccounts());
}

export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Account ID is required." }, { status: 400 });
  }

  // Delete the account
  await CashbookAccountModel.findByIdAndDelete(id);

  // Delete all entries associated with this account
  await CashbookEntryModel.deleteMany({ accountId: id });

  return NextResponse.json(await getSerializedAccounts());
}
