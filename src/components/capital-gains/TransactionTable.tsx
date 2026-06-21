"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction } from "./types";
import { Trash2, FileSpreadsheet, XCircle, Calendar, RefreshCcw, Info } from "lucide-react";
import toast from "react-hot-toast";

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onClearAll: () => void;
}

export default function TransactionTable({
  transactions,
  onDeleteTransaction,
  onClearAll,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire transaction ledger? All unsaved data will be lost.")) {
      onClearAll();
      toast.success("Workbook cleared successfully!");
    }
  };

  const calculateLotTotalExpenses = (tx: Transaction) => {
    return (tx.brokerage || 0) + (tx.stt || 0) + (tx.gst || 0) + (tx.stampDuty || 0) + (tx.otherCharges || 0);
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Transaction Ledger
          </CardTitle>
          <CardDescription className="text-xs">
            Workbook contains {transactions.length} trade record{transactions.length === 1 ? "" : "s"}
          </CardDescription>
        </div>
        {transactions.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClear}
            className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
          >
            <XCircle className="h-3.5 w-3.5" />
            Clear Ledger Workbook
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full p-3 bg-muted/40 text-muted-foreground mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-foreground">No Trades Loaded</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Your trade ledger is currently empty. Import a CSV tax report or add trades manually to begin tax assessments.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Symbol</TableHead>
                    <TableHead className="text-xs font-semibold">Action</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Quantity</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Avg Price</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total Trade Value</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total Charges</TableHead>
                    <TableHead className="text-xs font-semibold text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => {
                    const charges = calculateLotTotalExpenses(tx);
                    const isBuy = tx.action === "BUY";
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/10">
                        <TableCell className="text-xs py-2.5 font-mono">{tx.date}</TableCell>
                        <TableCell className="text-xs py-2.5 font-bold tracking-tight">{tx.symbol}</TableCell>
                        <TableCell className="text-xs py-2.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold px-1.5 py-0 ${
                              isBuy
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {tx.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-medium">
                          {tx.quantity}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-medium">
                          {formatCurrency(tx.price)}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-bold">
                          {formatCurrency(tx.quantity * tx.price)}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono text-muted-foreground">
                          {charges > 0 ? (
                            <span className="flex items-center justify-end gap-1">
                              {formatCurrency(charges)}
                              <Badge variant="secondary" className="text-[8px] py-0 px-1 font-sans">Fees</Badge>
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/10 text-xs">
                <span className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(startIndex + itemsPerPage, transactions.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{transactions.length}</span> entries
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="h-7 text-xs px-2.5 cursor-pointer"
                  >
                    Previous
                  </Button>
                  <span className="px-2 font-semibold">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="h-7 text-xs px-2.5 cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
