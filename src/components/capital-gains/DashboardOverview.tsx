"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaxResult, TaxSettings } from "./types";
import { 
  TrendingUp, 
  Coins, 
  Percent, 
  Settings2, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardOverviewProps {
  taxResult: TaxResult;
  settings: TaxSettings;
  onUpdateSettings: (settings: TaxSettings) => void;
  previousStcgLoss: number;
  previousLtcgLoss: number;
  onUpdateLosses: (stcg: number, ltcg: number) => void;
}

export default function DashboardOverview({
  taxResult,
  settings,
  onUpdateSettings,
  previousStcgLoss,
  previousLtcgLoss,
  onUpdateLosses,
}: DashboardOverviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSettingChange = (field: keyof TaxSettings, value: number) => {
    onUpdateSettings({
      ...settings,
      [field]: value,
    });
  };

  const isNetGain = taxResult.netRealizedGains >= 0;

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Realized Gains */}
        <Card className="relative overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md">
          <div className={`absolute top-0 left-0 right-0 h-1 ${isNetGain ? "bg-emerald-500" : "bg-red-500"}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Net Realized Gains
            </CardTitle>
            <div className={`rounded-full p-1.5 ${isNetGain ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              {isNetGain ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tracking-tight ${isNetGain ? "text-emerald-500" : "text-red-500"}`}>
              {formatCurrency(taxResult.netRealizedGains)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Realized profits net of trade expenses
            </p>
          </CardContent>
        </Card>

        {/* Short Term Capital Gains */}
        <Card className="relative overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Short-Term Gains (STCG)
            </CardTitle>
            <div className="rounded-full p-1.5 bg-blue-500/10 text-blue-500">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(taxResult.stcg)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
              <span>Taxable: {formatCurrency(taxResult.stcgTaxable)}</span>
              <span className="text-muted-foreground/30">|</span>
              <span>Rate: {(settings.stcgRate * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Long Term Capital Gains */}
        <Card className="relative overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Long-Term Gains (LTCG)
            </CardTitle>
            <div className="rounded-full p-1.5 bg-violet-500/10 text-violet-500">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(taxResult.ltcg)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
              <span>Taxable: {formatCurrency(taxResult.ltcgTaxable)}</span>
              <span className="text-muted-foreground/30">|</span>
              <span>Rate: {(settings.ltcgRate * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Estimated Tax */}
        <Card className="relative overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Estimated Tax
            </CardTitle>
            <div className="rounded-full p-1.5 bg-amber-500/10 text-amber-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-500">
              {formatCurrency(taxResult.totalTax)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              Includes ₹1.25L LTCG Exemption
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="cursor-help text-muted-foreground hover:text-foreground">
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Exemption limit applied to Long Term Capital Gains. Under India FY 25-26 rules, the first ₹1,25,000 of LTCG is tax-exempt.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Rules / Settings Panel */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur-md">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            Tax Configuration & Loss Offsets
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {isOpen && (
          <CardContent className="px-4 pb-4 pt-2 border-t border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stcgRate" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>STCG Tax Rate (%)</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1">FY 2025-26: 20%</Badge>
                </Label>
                <Input
                  id="stcgRate"
                  type="number"
                  step="0.1"
                  value={settings.stcgRate * 100}
                  onChange={(e) => handleSettingChange("stcgRate", Number(e.target.value) / 100)}
                  className="h-8 text-xs bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ltcgRate" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>LTCG Tax Rate (%)</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1">FY 2025-26: 12.5%</Badge>
                </Label>
                <Input
                  id="ltcgRate"
                  type="number"
                  step="0.1"
                  value={settings.ltcgRate * 100}
                  onChange={(e) => handleSettingChange("ltcgRate", Number(e.target.value) / 100)}
                  className="h-8 text-xs bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ltcgExemption" className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>LTCG Exemption (₹)</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1">FY 2025-26: 1.25L</Badge>
                </Label>
                <Input
                  id="ltcgExemption"
                  type="number"
                  value={settings.ltcgExemption}
                  onChange={(e) => handleSettingChange("ltcgExemption", Number(e.target.value))}
                  className="h-8 text-xs bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prevStcgLoss" className="text-xs text-muted-foreground">
                    Prev STCL Carry Forward
                  </Label>
                  <Input
                    id="prevStcgLoss"
                    type="number"
                    value={previousStcgLoss}
                    onChange={(e) => onUpdateLosses(Number(e.target.value), previousLtcgLoss)}
                    className="h-8 text-xs bg-background/50"
                    placeholder="₹ 0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prevLtcgLoss" className="text-xs text-muted-foreground">
                    Prev LTCL Carry Forward
                  </Label>
                  <Input
                    id="prevLtcgLoss"
                    type="number"
                    value={previousLtcgLoss}
                    onChange={(e) => onUpdateLosses(previousStcgLoss, Number(e.target.value))}
                    className="h-8 text-xs bg-background/50"
                    placeholder="₹ 0"
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/40 rounded-lg p-2.5 text-[11px] text-muted-foreground flex flex-col gap-1 border border-border/30">
              <span className="font-semibold text-foreground">India IT Rules Set-Off Protocol:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Current year Short-Term Capital Losses (STCL) offset STCG first, then LTCG.</li>
                <li>Current year Long-Term Capital Losses (LTCL) offset <strong>only</strong> LTCG.</li>
                <li>Brought forward historical losses (Previous Years) can offset current year taxable profits.</li>
              </ul>
              {taxResult.previousLossOffsetAmountUsed > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-border/40 text-emerald-500 font-medium">
                  Applied Offset: {formatCurrency(taxResult.previousLossOffsetAmountUsed)} of carried forward loss has been successfully harvested!
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
