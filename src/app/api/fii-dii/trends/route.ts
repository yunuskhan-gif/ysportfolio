import { NextResponse } from "next/server";
import { getDB } from "@/lib/fii-dii/db";

export async function GET() {
  try {
    const db = getDB();
    const dates = Object.keys(db.reports || {}).sort();
    
    const trends = dates.map(date => {
      const sectors = db.reports[date] || [];
      const sectorMap: any = {};
      
      for (const s of sectors) {
        sectorMap[s.sectorName] = {
          auc: s.auc,
          netInvestment: s.netInvestment,
          percentageChange: s.percentageChange,
          fiiAuc: s.fiiAuc !== undefined ? s.fiiAuc : s.auc,
          fiiNetInvestment: s.fiiNetInvestment !== undefined ? s.fiiNetInvestment : s.netInvestment,
          fiiPercentageChange: s.fiiPercentageChange !== undefined ? s.fiiPercentageChange : s.percentageChange,
          diiAuc: s.diiAuc !== undefined ? s.diiAuc : 0,
          diiNetInvestment: s.diiNetInvestment !== undefined ? s.diiNetInvestment : 0,
          diiPercentageChange: s.diiPercentageChange !== undefined ? s.diiPercentageChange : 0
        };
      }
      
      return {
        date,
        sectors: sectorMap
      };
    });

    return NextResponse.json({ trends });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request" }, { status: 400 });
  }
}
