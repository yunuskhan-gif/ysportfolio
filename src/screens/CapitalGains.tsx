"use client";

import { useState, useMemo } from "react";
import { Transaction, TaxSettings } from "@/components/capital-gains/types";
import { calculateFIFOTax } from "@/components/capital-gains/fifoCalculator";

import DashboardOverview from "@/components/capital-gains/DashboardOverview";
import CsvImporter from "@/components/capital-gains/CsvImporter";
import TransactionForm from "@/components/capital-gains/TransactionForm";
import AnalyticsCharts from "@/components/capital-gains/AnalyticsCharts";
import ReportDownloader from "@/components/capital-gains/ReportDownloader";
import FIFOAuditTrail from "@/components/capital-gains/FIFOAuditTrail";
import TransactionTable from "@/components/capital-gains/TransactionTable";
import { Badge } from "@/components/ui/badge";
import { Percent, Terminal, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CapitalGains() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [previousStcgLoss, setPreviousStcgLoss] = useState(0);
  const [previousLtcgLoss, setPreviousLtcgLoss] = useState(0);
  const [settings, setSettings] = useState<TaxSettings>({
    stcgRate: 0.20,
    ltcgRate: 0.125,
    ltcgExemption: 125000,
    previousLossOffset: 0,
  });

  // Log terminal outputs for debugging and user visibility
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SYSTEM] FIFO matching engine initialized.",
    "[SYSTEM] Ready for ledger uploads or manual entries."
  ]);

  const addConsoleLog = (message: string) => {
    setConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  // Calculate taxes on state change automatically
  const { matchDetails, taxResult, warnings } = useMemo(() => {
    return calculateFIFOTax(transactions, settings, previousStcgLoss, previousLtcgLoss);
  }, [transactions, settings, previousStcgLoss, previousLtcgLoss]);

  const handleAddTransaction = (newTx: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...newTx, id: `tx-${Date.now()}` }]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    addConsoleLog(`[DELETE] Deleted transaction with ID: ${id}`);
  };

  const handleImportSuccess = (imported: Transaction[], losses?: { stcg: number; ltcg: number }) => {
    setTransactions(imported);
    if (losses) {
      setPreviousStcgLoss(losses.stcg);
      setPreviousLtcgLoss(losses.ltcg);
    }
  };

  return (
    <div className="space-y-6 pb-20 p-1 md:p-3">
      {/* Title & Heading */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-primary/10 p-5 rounded-2xl border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" />
            Capital Gains Tax Calculator
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Calculate capital gains on a First-In, First-Out (FIFO) basis with Indian Income Tax guidelines for FY 2025-26.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2.5 py-0.5 text-xs bg-card/40">ITR AY 2026-27</Badge>
          <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">FIFO Engine v1.2</Badge>
        </div>
      </div>

      {/* 1. Dashboard Metrics Overview */}
      <DashboardOverview
        taxResult={taxResult}
        settings={settings}
        onUpdateSettings={setSettings}
        previousStcgLoss={previousStcgLoss}
        previousLtcgLoss={previousLtcgLoss}
        onUpdateLosses={(stcg, ltcg) => {
          setPreviousStcgLoss(stcg);
          setPreviousLtcgLoss(ltcg);
          addConsoleLog(`[LOSS UPDATE] Set brought-forward STCL to ₹${stcg}, LTCL to ₹${ltcg}`);
        }}
      />

      {/* 2. File Import and Manual Addition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CsvImporter onImportSuccess={handleImportSuccess} onAddLog={addConsoleLog} />
        <TransactionForm onAddTransaction={handleAddTransaction} onAddLog={addConsoleLog} />
      </div>

      {/* 3. Recharts Analytics Visualizers */}
      <AnalyticsCharts matchDetails={matchDetails} />

      {/* 4. Export Assessment Reports (PDF/Excel) & Console Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ReportDownloader
            taxResult={taxResult}
            settings={settings}
            matchDetails={matchDetails}
            previousStcgLoss={previousStcgLoss}
            previousLtcgLoss={previousLtcgLoss}
          />
        </div>
        
        {/* Real-time event log */}
        <Card className="border border-border/80 bg-card shadow-sm h-full flex flex-col justify-between">
          <div className="p-3 border-b border-border/40 flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 text-muted-foreground">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              FIFO Engine Event Log
            </span>
          </div>
          <CardContent className="p-2 flex-1">
            <div className="bg-black/95 rounded-lg p-2.5 h-[90px] font-mono text-[9px] text-green-400 overflow-y-auto space-y-0.5 border border-border/30">
              {consoleLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Detailed Audit Logs & Transaction Ledger List */}
      <FIFOAuditTrail matchDetails={matchDetails} warnings={warnings} />
      
      <TransactionTable
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
        onClearAll={() => {
          setTransactions([]);
          setPreviousStcgLoss(0);
          setPreviousLtcgLoss(0);
          addConsoleLog("[SYSTEM] Workbook cleared.");
        }}
      />
    </div>
  );
}
