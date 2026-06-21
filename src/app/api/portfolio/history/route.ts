import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getPortfolioSnapshotModel } from "@/lib/models/PortfolioSnapshot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalInvested, currentValue, totalPnL, pnlPercentage, holdings } = body;

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json({ message: "No holdings data provided." }, { status: 400 });
    }

    await connectToDatabase();

    const PortfolioSnapshotModel = await getPortfolioSnapshotModel();
    const snapshot = new PortfolioSnapshotModel({
      totalInvested,
      currentValue,
      totalPnL,
      pnlPercentage,
      holdings,
    });

    await snapshot.save();

    return NextResponse.json({ message: "Portfolio snapshot saved successfully!", snapshot }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to save portfolio snapshot:", error);
    return NextResponse.json({ message: "Failed to save data.", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all snapshots, sorted by newest first
    const PortfolioSnapshotModel = await getPortfolioSnapshotModel();
    const snapshots = await PortfolioSnapshotModel.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(snapshots);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch history.", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Snapshot ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const PortfolioSnapshotModel = await getPortfolioSnapshotModel();
    const deleted = await PortfolioSnapshotModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Snapshot not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Snapshot deleted successfully." });
  } catch (error: any) {
    console.error("Failed to delete snapshot:", error);
    return NextResponse.json({ message: "Failed to delete snapshot.", error: error.message }, { status: 500 });
  }
}
