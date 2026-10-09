"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, History, Check, ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import type { Loan } from "@/lib/portfolio-api";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface LoanPaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan | null;
}

export default function LoanPaymentHistoryDialog({
  open,
  onOpenChange,
  loan,
}: LoanPaymentHistoryDialogProps) {
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  if (!loan) return null;

  const payments = loan.payments || [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleCopy = async (utr: string) => {
    try {
      await navigator.clipboard.writeText(utr);
      setCopiedUtr(utr);
      toast.success("UTR copied to clipboard!");
      setTimeout(() => setCopiedUtr(null), 2000);
    } catch {
      toast.error("Failed to copy UTR.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] p-4 sm:p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                EMI Installment & UTR Payment Records
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {loan.bank} • {loan.type} • Monthly EMI: {formatINR(loan.emi)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="p-2.5 rounded-lg border bg-muted/20 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Payments</p>
            <p className="text-sm font-bold text-foreground">{payments.length} Kist</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-muted/20 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Paid</p>
            <p className="text-sm font-bold text-emerald-600">{formatINR(totalPaid)}</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-muted/20 text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Remaining Debt</p>
            <p className="text-sm font-bold text-orange-500">{formatINR(loan.outstanding)}</p>
          </div>
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto min-h-[200px] border rounded-lg bg-card">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <ReceiptText className="w-8 h-8 opacity-25 mb-2" />
              <p className="text-xs font-semibold">No EMI payment records found yet.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Click "Pay EMI" to record payments with UTR reference numbers.
              </p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 sticky top-0">
                  <th className="text-left px-3 py-2 font-bold uppercase text-[10px] text-muted-foreground">Date</th>
                  <th className="text-right px-3 py-2 font-bold uppercase text-[10px] text-muted-foreground">Amount</th>
                  <th className="text-left px-3 py-2 font-bold uppercase text-[10px] text-muted-foreground">UTR / Ref No.</th>
                  <th className="text-left px-3 py-2 font-bold uppercase text-[10px] text-muted-foreground">Mode & Remarks</th>
                </tr>
              </thead>
              <tbody>
                {[...payments]
                  .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                  .map((p, idx) => (
                    <tr key={p.id || idx} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-3 py-2 font-semibold">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-600 tabular-nums">
                        {formatINR(p.amount)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-foreground text-[11px] select-all">
                            {p.utrNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.utrNumber)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy UTR"
                          >
                            {copiedUtr === p.utrNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 mr-1.5 font-medium">
                          {p.paymentMode || "Auto Debit"}
                        </Badge>
                        {p.remarks && (
                          <span className="text-[11px] text-muted-foreground truncate inline-block max-w-[120px]" title={p.remarks}>
                            {p.remarks}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-bold">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
