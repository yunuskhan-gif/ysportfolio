"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Lock, CheckCircle2, Landmark, ReceiptText } from "lucide-react";
import { LOANS_QUERY_KEY, saveLoan, type Loan, type LoanPayment } from "@/lib/portfolio-api";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface PayEmiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan | null;
  onPaymentRecorded?: () => void;
}

export default function PayEmiDialog({
  open,
  onOpenChange,
  loan,
  onPaymentRecorded,
}: PayEmiDialogProps) {
  const queryClient = useQueryClient();

  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("Auto Debit");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setUtrNumber("");
      setPaymentMode("Auto Debit");
      setRemarks("");
      setIsSubmitting(false);
    }
  }, [open]);

  if (!loan) return null;

  const exactEmiAmount = loan.emi;
  const currentOutstanding = loan.outstanding;
  const newOutstanding = Math.max(0, currentOutstanding - exactEmiAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUtr = utrNumber.trim();
    if (!trimmedUtr) {
      toast.error("Please enter UTR / Transaction Reference Number.");
      return;
    }

    if (!paymentDate) {
      toast.error("Please select a valid payment date.");
      return;
    }

    setIsSubmitting(true);

    const newPayment: LoanPayment = {
      amount: exactEmiAmount,
      paymentDate,
      utrNumber: trimmedUtr,
      paymentMode,
      remarks: remarks.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [...(loan.payments || []), newPayment];

    const updatedLoan: Loan = {
      ...loan,
      outstanding: newOutstanding,
      payments: updatedPayments,
    };

    try {
      await saveLoan(updatedLoan, loan.id);
      await queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success(
        `EMI of ${formatINR(exactEmiAmount)} recorded! UTR: ${trimmedUtr}. New Outstanding: ${formatINR(newOutstanding)}`,
        { duration: 5000 }
      );
      onOpenChange(false);
      onPaymentRecorded?.();
    } catch (err) {
      toast.error("Failed to record EMI payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[480px] p-4 sm:p-6">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Pay / Record EMI Installment (Kist)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {loan.bank} • {loan.type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Loan Overview Banner */}
          <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Outstanding</p>
              <p className="text-sm font-bold text-orange-500">{formatINR(currentOutstanding)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">After This Payment</p>
              <p className="text-sm font-bold text-emerald-600">{formatINR(newOutstanding)}</p>
            </div>
          </div>

          {/* Locked Exact EMI Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                EMI Installment Amount (₹)
              </Label>
              <Badge variant="outline" className="text-[10px] gap-1 font-semibold border-emerald-500/30 text-emerald-600 bg-emerald-50/50">
                <Lock className="w-2.5 h-2.5" /> Locked to Exact EMI
              </Badge>
            </div>
            <div className="relative">
              <Input
                type="text"
                readOnly
                value={formatINR(exactEmiAmount)}
                className="h-10 text-base font-bold tabular-nums bg-muted/40 cursor-not-allowed border-emerald-500/30 text-emerald-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                Fixed Amount
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Amount exact scheduled EMI ke barabar locked hai taaki galti na ho.
            </p>
          </div>

          {/* UTR / Transaction Ref Number */}
          <div className="space-y-1.5">
            <Label htmlFor="emi-utr" className="text-xs font-bold uppercase text-foreground">
              UTR / Transaction Reference Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="emi-utr"
              required
              autoFocus
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. UTR / IMPS / UPI Ref / Cheque No."
              className="h-10 font-mono text-sm font-semibold uppercase tracking-wider"
            />
            <p className="text-[10px] text-muted-foreground">
              Bank reference ya UTR number save rahega future proof aur record ke liye.
            </p>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="emi-date" className="text-xs font-bold uppercase text-muted-foreground">
                Payment Date
              </Label>
              <Input
                id="emi-date"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-9 text-xs font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emi-mode" className="text-xs font-bold uppercase text-muted-foreground">
                Payment Mode
              </Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger id="emi-mode" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto Debit">Auto Debit (NACH/eNACH)</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Cash">Cash / Counter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="emi-remarks" className="text-xs font-bold uppercase text-muted-foreground">
              Remarks (Optional)
            </Label>
            <Input
              id="emi-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Debited from Axis Bank salary account"
              className="h-9 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !utrNumber.trim()}
              className="flex-1 h-10 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Saving Record..." : "Confirm & Record EMI"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
