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
import {
  replaceLoans,
  fetchLoans,
  LOANS_QUERY_KEY,
  type Loan,
} from "@/lib/portfolio-api";

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

interface LoansExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUploaded: (data: Loan[]) => void;
}

export default function LoansExcelUploadDialog({
  open,
  onOpenChange,
  onDataUploaded,
}: LoansExcelUploadDialogProps) {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<Loan[]>([]);
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

        const loans: Loan[] = [];
        for (const row of rows) {
          const keys = Object.keys(row);
          const bankKey = findColumn(keys, [/^bank$/, /^bank name$/, /^lender$/, /^lender name$/]) || keys[0];
          const sanctionKey = findColumn(keys, [
            /^sanction loan$/,
            /^sanctioned loan$/,
            /^sanctioned$/,
            /^sanction amount$/,
            /^loan amount$/,
          ]);
          const typeKey = findColumn(keys, [/^type$/, /^loan type$/, /^category$/]);
          const emiKey = findColumn(keys, [/^emi$/, /^monthly emi$/, /^installment$/]);
          const outstandingKey = findColumn(keys, [
            /^outstanding$/,
            /^outstanding loan$/,
            /^outstanding amount$/,
            /^balance$/,
            /^current balance$/,
          ]);

          const bank = String(row[bankKey] || "").trim();
          const sanctionLoan = parseNumber(row[sanctionKey || ""]);
          const type = typeKey ? String(row[typeKey] || "").trim().toUpperCase() : "PERSONAL LOAN";
          const emi = parseNumber(row[emiKey || ""]);
          const outstanding = parseNumber(row[outstandingKey || ""]);

          if (bank && sanctionLoan > 0) {
            loans.push({
              bank,
              sanctionLoan,
              type: type || "PERSONAL LOAN",
              emi,
              outstanding,
            });
          }
        }

        if (loans.length === 0) {
          setError("Could not find valid loan data. Make sure columns have Bank, Sanction Loan, Type, EMI, Outstanding.");
          toast.error("Could not find valid loan data in the file.");
          return;
        }

        setPreview(loans);
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
      const existingLoans = await fetchLoans();
      // Combine / Merge or replace. The user rules for portfolio data uploads usually suggest:
      // "non-destructive imports that isolate mutual funds from stock holdings" or "ExcelUploadDialog component to handle data merging"
      // For loans, merging based on Bank & Type is good, or simply appending, or overwriting if they prefer. Let's merge by bank & type so we don't duplicate, or just append. Let's merge:
      const mergedLoans = [...existingLoans];
      for (const item of preview) {
        const idx = mergedLoans.findIndex(
          (x) => x.bank.toUpperCase() === item.bank.toUpperCase() && x.type.toUpperCase() === item.type.toUpperCase()
        );
        if (idx !== -1) {
          mergedLoans[idx] = item; // Update existing
        } else {
          mergedLoans.push(item); // Add new
        }
      }

      await replaceLoans(mergedLoans);
      await queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success(`Imported/Merged ${preview.length} loans.`);
      onDataUploaded(preview);
      setPreview([]);
      setFileName(null);
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to save imported loans.");
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
          <DialogTitle className="text-sm font-semibold">Upload Loans Excel</DialogTitle>
          <DialogDescription className="text-xs">
            Upload your Excel/CSV file with columns: Bank, Sanction Loan, Type, EMI, Outstanding
          </DialogDescription>
        </DialogHeader>

        {preview.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
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
                <span className="text-[10px] text-muted-foreground">({preview.length} loans)</span>
              </div>
              <button onClick={handleReset} className="p-1 hover:bg-secondary rounded">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="rounded-md border max-h-52 overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Bank</th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Type</th>
                    <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Sanction</th>
                    <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">EMI</th>
                    <th className="text-right px-2 py-1.5 font-medium text-muted-foreground">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((l, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="px-2 py-1.5 font-bold uppercase">{l.bank}</td>
                      <td className="px-2 py-1.5 text-xs text-muted-foreground">{l.type}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">₹{l.sanctionLoan.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">₹{l.emi.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-orange-500">₹{l.outstanding.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button size="sm" className="w-full cursor-pointer" onClick={handleConfirm}>
              Import {preview.length} loans
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
