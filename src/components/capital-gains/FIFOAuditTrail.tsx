"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FIFOMatchDetail } from "./types";
import { 
  FileSearch, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  TrendingUp, 
  ArrowRight,
  TrendingDown
} from "lucide-react";

interface FIFOAuditTrailProps {
  matchDetails: FIFOMatchDetail[];
  warnings: string[];
}

export default function FIFOAuditTrail({ matchDetails, warnings }: FIFOAuditTrailProps) {
  const [filterSymbol, setFilterSymbol] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredMatches = matchDetails.filter((item) =>
    item.symbol.toLowerCase().includes(filterSymbol.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMatches = filteredMatches.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" />
              FIFO Matching Audit Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Demonstrates exact matching of sales transactions against purchase lots
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by Symbol..."
              value={filterSymbol}
              onChange={(e) => {
                setFilterSymbol(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-8 text-xs bg-background/50"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Warnings Container */}
        {warnings.length > 0 && (
          <div className="p-3 bg-amber-500/10 text-amber-500 border-b border-border/40 text-[11px] leading-relaxed flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Matching Discrepancy Warnings</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
              {warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full p-3 bg-muted/40 text-muted-foreground mb-3">
              <FileSearch className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-foreground">No FIFO Matches Calculated</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Either there are no SELL transactions in the ledger, or no matches have been identified yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Asset</TableHead>
                    <TableHead className="text-xs font-semibold">Matched Lot Allocation (BUY → SELL)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Matched Qty</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Cost (Lot/Pro-Rata)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Sale Price</TableHead>
                    <TableHead className="text-xs font-semibold">Holding Period</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Expenses</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Net Gain / Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMatches.map((match) => {
                    const isGain = match.netGainLoss >= 0;
                    const totalExpenses = match.purchaseExpenses + match.saleExpenses;
                    const isShortMatched = match.id.includes("short");
                    
                    return (
                      <TableRow key={match.id} className="hover:bg-muted/10">
                        <TableCell className="text-xs py-2.5 font-bold tracking-tight">{match.symbol}</TableCell>
                        <TableCell className="text-xs py-2.5 font-mono text-muted-foreground">
                          {isShortMatched ? (
                            <span className="text-amber-500 font-semibold flex items-center gap-1">
                              Missing Buy Lot
                              <ArrowRight className="h-3 w-3" />
                              {match.saleDate}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>{match.purchaseDate} (₹{match.purchasePrice})</span>
                              <ArrowRight className="h-3 w-3 text-primary" />
                              <span>{match.saleDate} (₹{match.salePrice})</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-medium">
                          {match.quantitySold}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-medium">
                          {formatCurrency(match.costOfAcquisition)}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-medium">
                          {formatCurrency(match.saleValue)}
                        </TableCell>
                        <TableCell className="text-xs py-2.5">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold px-1 py-0 ${
                                match.holdingType === "STCG"
                                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  : "bg-violet-500/10 text-violet-500 border-violet-500/20"
                              }`}
                            >
                              {match.holdingType}
                            </Badge>
                            {!isShortMatched && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {match.holdingPeriodDays} days
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono text-muted-foreground">
                          {totalExpenses > 0 ? formatCurrency(totalExpenses) : "-"}
                        </TableCell>
                        <TableCell className="text-xs py-2.5 text-right font-mono font-bold">
                          <span className={`flex items-center justify-end gap-1 ${isGain ? "text-emerald-500" : "text-red-500"}`}>
                            {isGain ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {formatCurrency(match.netGainLoss)}
                          </span>
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
                    {Math.min(startIndex + itemsPerPage, filteredMatches.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{filteredMatches.length}</span> matches
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
