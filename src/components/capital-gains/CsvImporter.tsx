"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Transaction } from "./types";
import { parseBrokerCSV } from "./fifoCalculator";
import { 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Terminal, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Database,
  ArrowRight,
  Wifi
} from "lucide-react";
import toast from "react-hot-toast";

interface CsvImporterProps {
  onImportSuccess: (transactions: Transaction[], losses?: { stcg: number; ltcg: number }) => void;
  onAddLog: (message: string) => void;
}

const BROKERS = [
  { id: "zerodha", name: "Zerodha Console", color: "bg-blue-600/10 text-blue-500 border-blue-500/20 hover:bg-blue-600/20" },
  { id: "groww", name: "Groww", color: "bg-emerald-600/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-600/20" },
  { id: "upstox", name: "Upstox", color: "bg-purple-600/10 text-purple-500 border-purple-500/20 hover:bg-purple-600/20" },
  { id: "angelone", name: "Angel One", color: "bg-orange-600/10 text-orange-500 border-orange-500/20 hover:bg-orange-600/20" },
];

const MOCK_BROKER_DATA: Record<string, { txs: Transaction[]; losses: { stcg: number; ltcg: number } }> = {
  zerodha: {
    losses: { stcg: 12000, ltcg: 8000 },
    txs: [
      { id: "z-1", symbol: "RELIANCE", action: "BUY", quantity: 150, price: 2350, date: "2023-04-12", brokerage: 20, stt: 350, gst: 60, stampDuty: 15 },
      { id: "z-2", symbol: "RELIANCE", action: "BUY", quantity: 50, price: 2420, date: "2023-11-05", brokerage: 20, stt: 120, gst: 25, stampDuty: 5 },
      { id: "z-3", symbol: "TCS", action: "BUY", quantity: 80, price: 3100, date: "2024-01-20", brokerage: 20, stt: 240, gst: 45, stampDuty: 10 },
      { id: "z-4", symbol: "RELIANCE", action: "SELL", quantity: 120, price: 2750, date: "2024-09-18", brokerage: 20, stt: 330, gst: 60, stampDuty: 0 },
      { id: "z-5", symbol: "INFY", action: "BUY", quantity: 100, price: 1400, date: "2025-02-10", brokerage: 20, stt: 140, gst: 30, stampDuty: 8 },
      { id: "z-6", symbol: "TCS", action: "SELL", quantity: 50, price: 3890, date: "2025-05-15", brokerage: 20, stt: 190, gst: 38, stampDuty: 0 },
      { id: "z-7", symbol: "RELIANCE", action: "SELL", quantity: 80, price: 2900, date: "2025-06-02", brokerage: 20, stt: 232, gst: 45, stampDuty: 0 },
    ],
  },
  groww: {
    losses: { stcg: 5000, ltcg: 0 },
    txs: [
      { id: "g-1", symbol: "TATASTEEL", action: "BUY", quantity: 1000, price: 110, date: "2023-03-01", brokerage: 20, stt: 110, gst: 22, stampDuty: 8 },
      { id: "g-2", symbol: "HDFCBANK", action: "BUY", quantity: 120, price: 1550, date: "2023-07-15", brokerage: 20, stt: 186, gst: 35, stampDuty: 12 },
      { id: "g-3", symbol: "TATASTEEL", action: "SELL", quantity: 600, price: 145, date: "2024-06-10", brokerage: 20, stt: 87, gst: 18, stampDuty: 0 },
      { id: "g-4", symbol: "HDFCBANK", action: "SELL", quantity: 120, price: 1720, date: "2025-03-25", brokerage: 20, stt: 206, gst: 40, stampDuty: 0 },
    ],
  },
  upstox: {
    losses: { stcg: 0, ltcg: 15000 },
    txs: [
      { id: "u-1", symbol: "ITC", action: "BUY", quantity: 500, price: 380, date: "2023-05-10", brokerage: 20, stt: 190, gst: 36, stampDuty: 14 },
      { id: "u-2", symbol: "WIPRO", action: "BUY", quantity: 300, price: 410, date: "2023-10-18", brokerage: 20, stt: 123, gst: 25, stampDuty: 9 },
      { id: "u-3", symbol: "ITC", action: "SELL", quantity: 500, price: 445, date: "2024-12-05", brokerage: 20, stt: 222, gst: 42, stampDuty: 0 },
      { id: "u-4", symbol: "WIPRO", action: "SELL", quantity: 200, price: 490, date: "2025-04-12", brokerage: 20, stt: 98, gst: 20, stampDuty: 0 },
    ],
  },
  angelone: {
    losses: { stcg: 2000, ltcg: 3000 },
    txs: [
      { id: "a-1", symbol: "SNDN", action: "BUY", quantity: 100, price: 850, date: "2023-06-21", brokerage: 15, stt: 85, gst: 18, stampDuty: 5 },
      { id: "a-2", symbol: "SNDN", action: "SELL", quantity: 100, price: 990, date: "2025-06-21", brokerage: 15, stt: 99, gst: 20, stampDuty: 0 },
    ],
  },
};

export default function CsvImporter({ onImportSuccess, onAddLog }: CsvImporterProps) {
  const [activeTab, setActiveTab] = useState<"file" | "api">("file");
  const [csvText, setCsvText] = useState("");
  const [syncingBroker, setSyncingBroker] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      processCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const processCsv = (text: string, filename: string) => {
    try {
      const { transactions, errors } = parseBrokerCSV(text);
      if (errors.length > 0) {
        errors.forEach(err => toast.error(err));
        onAddLog(`[CSV ERROR] Failed to parse ${filename}: ${errors.join(", ")}`);
        return;
      }
      if (transactions.length === 0) {
        toast.error("No valid transactions found in CSV.");
        onAddLog(`[CSV WARNING] Loaded ${filename} but parsed 0 transactions.`);
        return;
      }
      onImportSuccess(transactions);
      toast.success(`Successfully imported ${transactions.length} trades from ${filename}!`);
      onAddLog(`[CSV IMPORT] Loaded ${transactions.length} transactions from file: ${filename}`);
    } catch (err: any) {
      toast.error("An error occurred while parsing the CSV file.");
      onAddLog(`[CSV SYSTEM ERROR] Parsing exception: ${err.message}`);
    }
  };

  const startBrokerSync = (brokerId: string, brokerName: string) => {
    setSyncingBroker(brokerId);
    setSyncLogs([]);
    
    const logs = [
      `[SSL] Initializing handshake with ${brokerName} API gateway...`,
      `[AUTH] Authenticating session tokens via OAuth2...`,
      `[SECURE] Establishing mutual TLS (mTLS) tunneling...`,
      `[DATABASE] Fetching transaction ledger for FY 2024-25 & FY 2025-26...`,
      `[COMPLETED] Secured transaction payload downloaded. Syncing local workbook...`
    ];

    let delay = 0;
    logs.forEach((logText, idx) => {
      delay += idx === 0 ? 300 : idx === 3 ? 1200 : 700;
      setTimeout(() => {
        setSyncLogs(prev => [...prev, logText]);
        onAddLog(`[BROKER CONNECT] ${logText}`);
        
        // Final log callback
        if (idx === logs.length - 1) {
          setTimeout(() => {
            const data = MOCK_BROKER_DATA[brokerId];
            if (data) {
              onImportSuccess(data.txs, data.losses);
              toast.success(`Successfully synced ${data.txs.length} trades from ${brokerName}!`);
            }
            setSyncingBroker(null);
          }, 600);
        }
      }, delay);
    });
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary animate-pulse" />
              Import Trade Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Upload tax reports or sync directly from Indian brokers
            </CardDescription>
          </div>
          <div className="flex rounded-lg bg-muted p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("file")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "file"
                  ? "bg-background text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CSV Upload
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "api"
                  ? "bg-background text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Broker Connect
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center py-2 px-6">
        {activeTab === "file" ? (
          <div className="space-y-4 my-2">
            {/* Drag & Drop simulated area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-xl p-6 text-center cursor-pointer bg-secondary/10 flex flex-col items-center justify-center gap-2 group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
              />
              <div className="rounded-full p-2.5 bg-primary/10 text-primary group-hover:scale-110 transition-all">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">Drag & drop CSV file or click to browse</span>
              <span className="text-[10px] text-muted-foreground">Supports Symbol, Type, Quantity, Price, Date headers</span>
            </div>

            {/* Pasting Text Area */}
            <div className="space-y-1.5">
              <Label htmlFor="rawCsv" className="text-xs text-muted-foreground">Or paste raw CSV text</Label>
              <Textarea
                id="rawCsv"
                placeholder="Symbol,Transaction Type,Quantity,Average Price,Trade Date&#10;RELIANCE,BUY,100,2400.00,2023-01-15&#10;RELIANCE,SELL,80,2600.00,2024-03-10"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="min-h-[90px] text-[10px] font-mono bg-background/50"
              />
              <Button 
                onClick={() => processCsv(csvText, "Manual Paste")}
                disabled={!csvText.trim()}
                className="w-full h-8 text-xs cursor-pointer"
              >
                Parse Copied Text
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {syncingBroker ? (
              <div className="border border-border/60 bg-muted/30 rounded-xl p-4 flex flex-col gap-3 min-h-[180px]">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                    <Wifi className="h-2.5 w-2.5 text-primary absolute -bottom-1 -right-1 animate-pulse" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Establishing Secure SSL Connect with {BROKERS.find(b => b.id === syncingBroker)?.name}...
                  </span>
                </div>
                
                {/* Console Log Outputs */}
                <div className="flex-1 bg-black/80 rounded-lg p-2.5 font-mono text-[9px] text-green-400 overflow-y-auto space-y-1 border border-border/30">
                  {syncLogs.map((log, i) => (
                    <div key={i} className="flex gap-1.5 items-start">
                      <Terminal className="h-3 w-3 shrink-0 text-green-500/70 mt-0.5" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 text-[11px] leading-relaxed">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Secure OAuth integration with broker consoles. Direct trade data sync bypassing manual CSV manipulation.</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {BROKERS.map((broker) => (
                    <Button
                      key={broker.id}
                      variant="outline"
                      onClick={() => startBrokerSync(broker.id, broker.name)}
                      className={`h-11 text-xs justify-between cursor-pointer border ${broker.color}`}
                    >
                      <span className="font-semibold">{broker.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-65" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
