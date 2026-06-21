"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaxResult, TaxSettings, FIFOMatchDetail } from "./types";
import { FileDown, FileSpreadsheet, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportDownloaderProps {
  taxResult: TaxResult;
  settings: TaxSettings;
  matchDetails: FIFOMatchDetail[];
  previousStcgLoss: number;
  previousLtcgLoss: number;
}

export default function ReportDownloader({
  taxResult,
  settings,
  matchDetails,
  previousStcgLoss,
  previousLtcgLoss,
}: ReportDownloaderProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownloadPdf = async () => {
    if (matchDetails.length === 0) {
      toast.error("No data available to download. Please load transactions first.");
      return;
    }

    setDownloadingPdf(true);
    toast.loading("Generating Capital Gains PDF Assessment...", { id: "pdf-toast" });

    try {
      const doc = new jsPDF();
      
      // Page styling - Dark blue primary, grey secondary
      const primaryColor = [15, 23, 42]; // slate-900
      
      // Header Section
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("YS PORTFOLIO", 15, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("FIFO Capital Gains & Income Tax Assessment Report", 15, 30);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 140, 20);
      doc.text("Assessment Year: AY 2026-27 (FY 2025-26)", 140, 26);
      doc.text("Jurisdiction: Income Tax Department India", 140, 32);

      // Section 1: Executive Tax Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. EXECUTIVE TAX LIABILITY SUMMARY", 15, 52);

      const summaryRows = [
        ["Net Portfolio Realized Gains", formatCurrency(taxResult.netRealizedGains)],
        ["Short-Term Capital Gains (STCG)", formatCurrency(taxResult.stcg)],
        ["STCG Tax Rate", `${(settings.stcgRate * 100).toFixed(0)}%`],
        ["Taxable STCG (After Current & Carried Offsets)", formatCurrency(taxResult.stcgTaxable)],
        ["Estimated STCG Tax Liability", formatCurrency(taxResult.stcgTax)],
        ["Long-Term Capital Gains (LTCG)", formatCurrency(taxResult.ltcg)],
        ["LTCG Tax Rate", `${(settings.ltcgRate * 100).toFixed(1)}%`],
        ["LTCG Exemption Claimed (u/s 112A)", formatCurrency(taxResult.ltcgExemptionUsed)],
        ["Taxable LTCG (After Exemption & Offsets)", formatCurrency(taxResult.ltcgTaxable)],
        ["Estimated LTCG Tax Liability", formatCurrency(taxResult.ltcgTax)],
        ["Carried Forward Losses Applied", formatCurrency(taxResult.previousLossOffsetAmountUsed)],
        ["Total Estimated Tax Liability", formatCurrency(taxResult.totalTax)],
      ];

      (doc as any).autoTable({
        startY: 56,
        head: [["Tax Assessment Parameter", "Calculated Value"]],
        body: summaryRows,
        theme: "striped",
        headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: "bold" },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60, halign: "right" }
        }
      });

      // Section 2: FIFO Audit Ledger
      const lastTableY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. DETAILED MATCHING LOGS (FIFO METHOD)", 15, lastTableY + 15);

      const auditHeaders = [["Asset", "Lot BUY", "Lot SELL", "Qty", "Cost (Aq.)", "Sale Value", "Type", "Gain/Loss"]];
      const auditRows = matchDetails.map((match) => [
        match.symbol,
        match.id.includes("short") ? "Missing Lot" : `${match.purchaseDate} (₹${match.purchasePrice})`,
        `${match.saleDate} (₹${match.salePrice})`,
        match.quantitySold.toString(),
        formatCurrency(match.costOfAcquisition),
        formatCurrency(match.saleValue),
        match.holdingType,
        formatCurrency(match.netGainLoss)
      ]);

      (doc as any).autoTable({
        startY: lastTableY + 20,
        head: auditHeaders,
        body: auditRows,
        theme: "grid",
        headStyles: { fillColor: primaryColor, fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
          7: { halign: "right" }
        }
      });

      // Add Disclaimer
      const finalY = (doc as any).lastAutoTable.finalY || 240;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Disclaimer: This report is generated algorithmically on a FIFO basis and is compliant with India Income Tax guidelines for FY 2025-26. Please consult your Chartered Accountant (CA) or certified tax advisor before filing ITR returns.",
        15,
        finalY + 15,
        { maxWidth: 180 }
      );

      doc.save(`YS_Portfolio_Tax_Assessment_${new Date().toISOString().split("T")[0]}.pdf`);
      
      toast.success("PDF Tax Assessment downloaded successfully!", { id: "pdf-toast" });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to generate PDF report: " + error.message, { id: "pdf-toast" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (matchDetails.length === 0) {
      toast.error("No workbook data available to export.");
      return;
    }

    setDownloadingExcel(true);
    toast.loading("Exporting Excel Workbook...", { id: "excel-toast" });

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: General Tax Summary
      const summaryRows = [
        ["YS Portfolio Tax Summary Report", ""],
        ["AY 2026-27 (FY 2025-26) Assessments", ""],
        ["", ""],
        ["Executive Summary Parameter", "Amount (INR)"],
        ["Total BUY Value", taxResult.totalBuyValue],
        ["Total SELL Value", taxResult.totalSellValue],
        ["Net Portfolio Realized Gains", taxResult.netRealizedGains],
        ["Short-Term Capital Gains (STCG)", taxResult.stcg],
        ["STCG Tax Rate", settings.stcgRate],
        ["Taxable STCG", taxResult.stcgTaxable],
        ["STCG Tax Amount", taxResult.stcgTax],
        ["Long-Term Capital Gains (LTCG)", taxResult.ltcg],
        ["LTCG Tax Rate", settings.ltcgRate],
        ["LTCG Exemption Used", taxResult.ltcgExemptionUsed],
        ["Taxable LTCG", taxResult.ltcgTaxable],
        ["LTCG Tax Amount", taxResult.ltcgTax],
        ["Brought Forward Carried Loss Offset Applied", taxResult.previousLossOffsetAmountUsed],
        ["Total Estimated Income Tax Liability", taxResult.totalTax],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, summarySheet, "ITR Summary");

      // Sheet 2: FIFO Matches
      const matchesData = matchDetails.map((match) => ({
        "Stock Symbol": match.symbol,
        "Transaction Type": match.holdingType,
        "Quantity Match": match.quantitySold,
        "Acquisition Date": match.purchaseDate,
        "Acquisition Price (₹)": match.purchasePrice,
        "Cost of Acquisition (₹)": match.costOfAcquisition,
        "Purchase Expenses (₹)": match.purchaseExpenses,
        "Disposal Date": match.saleDate,
        "Disposal Price (₹)": match.salePrice,
        "Disposal Value (₹)": match.saleValue,
        "Disposal Expenses (₹)": match.saleExpenses,
        "Holding Days": match.holdingPeriodDays,
        "Net Capital Gain/Loss (₹)": match.netGainLoss,
      }));
      const matchesSheet = XLSX.utils.json_to_sheet(matchesData);
      XLSX.utils.book_append_sheet(wb, matchesSheet, "FIFO Audit Matches");

      XLSX.writeFile(wb, `YS_Portfolio_Workbook_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel Workbook exported successfully!", { id: "excel-toast" });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to export Excel Workbook: " + error.message, { id: "excel-toast" });
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Export Capital Gains Assessment
        </CardTitle>
        <CardDescription className="text-xs">
          Generate IRS-compliant assessment audits and workbook sheets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3.5">
          {/* PDF Report Generation Button */}
          <Button
            variant="outline"
            disabled={downloadingPdf || matchDetails.length === 0}
            onClick={handleDownloadPdf}
            className="flex-1 h-11 text-xs gap-2 cursor-pointer bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 hover:border-slate-500/50"
          >
            {downloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <FileDown className="h-4 w-4 text-rose-500" />
            )}
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-foreground">Download PDF Audit</span>
              <span className="text-[9px] text-muted-foreground">ITR Compliant Summary & Ledger</span>
            </div>
          </Button>

          {/* Excel Workbook Export Button */}
          <Button
            variant="outline"
            disabled={downloadingExcel || matchDetails.length === 0}
            onClick={handleDownloadExcel}
            className="flex-1 h-11 text-xs gap-2 cursor-pointer bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 hover:border-emerald-500/50"
          >
            {downloadingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            )}
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-foreground">Export Excel Sheet</span>
              <span className="text-[9px] text-muted-foreground">Multi-sheet ledger workbook</span>
            </div>
          </Button>
        </div>

        {matchDetails.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 p-2 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 rounded-lg text-[10px] leading-relaxed">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>ITR audit ready. {matchDetails.length} FIFO match sets have been compiled for AY 2026-27 tax declarations.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
