"use client";

import { useState, useMemo } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, Trash2, Calendar, BookOpen, Download, FileSpreadsheet, Clipboard, RefreshCw } from "lucide-react";
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

interface CashbookAccount {
  id: string;
  name: string;
  phone?: string;
}

interface CashbookEntry {
  id: string;
  accountId: string;
  type: "CASH_IN" | "CASH_OUT";
  amount: number;
  date: string;
  remark: string;
  paymentMode: string;
  createdAt: string;
}

export default function CashBookPage() {
  const [accounts, setAccounts] = useState<CashbookAccount[]>([
    { id: "acc-1", name: "Main Cash Drawer", phone: "" },
  ]);
  const [entries, setEntries] = useState<CashbookEntry[]>([]);
  
  const [selectedAccount, setSelectedAccount] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("ALL");

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState<"CASH_IN" | "CASH_OUT" | null>(null);

  const [accountName, setAccountName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");

  const [entryAmount, setEntryAmount] = useState("");
  const [entryRemark, setEntryRemark] = useState("");
  const [entryPaymentMode, setEntryPaymentMode] = useState("Cash");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [entryAccountId, setEntryAccountId] = useState("");

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName) return;
    
    const newAcc: CashbookAccount = {
      id: `acc-${Date.now()}`,
      name: accountName,
      phone: accountPhone,
    };
    
    setAccounts([...accounts, newAcc]);
    setShowAddAccount(false);
    setAccountName("");
    setAccountPhone("");
    toast.success("Account added successfully!");
    setSelectedAccount(newAcc.id);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryAmount || !entryAccountId || !showAddEntry) return;

    const newEntry: CashbookEntry = {
      id: `entry-${Date.now()}`,
      accountId: entryAccountId,
      type: showAddEntry,
      amount: parseFloat(entryAmount),
      date: entryDate,
      remark: entryRemark,
      paymentMode: entryPaymentMode,
      createdAt: new Date().toISOString(),
    };

    setEntries([...entries, newEntry]);
    setShowAddEntry(null);
    setEntryAmount("");
    setEntryRemark("");
    toast.success("Entry added successfully!");
  };

  const handleDeleteEntry = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    setEntries(entries.filter(e => e.id !== id));
    toast.success("Entry deleted successfully!");
  };

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (selectedAccount !== "ALL") {
      result = result.filter(e => e.accountId === selectedAccount);
    }
    if (timeFilter === "ALL") return result;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return result.filter(e => {
      const entryTime = new Date(e.date).getTime();
      switch (timeFilter) {
        case "DAILY": return entryTime >= startOfToday;
        case "WEEKLY": return entryTime >= startOfToday - (7 * 24 * 60 * 60 * 1000);
        case "MONTHLY": return entryTime >= startOfToday - (30 * 24 * 60 * 60 * 1000);
        case "YEARLY": return entryTime >= startOfToday - (365 * 24 * 60 * 60 * 1000);
        default: return true;
      }
    });
  }, [entries, timeFilter, selectedAccount]);

  const { totalIn, totalOut } = useMemo(() => {
    let inAmount = 0;
    let outAmount = 0;
    filteredEntries.forEach(e => {
      if (e.type === "CASH_IN") inAmount += e.amount;
      else outAmount += e.amount;
    });
    return { totalIn: inAmount, totalOut: outAmount };
  }, [filteredEntries]);

  const netBalance = totalIn - totalOut;
  const totalVolume = totalIn + totalOut;
  const inPercentage = totalVolume > 0 ? (totalIn / totalVolume) * 100 : 50;

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "Unknown";

  const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);

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
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
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
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 no-scrollbar md:grid md:grid-cols-3">
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Cash In</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">{formatINR(totalIn)}</p>
            </div>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500/50" />
          </CardContent>
        </Card>
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Cash Out</p>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-500">{formatINR(totalOut)}</p>
            </div>
            <ArrowUpCircle className="h-4 w-4 text-rose-500/50" />
          </CardContent>
        </Card>
        <Card className="shadow-none border-border !py-0 !gap-0 min-w-[140px] md:min-w-0">
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Net Balance</p>
              <p className={`text-sm font-semibold ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'}`}>
                {netBalance >= 0 ? "+" : "-"}{formatINR(Math.abs(netBalance))}
              </p>
            </div>
            <BookOpen className="h-4 w-4 text-muted-foreground/30" />
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
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Account</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Details</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-right">Amount</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Calendar className="h-6 w-6 mb-2 opacity-20" />
                        <span className="text-xs">No transactions recorded.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-3 py-2">
                        <div className="font-medium">{new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary" className="text-[10px] py-0 font-normal">
                          {getAccountName(entry.accountId)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 max-w-[200px]">
                        <div className="truncate font-medium">{entry.remark || "-"}</div>
                        <div className="text-[10px] text-muted-foreground">{entry.paymentMode}</div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-bold tabular-nums ${entry.type === "CASH_IN" ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}>
                          {entry.type === "CASH_IN" ? "+" : "-"} {formatINR(entry.amount)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteEntry(entry.id)}
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
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => setShowAddAccount(false)}>Cancel</Button>
                  <Button type="submit" size="sm" className="w-full h-8 text-xs">Save</Button>
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
                      {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
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

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => setShowAddEntry(null)}>Cancel</Button>
                  <Button 
                    type="submit" 
                    size="sm" 
                    className={`w-full h-8 text-xs ${showAddEntry === 'CASH_IN' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
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
