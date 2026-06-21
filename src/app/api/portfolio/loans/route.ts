import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getLoanModel } from "@/lib/models/Loan";

type LoanInput = {
  bank: string;
  sanctionLoan: number;
  type: string;
  emi: number;
  outstanding: number;
};

function normalizeLoan(loan: LoanInput) {
  return {
    bank: loan.bank.trim().toUpperCase(),
    sanctionLoan: Number(loan.sanctionLoan),
    type: loan.type.trim().toUpperCase(),
    emi: Number(loan.emi),
    outstanding: Number(loan.outstanding),
  };
}

function serializeLoan(doc: {
  _id: { toString: () => string };
  bank: string;
  sanctionLoan: number;
  type: string;
  emi: number;
  outstanding: number;
}) {
  return {
    id: doc._id.toString(),
    bank: doc.bank,
    sanctionLoan: doc.sanctionLoan,
    type: doc.type,
    emi: doc.emi,
    outstanding: doc.outstanding,
  };
}

async function getSerializedLoans() {
  const LoanModel = await getLoanModel();
  const loans = await LoanModel.find({}).sort({ createdAt: 1 }).lean();
  return loans.map(serializeLoan);
}

export async function GET() {
  await connectToDatabase();
  return NextResponse.json(await getSerializedLoans());
}

export async function PUT(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as { loans?: LoanInput[] };
  const loans = Array.isArray(body.loans) ? body.loans.map(normalizeLoan) : [];

  const LoanModel = await getLoanModel();
  await LoanModel.deleteMany({});

  if (loans.length > 0) {
    await LoanModel.insertMany(loans);
  }

  return NextResponse.json(await getSerializedLoans());
}

export async function PATCH(request: Request) {
  await connectToDatabase();
  const body = (await request.json()) as {
    mode?: "append" | "upsert";
    loans?: LoanInput[];
    loan?: LoanInput;
    id?: string;
  };

  const LoanModel = await getLoanModel();

  if (body.mode === "append") {
    const loans = Array.isArray(body.loans) ? body.loans.map(normalizeLoan) : [];

    if (loans.length > 0) {
      await LoanModel.insertMany(loans);
    }

    return NextResponse.json(await getSerializedLoans());
  }

  if (!body.loan) {
    return NextResponse.json({ message: "Loan payload is required." }, { status: 400 });
  }

  const payload = normalizeLoan(body.loan);

  if (body.id) {
    await LoanModel.findByIdAndUpdate(body.id, payload, { new: true });
  } else {
    await LoanModel.create(payload);
  }

  return NextResponse.json(await getSerializedLoans());
}

export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Loan id is required." }, { status: 400 });
  }

  const LoanModel = await getLoanModel();
  await LoanModel.findByIdAndDelete(id);
  return NextResponse.json(await getSerializedLoans());
}
