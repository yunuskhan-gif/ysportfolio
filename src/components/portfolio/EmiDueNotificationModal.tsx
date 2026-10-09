"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellRing, Landmark, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import type { Loan } from "@/lib/portfolio-api";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface EmiDueNotificationModalProps {
  loans: Loan[];
  onPayEmi: (loan: Loan) => void;
}

export default function EmiDueNotificationModal({
  loans,
  onPayEmi,
}: EmiDueNotificationModalProps) {
  const [open, setOpen] = useState(false);
  const [dueLoans, setDueLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (!loans || loans.length === 0) return;

    const todayDate = new Date().getDate(); // 1 - 31
    const matchingLoans = loans.filter((loan) => {
      const loanEmiDay = Number(loan.emiDay ?? 5);
      // Check if due day is today and outstanding is > 0
      return loanEmiDay === todayDate && loan.outstanding > 0;
    });

    if (matchingLoans.length > 0) {
      // Check session storage so it doesn't annoy user on every re-render
      const sessionKey = `emi_alert_dismissed_${new Date().toISOString().split("T")[0]}`;
      const dismissed = sessionStorage.getItem(sessionKey);
      if (!dismissed) {
        setDueLoans(matchingLoans);
        setOpen(true);
      }
    }
  }, [loans]);

  const handleDismiss = () => {
    const sessionKey = `emi_alert_dismissed_${new Date().toISOString().split("T")[0]}`;
    sessionStorage.setItem(sessionKey, "true");
    setOpen(false);
  };

  const handlePayClick = (loan: Loan) => {
    setOpen(false);
    onPayEmi(loan);
  };

  if (dueLoans.length === 0) return null;

  const totalDueToday = dueLoans.reduce((sum, l) => sum + l.emi, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] max-w-[500px] p-5 sm:p-6 border-amber-500/30 bg-card">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                EMI Deduction Alert — Due Today!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Aaj ke din ({new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}) aapki EMI debit honi hai.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-bold">Important Balance Reminder:</span> Apne bank account mein sufficient balance rakhein taaki NACH/ECS bounce charges na lagein.
          </div>
        </div>

        {/* Total due summary */}
        <div className="p-3 rounded-lg bg-muted/40 border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total EMI Due Today</p>
            <p className="text-lg font-bold text-destructive">{formatINR(totalDueToday)}</p>
          </div>
          <Badge variant="destructive" className="font-bold text-xs uppercase px-2.5 py-1">
            {dueLoans.length} Loan{dueLoans.length > 1 ? "s" : ""} Due
          </Badge>
        </div>

        {/* Due Loans List */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {dueLoans.map((loan) => (
            <div
              key={loan.id}
              className="p-3 rounded-xl border bg-card/80 hover:bg-muted/30 transition-all flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-xs uppercase tracking-tight">{loan.bank}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    {loan.type}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>EMI: <strong className="text-foreground">{formatINR(loan.emi)}</strong></span>
                  <span>•</span>
                  <span>Outstanding: {formatINR(loan.outstanding)}</span>
                </div>
              </div>

              <Button
                size="sm"
                className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-shrink-0 shadow-sm"
                onClick={() => handlePayClick(loan)}
              >
                <span>Pay EMI</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 h-10 rounded-xl font-bold text-xs"
          >
            Dismiss for Today
          </Button>
          <Button
            onClick={() => handlePayClick(dueLoans[0])}
            className="flex-1 h-10 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Update / Pay First EMI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
