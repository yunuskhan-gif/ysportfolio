import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { EQUITY_SYMBOLS } from "@/constants/symbols";
import {
  replaceHoldings,
  fetchHoldings,
  HOLDINGS_QUERY_KEY,
  type StockHolding,
} from "@/lib/portfolio-api";
import { isMutualFund } from "@/lib/utils";
const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseNumber = (value: unknown) => {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  return cleaned ? Number(cleaned) : 0;
};

const findColumn = (keys: string[], patterns: RegExp[]) =>
  keys.find((key) => patterns.some((pattern) => pattern.test(normalizeHeader(key))));

// Map common stock names to Yahoo Finance symbols
const guessSymbol = (name: string): string => {
  const clean = name.trim().toUpperCase().replace(/\s+/g, "");
  const matchedStock = EQUITY_SYMBOLS.find((stock) => {
    const stockName = stock.n.trim().toUpperCase().replace(/\s+/g, "");
    const stockSymbol = stock.s.trim().toUpperCase();
    return stockName === clean || stockSymbol === clean;
  });

  return `${(matchedStock?.s || clean).replace(/\.NS$/i, "")}.NS`;
};

export const saveHoldings = async (holdings: StockHolding[]) => replaceHoldings(holdings);

export const loadHoldings = async (): Promise<StockHolding[]> => fetchHoldings();

export const clearHoldings = async () => replaceHoldings([]);

interface ExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUploaded: (data: StockHolding[]) => void;
  uploadType?: "all" | "mf" | "stock";
}

export default function ExcelUploadDialog({ open, onOpenChange, onDataUploaded, uploadType = "all" }: ExcelUploadDialogProps) {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<StockHolding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseExcel = (file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
          setError("No data found in the sheet");
          toast.error("No data found in the uploaded sheet.");
          return;
        }

        // Try to map columns
        const holdings: StockHolding[] = [];
        for (const row of rows) {
          const keys = Object.keys(row);
          const nameKey =
            findColumn(keys, [/^stock name$/, /^name$/, /security/, /scheme/, /company/]) ||
            keys[0];
          const qtyKey = findColumn(keys, [
            /^qty$/,
            /^quantity$/,
            /^total qty$/,
            /^buy qty$/,
            /^units$/,
          ]);
          const avgKey = findColumn(keys, [
            /^avg price$/,
            /^average price$/,
            /^avg price2$/,
            /^purchase price$/,
            /^buy price$/,
            /^cost price$/,
            /^nav$/,
          ]);
          const appKey = findColumn(keys, [/^app$/, /broker/, /source/, /platform/, /folio/]);

          const name = String(row[nameKey] || "").trim();
          const qty = parseNumber(row[qtyKey || ""]);
          const avgPrice = parseNumber(row[avgKey || ""]);
          const app = appKey ? String(row[appKey] || "").trim() : "Excel";

          if (name && qty > 0 && avgPrice > 0) {
            holdings.push({
              symbol: guessSymbol(name),
              name,
              qty,
              avgPrice,
              app
            });
          }
        }

        if (holdings.length === 0) {
          setError("Could not find valid stock data. Make sure columns have Name, Quantity, Avg Price.");
          toast.error("Could not find valid stock data in the file.");
          return;
        }

        setPreview(holdings);
      } catch (err) {
        setError("Failed to parse Excel file");
        toast.error("Failed to parse Excel file.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Please upload .xlsx, .xls or .csv file");
      toast.error("Please upload an .xlsx, .xls or .csv file.");
      return;
    }
    parseExcel(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = async () => {
    try {
      const existingHoldings = await loadHoldings();
      let finalHoldings = preview;
      
      if (uploadType === "mf") {
        const oldStocks = existingHoldings.filter(h => !isMutualFund(h.symbol));
        finalHoldings = [...oldStocks, ...preview];
      } else if (uploadType === "stock") {
        const oldMFs = existingHoldings.filter(h => isMutualFund(h.symbol));
        finalHoldings = [...oldMFs, ...preview];
      }

      await saveHoldings(finalHoldings);
      await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      toast.success(`Imported ${preview.length} holdings.`);
      onDataUploaded(preview);
      setPreview([]);
      setFileName(null);
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to save imported holdings.");
    }
  };

  const handleReset = () => {
    setPreview([]);
    setFileName(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Upload Portfolio</DialogTitle>
          <DialogDescription className="text-xs">
            Upload your Excel/CSV file with columns: Name, Quantity, Avg Price
          </DialogDescription>
        </DialogHeader>

        {preview.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Drop your file here or click to browse</p>
            <p className="text-[10px] text-muted-foreground mt-1">.xlsx, .xls, .csv</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium">{fileName}</span>
                <span className="text-[10px] text-muted-foreground">({preview.length} stocks)</span>
              </div>
              <button onClick={handleReset} className="p-1 hover:bg-secondary rounded">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="rounded-md border max-h-52 overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Name</th>
                    <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((h, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="px-2 py-1.5">{h.name}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{h.qty}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">₹{h.avgPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button size="sm" className="w-full cursor-pointer" onClick={handleConfirm}>
              Import {preview.length} stocks
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
