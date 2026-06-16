import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  deleteOtherInvestment,
  fetchOtherInvestments,
  OTHER_INVESTMENTS_QUERY_KEY,
  replaceOtherInvestments,
  saveOtherInvestment,
  type OtherInvestment,
} from "@/lib/portfolio-api";
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Edit2,
  Plus,
  Clipboard,
  Briefcase,
} from "lucide-react";

type SortField = "particulars" | "amount";
type SortDirection = "asc" | "desc";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const Shimmer = () => (
  <div className="w-full space-y-4 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="shadow-none">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="shadow-none">
      <div className="p-4">
        <div className="rounded-md border p-4 bg-muted/10">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 pb-2 border-b">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-4 py-1">
                {Array.from({ length: 3 }).map((_, colIndex) => (
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

export default function OtherInvestments() {
  const queryClient = useQueryClient();
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("amount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OtherInvestment | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog fields
  const [particularsVal, setParticularsVal] = useState("");
  const [amountVal, setAmountVal] = useState("");

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: OTHER_INVESTMENTS_QUERY_KEY,
    queryFn: fetchOtherInvestments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOtherInvestment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OTHER_INVESTMENTS_QUERY_KEY });
      toast.success("Asset deleted.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete asset.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ item, id }: { item: OtherInvestment; id?: string | null }) =>
      saveOtherInvestment(item, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OTHER_INVESTMENTS_QUERY_KEY });
      toast.success(selectedId ? "Asset updated." : "Asset added.");
      setIsAddOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save asset.");
    },
  });

  const replaceMutation = useMutation({
    mutationFn: replaceOtherInvestments,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: OTHER_INVESTMENTS_QUERY_KEY });
      setSelectedIds([]);
      toast.success(
        variables.length === 0 ? "All assets deleted." : "Selected assets deleted."
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update assets.");
    },
  });

  const filtered = useMemo(() => {
    return items
      .filter((item) =>
        item.particulars.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [items, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedItems = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage]);

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const activeCount = items.length;

  const selectedOnPageCount = paginatedItems.filter((item) =>
    item.id ? selectedIds.includes(item.id) : false
  ).length;
  const allOnPageSelected =
    paginatedItems.length > 0 && selectedOnPageCount === paginatedItems.length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  const handleDeleteItem = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this asset?")) {
      await deleteMutation.mutateAsync(id);
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    }
  };

  const toggleSelection = (id?: string) => {
    if (!id) return;
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = paginatedItems.map((item) => item.id).filter(Boolean) as string[];
    if (pageIds.length === 0) return;

    setSelectedIds((current) =>
      allOnPageSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select assets first.");
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected assets?`)) {
      const remainingItems = items.filter((item) => !item.id || !selectedIds.includes(item.id));
      await replaceMutation.mutateAsync(
        remainingItems.map(({ id, ...item }) => item)
      );
    }
  };

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      toast.error("No assets to delete.");
      return;
    }

    if (confirm("Are you sure you want to delete ALL assets? This cannot be undone.")) {
      await replaceMutation.mutateAsync([]);
    }
  };

  const handleEditItem = (item: OtherInvestment) => {
    setSelectedItem(item);
    setSelectedId(item.id || null);
    setParticularsVal(item.particulars);
    setAmountVal(item.amount.toString());
    setIsAddOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedItem(null);
    setSelectedId(null);
    setParticularsVal("");
    setAmountVal("");
    setIsAddOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const particulars = particularsVal.trim();
    const amount = Number(amountVal);

    if (!particulars || isNaN(amount) || amount < 0) {
      toast.error("Please provide valid particulars and amount.");
      return;
    }

    await saveMutation.mutateAsync({
      item: { particulars, amount },
      id: selectedId,
    });
  };

  const handleCopyTable = async () => {
    try {
      if (!items || items.length === 0) {
        toast.error("No asset data to copy.");
        return;
      }

      const headers = ["Particulars", "Amount"];
      const rows = items.map((item) => [item.particulars, item.amount]);
      const content = [headers, ...rows].map((r) => r.join("\t")).join("\n");

      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
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
    return <Shimmer />;
  }

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Total Value */}
        <Card className="shadow-none border-border relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Other Investments</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mt-1">
                {formatINR(totalAmount)}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Combined other asset value</p>
          </CardContent>
          <div className="absolute right-3 top-3 text-muted-foreground/10 pointer-events-none">
            <Briefcase className="h-12 w-12" />
          </div>
        </Card>

        {/* Card 2: Count */}
        <Card className="shadow-none border-border relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Assets</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                {activeCount}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Number of registered assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Table & Controls */}
      <Card className="shadow-none border-border">
        <div className="px-3 py-3">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1 text-xs font-bold uppercase tracking-tighter"
                onClick={handleAddNewClick}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Asset
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={async () => {
                  await queryClient.invalidateQueries({ queryKey: OTHER_INVESTMENTS_QUERY_KEY });
                  toast.success("Refreshed!");
                }}
                title="Refresh list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search particulars..."
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
                    Delete All Assets
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {paginatedItems.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg">
              <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium">No other investments found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click "Add Asset" to start tracking other investment assets.
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
                    <th className="text-left px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("particulars")}>
                      <div className="flex items-center gap-1">
                        Particulars
                        <SortIcon field="particulars" />
                      </div>
                    </th>
                    <th className="text-right px-4 py-2.5 font-bold uppercase tracking-tight text-muted-foreground select-none cursor-pointer" onClick={() => handleSort("amount")}>
                      <div className="flex items-center gap-1 justify-end">
                        Amount
                        <SortIcon field="amount" />
                      </div>
                    </th>
                    <th className="w-20 text-center py-2.5 font-bold uppercase tracking-tight text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                      <td className="text-center py-2.5">
                        <input
                          type="checkbox"
                          checked={item.id ? selectedIds.includes(item.id) : false}
                          onChange={() => toggleSelection(item.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-bold uppercase">{item.particulars}</td>
                      <td className="px-4 py-2.5 text-right font-black text-primary tabular-nums">
                        {formatINR(item.amount)}
                      </td>
                      <td className="text-center py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteItem(item.id)}
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

      {/* Add / Edit Dialog (Simulated) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="pb-3 border-b px-4 py-3">
              <CardTitle className="text-sm font-bold">
                {selectedId ? "Edit Asset Details" : "Add New Asset"}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Particulars <span className="text-destructive">*</span></label>
                  <Input
                    autoFocus
                    required
                    value={particularsVal}
                    onChange={(e) => setParticularsVal(e.target.value)}
                    placeholder="e.g. Gold, Real Estate, Crypto"
                    className="h-10 text-sm font-semibold uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Amount (₹) <span className="text-destructive">*</span></label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={amountVal}
                    onChange={(e) => setAmountVal(e.target.value)}
                    placeholder="0.00"
                    className="h-10 text-sm font-bold tabular-nums"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-10 rounded-xl font-bold text-xs sm:text-sm"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-10 rounded-xl font-bold text-xs sm:text-sm"
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
