"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "./types";
import { PlusCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface TransactionFormProps {
  onAddTransaction: (newTx: Omit<Transaction, "id">) => void;
  onAddLog: (message: string) => void;
}

export default function TransactionForm({ onAddTransaction, onAddLog }: TransactionFormProps) {
  const [symbol, setSymbol] = useState("");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Expenses states
  const [showExpenses, setShowExpenses] = useState(false);
  const [brokerage, setBrokerage] = useState("");
  const [stt, setStt] = useState("");
  const [gst, setGst] = useState("");
  const [stampDuty, setStampDuty] = useState("");
  const [otherCharges, setOtherCharges] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim()) {
      toast.error("Stock symbol is required.");
      return;
    }
    const qtyNum = Number(quantity);
    const priceNum = Number(price);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }
    if (!date) {
      toast.error("Transaction date is required.");
      return;
    }

    const payload: Omit<Transaction, "id"> = {
      symbol: symbol.trim().toUpperCase(),
      action,
      quantity: qtyNum,
      price: priceNum,
      date,
      brokerage: Number(brokerage) || 0,
      stt: Number(stt) || 0,
      gst: Number(gst) || 0,
      stampDuty: Number(stampDuty) || 0,
      otherCharges: Number(otherCharges) || 0
    };

    onAddTransaction(payload);
    onAddLog(`[MANUAL ADD] Created ${action} record for ${qtyNum} shares of ${payload.symbol} @ ₹${priceNum} on ${date}`);
    toast.success(`Added ${action} record for ${payload.symbol}!`);

    // Reset Form (except date and action for faster multi-entry)
    setSymbol("");
    setQuantity("");
    setPrice("");
    setBrokerage("");
    setStt("");
    setGst("");
    setStampDuty("");
    setOtherCharges("");
  };

  return (
    <Card className="border border-border/80 bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-primary" />
          Add Trade Manually
        </CardTitle>
        <CardDescription className="text-xs">
          Record a BUY or SELL transaction lot to the ledger
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 my-2">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Base Form Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="symbol" className="text-xs text-muted-foreground">Symbol / Scrip</Label>
              <Input
                id="symbol"
                placeholder="e.g. INFY, RELIANCE"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="h-8 text-xs uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="action" className="text-xs text-muted-foreground">Action</Label>
              <Select value={action} onValueChange={(val: "BUY" | "SELL") => setAction(val)}>
                <SelectTrigger id="action" className="h-8 text-xs bg-background/50 cursor-pointer">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY" className="text-emerald-500 font-semibold cursor-pointer">BUY</SelectItem>
                  <SelectItem value="SELL" className="text-red-500 font-semibold cursor-pointer">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="quantity" className="text-xs text-muted-foreground">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Shares"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price" className="text-xs text-muted-foreground">Execution Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Average Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="date" className="text-xs text-muted-foreground">Trade Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 text-xs bg-background/50 cursor-pointer"
              />
            </div>
          </div>

          {/* Collapsible Expenses Section */}
          <div className="border border-border/40 rounded-lg p-2 bg-muted/20">
            <button
              type="button"
              onClick={() => setShowExpenses(!showExpenses)}
              className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground select-none"
            >
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary/70" />
                Trade Expenses & Fees (Optional)
              </span>
              {showExpenses ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            
            {showExpenses && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/30 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="space-y-0.5">
                  <Label htmlFor="brokerage" className="text-[10px] text-muted-foreground">Brokerage (₹)</Label>
                  <Input
                    id="brokerage"
                    type="number"
                    value={brokerage}
                    onChange={(e) => setBrokerage(e.target.value)}
                    className="h-7 text-[11px]"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="stt" className="text-[10px] text-muted-foreground">STT (₹)</Label>
                  <Input
                    id="stt"
                    type="number"
                    value={stt}
                    onChange={(e) => setStt(e.target.value)}
                    className="h-7 text-[11px]"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="gst" className="text-[10px] text-muted-foreground">GST (₹)</Label>
                  <Input
                    id="gst"
                    type="number"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    className="h-7 text-[11px]"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="stampDuty" className="text-[10px] text-muted-foreground">Stamp Duty (₹)</Label>
                  <Input
                    id="stampDuty"
                    type="number"
                    value={stampDuty}
                    onChange={(e) => setStampDuty(e.target.value)}
                    className="h-7 text-[11px]"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2 space-y-0.5">
                  <Label htmlFor="otherCharges" className="text-[10px] text-muted-foreground">Exchange/Other Charges (₹)</Label>
                  <Input
                    id="otherCharges"
                    type="number"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    className="h-7 text-[11px]"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-9 text-xs cursor-pointer font-bold">
            Add Lot to Ledger
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
