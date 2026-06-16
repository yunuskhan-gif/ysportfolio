import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  LOANS_QUERY_KEY,
  saveLoan,
  type Loan,
} from "@/lib/portfolio-api";

interface LoanFormState {
  bank: string;
  sanctionLoan: string;
  type: string;
  emi: string;
  outstanding: string;
}

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoanAdded?: () => void;
  initialLoan?: Loan | null;
  editId?: string | null;
}

const INITIAL_FORM: LoanFormState = {
  bank: "",
  sanctionLoan: "",
  type: "PERSONAL LOAN",
  emi: "",
  outstanding: "",
};

const LOAN_TYPES = [
  "PERSONAL LOAN",
  "CREDIT CARD",
  "HOME LOAN",
  "AUTO LOAN",
  "EDUCATION LOAN",
  "BUSINESS LOAN",
  "GOLD LOAN",
  "OTHER",
];

export default function AddLoanDialog({
  open,
  onOpenChange,
  onLoanAdded,
  initialLoan = null,
  editId = null,
}: AddLoanDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(editId);
  const [formState, setFormState] = useState<LoanFormState>(INITIAL_FORM);

  const saveLoanMutation = useMutation({
    mutationFn: ({ loan, id }: { loan: Loan; id?: string | null }) =>
      saveLoan(loan, id),
  });

  const handleFormChange = (field: keyof LoanFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const resetDialogState = () => {
    setFormState(INITIAL_FORM);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!open) return;

    if (initialLoan) {
      setFormState({
        bank: initialLoan.bank,
        sanctionLoan: String(initialLoan.sanctionLoan),
        type: initialLoan.type,
        emi: String(initialLoan.emi),
        outstanding: String(initialLoan.outstanding),
      });
      return;
    }

    resetDialogState();
  }, [initialLoan, open]);

  const handleSubmit = async () => {
    const bank = formState.bank.trim();
    const type = formState.type.trim() || "PERSONAL LOAN";
    const sanctionLoan = Number(formState.sanctionLoan);
    const emi = Number(formState.emi);
    const outstanding = Number(formState.outstanding);

    if (!bank || sanctionLoan <= 0 || emi < 0 || outstanding < 0) {
      toast.error("Please fill in valid loan details.");
      return;
    }

    const nextLoan: Loan = {
      bank,
      sanctionLoan,
      type,
      emi,
      outstanding,
    };

    try {
      await saveLoanMutation.mutateAsync({ loan: nextLoan, id: editId });
      await queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success(isEditMode ? "Loan updated." : "Loan added.");
      resetDialogState();
      onOpenChange(false);
      onLoanAdded?.();
    } catch (error) {
      toast.error("Failed to save loan.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
            {isEditMode ? "Edit Loan details" : "Add New Loan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="loan-bank" className="text-xs font-bold uppercase text-muted-foreground">Bank Name / Lender</Label>
              <Input
                id="loan-bank"
                value={formState.bank}
                onChange={(event) => handleFormChange("bank", event.target.value)}
                placeholder="e.g. AXIS BANK"
                className="h-10 sm:h-11 uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loan-sanction" className="text-xs font-bold uppercase text-muted-foreground">Sanctioned Amount</Label>
                <Input
                  id="loan-sanction"
                  type="number"
                  value={formState.sanctionLoan}
                  onChange={(event) => handleFormChange("sanctionLoan", event.target.value)}
                  placeholder="e.g. 400000"
                  className="h-10 sm:h-11 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loan-outstanding" className="text-xs font-bold uppercase text-muted-foreground">Outstanding Amount</Label>
                <Input
                  id="loan-outstanding"
                  type="number"
                  value={formState.outstanding}
                  onChange={(event) => handleFormChange("outstanding", event.target.value)}
                  placeholder="e.g. 100000"
                  className="h-10 sm:h-11 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loan-emi" className="text-xs font-bold uppercase text-muted-foreground">Monthly EMI</Label>
                <Input
                  id="loan-emi"
                  type="number"
                  value={formState.emi}
                  onChange={(event) => handleFormChange("emi", event.target.value)}
                  placeholder="e.g. 9000"
                  className="h-10 sm:h-11 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loan-type" className="text-xs font-bold uppercase text-muted-foreground">Loan Type</Label>
                <select
                  id="loan-type"
                  value={formState.type}
                  onChange={(event) => handleFormChange("type", event.target.value)}
                  className="flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                >
                  {LOAN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => handleClose(false)} className="flex-1 h-11 rounded-xl font-bold">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saveLoanMutation.isPending} className="flex-1 h-11 rounded-xl font-bold">
            {saveLoanMutation.isPending ? "Saving..." : isEditMode ? "Update" : "Add Loan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
