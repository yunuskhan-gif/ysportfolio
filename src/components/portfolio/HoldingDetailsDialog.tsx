import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { type StockHolding } from "@/lib/portfolio-api";

interface HoldingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: any | null; // EnrichedHolding
  onEdit: (holding: StockHolding) => void;
  onDelete: (id: string) => void;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

export default function HoldingDetailsDialog({
  open,
  onOpenChange,
  holding,
  onEdit,
  onDelete,
}: HoldingDetailsDialogProps) {
  if (!holding) return null;

  const isPositive = (holding.pnl ?? 0) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {holding.name}
                {holding.type === "mf" ? (
                  <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none">MF</Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none">STOCK</Badge>
                )}
              </DialogTitle>
              <p className="text-sm font-mono text-muted-foreground uppercase">{holding.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-tighter">
                {holding.ltp ? formatINR(holding.ltp) : "--"}
              </p>
              {holding.changePercent !== undefined && (
                <p className={`text-xs font-bold ${holding.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {holding.changePercent >= 0 ? "+" : ""}{holding.changePercent.toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Your Investment</p>
              <p className="text-lg font-bold">{formatINR(holding.investment)}</p>
              <p className="text-[10px] text-muted-foreground">{holding.qty} Units @ {formatINR(holding.avgPrice)}</p>
            </div>
            <div className={`p-3 rounded-2xl border border-border/50 ${isPositive ? "bg-emerald-500/5" : "bg-red-500/5"}`}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Current Value</p>
              <p className={`text-lg font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                {holding.currentValue ? formatINR(holding.currentValue) : "--"}
              </p>
              <div className="flex items-center gap-1">
                {isPositive ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                <p className={`text-[10px] font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                  {holding.pnl ? formatINR(holding.pnl) : "--"} ({holding.pnlPercent?.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 h-12 rounded-xl font-bold gap-2" 
              onClick={() => {
                onEdit(holding);
                onOpenChange(false);
              }}
            >
              <Edit2 className="w-4 h-4" /> Edit Holding
            </Button>
            <Button 
              variant="outline" 
              className="w-12 h-12 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive border-border/50 transition-colors"
              onClick={() => {
                if (confirm("Delete this holding?")) {
                  onDelete(holding.id);
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
