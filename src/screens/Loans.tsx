import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteLoan,
  fetchLoans,
  LOANS_QUERY_KEY,
  replaceLoans,
  type Loan,
} from "@/lib/portfolio-api";
import AddLoanDialog from "@/components/portfolio/AddLoanDialog";
import LoansExcelUploadDialog from "@/components/portfolio/LoansExcelUploadDialog";
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Upload,
  Edit2,
  Copy,
  Plus,
  Download,
  FileSpreadsheet,
  Clipboard,
  Landmark,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";

type SortField = "bank" | "type" | "sanctionLoan" | "emi" | "outstanding";
type SortDirection = "asc" | "desc";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const LoansShimmer = () => (
  <div className="w-full space-y-4 animate-in fade-in duration-500">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-none">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-2 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="shadow-none">
      <div className="p-4">
        <div className="rounded-md border p-4 bg-muted/10">
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 pb-2 border-b">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-4 py-1">
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-8 w-full rounded-md" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default function Loans() {
  const queryClient = useQueryClient();
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("outstanding");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: loans = [], isLoading: loading } = useQuery({
    queryKey: LOANS_QUERY_KEY,
    queryFn: fetchLoans,
  });

  const deleteLoanMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      toast.success("Loan record deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete loan.");
    },
  });

  const replaceLoansMutation = useMutation({
    mutationFn: replaceLoans,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
      setSelectedIds([]);
      toast.success(
        variables.length === 0 ? "All loans deleted." : "Selected loans deleted."
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update loans.");
    },
  });

  const filtered = useMemo(() => {
    return loans
      .filter((loan) =>
        loan.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        return sortDirection === "asc"
          ? Number(aVal ?? 0) - Number(bVal ?? 0)
          : Number(bVal ?? 0) - Number(aVal ?? 0);
      });
  }, [loans, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedLoans = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage]);

  // Calculations
  const totalOutstanding = useMemo(() => loans.reduce((sum, l) => sum + l.outstanding, 0), [loans]);
  const totalSanctioned = useMemo(() => loans.reduce((sum, l) => sum + l.sanctionLoan, 0), [loans]);
  const totalEMI = useMemo(() => loans.reduce((sum, l) => sum + l.emi, 0), [loans]);
  const activeLoansCount = loans.length;

  const selectedOnPageCount = paginatedLoans.filter((loan) =>
    loan.id ? selectedIds.includes(loan.id) : false
  ).length;
  const allOnPageSelected =
    paginatedLoans.length > 0 && selectedOnPageCount === paginatedLoans.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  const handleDeleteLoan = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this loan record?")) {
      await deleteLoanMutation.mutateAsync(id);
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    }
  };

  const toggleLoanSelection = (id?: string) => {
    if (!id) return;
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = paginatedLoans.map((l) => l.id).filter(Boolean) as string[];
    if (pageIds.length === 0) return;

    setSelectedIds((current) =>
      allOnPageSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select loans first.");
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected loans?`)) {
      const remainingLoans = loans.filter((l) => !l.id || !selectedIds.includes(l.id));
      await replaceLoansMutation.mutateAsync(
        remainingLoans.map(({ id, ...l }) => l)
      );
    }
  };

  const handleDeleteAll = async () => {
    if (loans.length === 0) {
      toast.error("No loans to delete.");
      return;
    }

    if (confirm("Are you sure you want to delete ALL loans? This cannot be undone.")) {
      await replaceLoansMutation.mutateAsync([]);
    }
  };

  const handleEditLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setSelectedLoanId(loan.id || null);
    setIsAddLoanOpen(true);
  };

  const handleGlobalRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
    toast.success("Loans list refreshed!");
  };

  const handleExportExcel = () => {
    try {
      if (!loans || loans.length === 0) {
        toast.error("No loan data to export.");
        return;
      }

      const exportData = loans.map((l) => ({
        "Bank / Lender": l.bank,
        "Loan Type": l.type,
        "Sanctioned Amount": l.sanctionLoan,
        "Monthly EMI": l.emi,
        "Outstanding Amount": l.outstanding,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");

      const max_width = exportData.reduce((w, r) => Math.max(w, String(r["Bank / Lender"]).length), 12);
      worksheet["!cols"] = [{ wch: max_width }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];

      XLSX.writeFile(workbook, `Loans_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel file downloaded!");
    } catch (err) {
      toast.error("Failed to export Excel.");
    }
  };

  const handleCopyTable = async () => {
    try {
      if (!loans || loans.length === 0) {
        toast.error("No loan data to copy.");
        return;
      }

      const headers = ["Bank / Lender", "Loan Type", "Sanctioned Amount", "Monthly EMI", "Outstanding Amount"];
      const rows = loans.map((l) => [l.bank, l.type, l.sanctionLoan, l.emi, l.outstanding]);
      const content = [headers, ...rows].map((r) => r.join("\t")).join("\n");

      await navigator.clipboard.writeText(content);
      toast.success("Loans copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy table.");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="w-3 h-3 opacity-25" />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 text-primary font-bold" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary font-bold" />
    );
  };

  if (loading) {
    return <LoansShimmer />;
  }

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Outstanding Debt */}
        <Card className="shadow-none border-border relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Outstanding Debt</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-orange-500 mt-1">
                {formatINR(totalOutstanding)}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Current unpaid liabilities</p>
          </CardContent>
          <div className="absolute right-3 top-3 text-muted-foreground/10 pointer-events-none">
            <Landmark className="h-12 w-12" />
          </div>
        </Card>

        {/* Card 2: Sanctioned Limit */}
        <Card className="shadow-none border-border relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sanctioned Limit</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mt-1">
                {formatINR(totalSanctioned)}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Total approved borrowing</p>
          </CardContent>
        </Card>

        {/* Card 3: Monthly EMIs */}
        <Card className="shadow-none border-border relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly EMI burden</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-destructive mt-1">
                {formatINR(totalEMI)}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Combined monthly payments</p>
          </CardContent>
        </Card>

        {/* Card 4: Active Loan Accounts */}
        <Card className="shadow-none border-border relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Accounts</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                {activeLoansCount}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Total loans & credit cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Table & controls */}
      <Card className="shadow-none border-border">
        <div className="px-3 py-3">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1 text-xs font-bold uppercase tracking-tighter"
                onClick={() => {
                  setSelectedLoan(null);
                  setSelectedLoanId(null);
                  setIsAddLoanOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Loan
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs font-bold uppercase tracking-tighter"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Excel
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleGlobalRefresh}
                title="Refresh Loans list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search bank or loan type..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 h-8 text-xs w-full"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-bold uppercase tracking-tighter">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={handleExportExcel}>
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Export Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleCopyTable}>
                    <Clipboard className="w-3.5 h-3.5 mr-2" />
                    Copy to Clipboard
                  </DropdownMenuItem>
                  {selectedIds.length > 0 && (
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleDeleteSelected}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete Selected ({selectedIds.length})
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleDeleteAll}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete All Loans
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {paginatedLoans.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg">
              <Landmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium">No loans found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Upload an Excel sheet or click "Add Loan" to track your liabilities.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="w-10 text-center py-2.5">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                    </th>
                    <th className="text-left px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("bank")}>
                      <div className="flex items-center gap-1">
                        Bank / Lender
                        <SortIcon field="bank" />
                      </div>
                    </th>
                    <th className="text-left px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("type")}>
                      <div className="flex items-center gap-1">
                        Loan Type
                        <SortIcon field="type" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("sanctionLoan")}>
                      <div className="flex items-center gap-1 justify-end">
                        Sanctioned Loan
                        <SortIcon field="sanctionLoan" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("emi")}>
                      <div className="flex items-center gap-1 justify-end">
                        EMI
                        <SortIcon field="emi" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("outstanding")}>
                      <div className="flex items-center gap-1 justify-end">
                        Outstanding
                        <SortIcon field="outstanding" />
                      </div>
                    </th>
                    <th className="w-20 text-center py-2.5 font-bold uppercase tracking-tight text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoans.map((l) => (
                    <tr key={l.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                      <td className="text-center py-2.5">
                        <input
                          type="checkbox"
                          checked={l.id ? selectedIds.includes(l.id) : false}
                          onChange={() => toggleLoanSelection(l.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-bold uppercase">{l.bank}</td>
                      <td className="px-4 py-2.5 font-medium">
                        <Badge variant="outline" className="text-[10px] font-bold py-0.5">
                          {l.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                        {formatINR(l.sanctionLoan)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-destructive tabular-nums">
                        {formatINR(l.emi)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-orange-500 tabular-nums">
                        {formatINR(l.outstanding)}
                      </td>
                      <td className="text-center py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => handleEditLoan(l)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteLoan(l.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-[11px] text-muted-foreground">
                Page {currentPage} of {totalPages} ({filtered.length} items)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-7 text-xs font-bold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-7 text-xs font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dialogs */}
      <AddLoanDialog
        open={isAddLoanOpen}
        onOpenChange={setIsAddLoanOpen}
        editId={selectedLoanId}
        initialLoan={selectedLoan}
      />
      <LoansExcelUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onDataUploaded={() => {
          queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
        }}
      />
    </div>
  );
}
