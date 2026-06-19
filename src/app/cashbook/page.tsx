"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, Trash2, Calendar, BookOpen, Download, FileSpreadsheet, Clipboard, RefreshCw, Check, X, Edit } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCashbookAccounts,
  saveCashbookAccount,
  deleteCashbookAccount,
  fetchCashbookEntries,
  saveCashbookEntry,
  deleteCashbookEntry,
  CASHBOOK_ACCOUNTS_QUERY_KEY,
  CASHBOOK_ENTRIES_QUERY_KEY,
  type CashbookAccount,
  type CashbookEntry
} from "@/lib/portfolio-api";

export default function CashBookPage() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: CASHBOOK_ACCOUNTS_QUERY_KEY,
    queryFn: fetchCashbookAccounts,
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: CASHBOOK_ENTRIES_QUERY_KEY,
    queryFn: fetchCashbookEntries,
  });

  const [selectedAccount, setSelectedAccount] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("ALL");

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState<"CASH_IN" | "CASH_OUT" | null>(null);

  const [accountName, setAccountName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountOpeningBalance, setAccountOpeningBalance] = useState("");

  const [entryAmount, setEntryAmount] = useState("");
  const [entryRemark, setEntryRemark] = useState("");
  const [entryPaymentMode, setEntryPaymentMode] = useState("Cash");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [entryAccountId, setEntryAccountId] = useState("");

  const [isEditingOB, setIsEditingOB] = useState(false);
  const [tempOpeningBalance, setTempOpeningBalance] = useState("");

  // mutations
  const addAccountMutation = useMutation({
    mutationFn: (newAcc: CashbookAccount) => saveCashbookAccount(newAcc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASHBOOK_ACCOUNTS_QUERY_KEY });
      toast.success("Account added successfully!");
    },
    onError: () => toast.error("Failed to add account"),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => deleteCashbookAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASHBOOK_ACCOUNTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CASHBOOK_ENTRIES_QUERY_KEY });
      toast.success("Account deleted successfully!");
      setSelectedAccount("ALL");
    },
    onError: () => toast.error("Failed to delete account"),
  });

  const addEntryMutation = useMutation({
    mutationFn: (newEntry: CashbookEntry) => saveCashbookEntry(newEntry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASHBOOK_ENTRIES_QUERY_KEY });
      toast.success("Entry added successfully!");
    },
    onError: () => toast.error("Failed to add entry"),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: string) => deleteCashbookEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASHBOOK_ENTRIES_QUERY_KEY });
      toast.success("Entry deleted successfully!");
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  const updateAccountOBMutation = useMutation({
    mutationFn: ({ account, id }: { account: CashbookAccount; id: string }) => saveCashbookAccount(account, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CASHBOOK_ACCOUNTS_QUERY_KEY });
      toast.success("Opening balance updated successfully!");
    },
    onError: () => toast.error("Failed to update opening balance"),
  });

  // Set default account when entry dialog opens
  useEffect(() => {
    if (showAddEntry) {
      if (selectedAccount !== "ALL") {
        setEntryAccountId(selectedAccount);
      } else if (accounts.length > 0) {
        setEntryAccountId(accounts[0].id || "");
      }
    }
  }, [showAddEntry, selectedAccount, accounts]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName) return;
    
    const opBal = parseFloat(accountOpeningBalance) || 0;
    
    const res = await addAccountMutation.mutateAsync({
      name: accountName,
      phone: accountPhone,
      openingBalance: opBal,
    });
    
    setShowAddAccount(false);
    setAccountName("");
    setAccountPhone("");
    setAccountOpeningBalance("");

    if (res && res.length > 0) {
      const newAcc = res.find(a => a.name === accountName);
      if (newAcc && newAcc.id) {
        setSelectedAccount(newAcc.id);
      }
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (id === "ALL") return;
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    if (!window.confirm(`Are you sure you want to delete "${account.name}"? All entries associated with this account will be permanently deleted.`)) return;
    await deleteAccountMutation.mutateAsync(id);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryAmount || !entryAccountId || !showAddEntry) return;

    await addEntryMutation.mutateAsync({
      accountId: entryAccountId,
      type: showAddEntry,
      amount: parseFloat(entryAmount),
      date: entryDate,
      remark: entryRemark,
      paymentMode: entryPaymentMode,
    });

    setShowAddEntry(null);
    setEntryAmount("");
    setEntryRemark("");
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    await deleteEntryMutation.mutateAsync(id);
  };

  const handleSaveOB = async () => {
    const val = parseFloat(tempOpeningBalance);
    if (!isNaN(val)) {
      if (selectedAccount === "ALL") {
        toast.error("Please select a specific account to change its opening balance.");
      } else {
        const acc = accounts.find(a => a.id === selectedAccount);
        if (acc && acc.id) {
          await updateAccountOBMutation.mutateAsync({
            id: acc.id,
            account: {
              name: acc.name,
              phone: acc.phone,
              openingBalance: val,
            }
          });
        }
      }
    }
    setIsEditingOB(false);
  };

  // Calculate filtered entries and their running balances
  const { filteredEntriesWithBalance, periodOpeningBalance } = useMemo(() => {
    let result = entries;
    if (selectedAccount !== "ALL") {
      result = result.filter(e => e.accountId === selectedAccount);
    }
    
    // Sort chronologically (oldest first)
    const sorted = [...result].sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tA - tB;
    });

    const activeOB = selectedAccount === "ALL"
      ? accounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0)
      : (accounts.find(a => a.id === selectedAccount)?.openingBalance || 0);

    let currentBalance = activeOB;
    const computed = sorted.map(entry => {
      if (entry.type === "CASH_IN") {
        currentBalance += entry.amount;
      } else {
        currentBalance -= entry.amount;
      }
      return {
        ...entry,
        runningBalance: currentBalance
      };
    });

    if (timeFilter === "ALL") {
      return {
        filteredEntriesWithBalance: computed,
        periodOpeningBalance: activeOB
      };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let periodStartLimit = 0;
    switch (timeFilter) {
      case "DAILY": periodStartLimit = startOfToday; break;
      case "WEEKLY": periodStartLimit = startOfToday - (7 * 24 * 60 * 60 * 1000); break;
      case "MONTHLY": periodStartLimit = startOfToday - (30 * 24 * 60 * 60 * 1000); break;
      case "YEARLY": periodStartLimit = startOfToday - (365 * 24 * 60 * 60 * 1000); break;
    }

    const entriesBefore = computed.filter(e => new Date(e.date).getTime() < periodStartLimit);
    const entriesIn = computed.filter(e => new Date(e.date).getTime() >= periodStartLimit);

    const periodOB = entriesBefore.length > 0 
      ? entriesBefore[entriesBefore.length - 1].runningBalance 
      : activeOB;

    return {
      filteredEntriesWithBalance: entriesIn,
      periodOpeningBalance: periodOB
    };
  }, [entries, selectedAccount, timeFilter, accounts]);

  const { totalIn, totalOut } = useMemo(() => {
    let inAmount = 0;
    let outAmount = 0;
    filteredEntriesWithBalance.forEach(e => {
      if (e.type === "CASH_IN") inAmount += e.amount;
      else outAmount += e.amount;
    });
    return { totalIn: inAmount, totalOut: outAmount };
  }, [filteredEntriesWithBalance]);

  // Overall calculations for Cash In Hand
  const { allTimeIn, allTimeOut } = useMemo(() => {
    let inAmount = 0;
    let outAmount = 0;
    let baseEntries = entries;
    if (selectedAccount !== "ALL") {
      baseEntries = baseEntries.filter(e => e.accountId === selectedAccount);
    }
    baseEntries.forEach(e => {
      if (e.type === "CASH_IN") inAmount += e.amount;
      else outAmount += e.amount;
    });
    return { allTimeIn: inAmount, allTimeOut: outAmount };
  }, [entries, selectedAccount]);

  const activeOB = selectedAccount === "ALL"
    ? accounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0)
    : (accounts.find(a => a.id === selectedAccount)?.openingBalance || 0);

  const currentBalance = activeOB + allTimeIn - allTimeOut;
  const totalVolume = totalIn + totalOut;
  const inPercentage = totalVolume > 0 ? (totalIn / totalVolume) * 100 : 50;

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "Unknown";

  const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);

  if (accountsLoading || entriesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-bold">Loading Cash Book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 pb-20 p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Cash Book
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage daily ledger & cash flow.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-full sm:w-[200px] h-8 text-xs font-medium">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Accounts (General)</SelectItem>
              {accounts.map(a => (
                <SelectItem key={a.id || ''} value={a.id || ''}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 gap-2 text-xs font-bold w-full sm:w-auto"
            onClick={() => setShowAddAccount(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Khata
          </Button>

          {selectedAccount !== "ALL" && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 gap-2 text-xs font-bold w-full sm:w-auto hover:bg-destructive/90"
              onClick={() => handleDeleteAccount(selectedAccount)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Khata
            </Button>
          )}
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 no-scrollbar md:grid md:grid-cols-4">
        {/* Opening Balance Card */}
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between h-full">
            <div className="w-full">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                Opening Balance {selectedAccount === "ALL" ? "(Combined)" : ""}
              </p>
              {isEditingOB ? (
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    value={tempOpeningBalance}
                    onChange={e => setTempOpeningBalance(e.target.value)}
                    className="h-7 w-20 text-xs px-1 py-0 font-semibold tabular-nums"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveOB();
                      } else if (e.key === "Escape") {
                        setIsEditingOB(false);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-7 px-2 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleSaveOB}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[10px] font-bold"
                    onClick={() => setIsEditingOB(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {formatINR(selectedAccount === "ALL"
                      ? accounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0)
                      : (accounts.find(a => a.id === selectedAccount)?.openingBalance || 0)
                    )}
                  </p>
                  {selectedAccount !== "ALL" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100"
                      onClick={() => {
                        const currentOB = accounts.find(a => a.id === selectedAccount)?.openingBalance || 0;
                        setTempOpeningBalance(currentOB.toString());
                        setIsEditingOB(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <BookOpen className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
          </CardContent>
        </Card>

        {/* Total Cash In Card */}
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Cash In</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">{formatINR(totalIn)}</p>
            </div>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500/50" />
          </CardContent>
        </Card>

        {/* Total Cash Out Card */}
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Cash Out</p>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-500">{formatINR(totalOut)}</p>
            </div>
            <ArrowUpCircle className="h-4 w-4 text-rose-500/50" />
          </CardContent>
        </Card>

        {/* Cash in Hand / Net Balance Card */}
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Cash In Hand</p>
              <p className={`text-sm font-semibold ${currentBalance >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'}`}>
                {currentBalance >= 0 ? "+" : "-"}{formatINR(Math.abs(currentBalance))}
              </p>
            </div>
            <RefreshCw className="h-4 w-4 text-muted-foreground/30" />
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Progress */}
      <Card className="shadow-none border-border">
        <CardContent className="px-3 py-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Cash Flow Proportion</span>
          </div>
          <div className="h-2 w-full rounded-full flex overflow-hidden bg-muted/30">
            <div style={{ width: `${inPercentage}%` }} className="h-full bg-emerald-500 transition-all duration-500"></div>
            <div style={{ width: `${100 - inPercentage}%` }} className="h-full bg-rose-500 transition-all duration-500"></div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-none border-border">
        <div className="px-2 py-2">
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {["ALL", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"].map((filter) => (
                <Button
                  key={filter}
                  variant={timeFilter === filter ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-tighter rounded-md px-3"
                  onClick={() => setTimeFilter(filter as any)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddEntry("CASH_IN")}
                className="h-8 gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              >
                <ArrowDownCircle className="h-3.5 w-3.5" />
                Cash In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddEntry("CASH_OUT")}
                className="h-8 gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-500 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              >
                <ArrowUpCircle className="h-3.5 w-3.5" />
                Cash Out
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-muted/5 overflow-x-auto no-scrollbar">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-secondary/20 text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Date</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Particulars / Details</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Payment (Out)</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Receipt (In)</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Balance</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {/* Period Opening Balance Row */}
                <tr className="bg-muted/10 font-medium border-b border-border">
                  <td className="px-3 py-2 text-muted-foreground">-</td>
                  <td className="px-3 py-2 font-semibold flex items-center gap-2">
                    <span className="text-foreground">Opening Balance</span>
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">-</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">-</td>
                  <td className="px-3 py-2 text-right font-bold text-foreground">
                    {formatINR(periodOpeningBalance)}
                  </td>
                  <td className="px-3 py-2"></td>
                </tr>

                {filteredEntriesWithBalance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Calendar className="h-6 w-6 mb-2 opacity-20" />
                        <span className="text-xs">No transactions recorded for this period.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntriesWithBalance.map(entry => (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      {/* Date */}
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </td>
                      
                      {/* Particulars / Details */}
                      <td className="px-3 py-2 max-w-[200px]">
                        <div className="truncate font-medium">{entry.remark || "-"}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 font-normal">
                            {getAccountName(entry.accountId)}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">
                            {entry.paymentMode}
                          </span>
                        </div>
                      </td>
                      
                      {/* Payment (Out) */}
                      <td className="px-3 py-2 text-right">
                        {entry.type === "CASH_OUT" ? (
                          <span className="font-bold tabular-nums text-rose-600 dark:text-rose-500">
                            {formatINR(entry.amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      
                      {/* Receipt (In) */}
                      <td className="px-3 py-2 text-right">
                        {entry.type === "CASH_IN" ? (
                          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-500">
                            {formatINR(entry.amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      
                      {/* Running Balance */}
                      <td className="px-3 py-2 text-right font-bold tabular-nums text-foreground">
                        {formatINR(entry.runningBalance)}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => entry.id && handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Add Account Dialog (Simulated) */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="pb-3 border-b px-4 py-3">
              <CardTitle className="text-sm font-bold">New Account (Khata)</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddAccount}>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Account Name <span className="text-destructive">*</span></label>
                  <Input
                    autoFocus
                    required
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="e.g. Bank, Salary, Supplier"
                    className="h-8 text-xs"
                  />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</label>
                  <Input
                    value={accountPhone}
                    onChange={e => setAccountPhone(e.target.value)}
                    placeholder="Optional"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Opening Balance (₹)</label>
                  <Input
                    type="number"
                    value={accountOpeningBalance}
                    onChange={e => setAccountOpeningBalance(e.target.value)}
                    placeholder="0.00"
                    className="h-8 text-xs font-bold tabular-nums"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-10 rounded-xl font-bold text-xs sm:text-sm" 
                    onClick={() => setShowAddAccount(false)}
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

      {/* Add Entry Dialog (Simulated) */}
      {showAddEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="pb-3 border-b px-4 py-3 flex flex-row items-center gap-2">
              {showAddEntry === "CASH_IN" ? (
                <><ArrowDownCircle className="h-4 w-4 text-emerald-500" /><CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-500">Cash In Entry</CardTitle></>
              ) : (
                <><ArrowUpCircle className="h-4 w-4 text-rose-500" /><CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-500">Cash Out Entry</CardTitle></>
              )}
            </CardHeader>
            <form onSubmit={handleAddEntry}>
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Account <span className="text-destructive">*</span></label>
                  <Select required value={entryAccountId} onValueChange={setEntryAccountId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => <SelectItem key={a.id || ''} value={a.id || ''}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Amount (₹) <span className="text-destructive">*</span></label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={entryAmount}
                    onChange={e => setEntryAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-10 text-sm font-bold tabular-nums"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Date</label>
                    <Input
                      type="date"
                      required
                      value={entryDate}
                      onChange={e => setEntryDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mode</label>
                    <Select value={entryPaymentMode} onValueChange={setEntryPaymentMode}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank">Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Remark</label>
                  <Input
                    type="text"
                    value={entryRemark}
                    onChange={e => setEntryRemark(e.target.value)}
                    placeholder="Details..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-10 rounded-xl font-bold text-xs sm:text-sm" 
                    onClick={() => setShowAddEntry(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className={`flex-1 h-10 rounded-xl font-bold text-xs sm:text-sm text-white ${showAddEntry === 'CASH_IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                    disabled={!entryAccountId}
                  >
                    Save Entry
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
