"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function History() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portfolio/history")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || `HTTP error! Status: ${res.status}`);
          }).catch(() => {
            throw new Error(`HTTP error! Status: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSnapshots(data);
        } else {
          setSnapshots([]);
          setError(data.message || "Invalid response format.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load history.");
        setLoading(false);
      });
  }, []);

  const handleDeleteSnapshot = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this snapshot?")) return;

    try {
      const res = await fetch(`/api/portfolio/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSnapshots((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert("Failed to delete snapshot");
      }
    } catch (err) {
      alert("Error deleting snapshot");
    }
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading history...</div>;
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-red-500">Error: {error}</p>
        <p className="text-xs text-muted-foreground mt-2">Please check your database connection.</p>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>No saved snapshots yet.</p>
        <p className="text-xs mt-2">Go to Portfolio and click "Save Snapshot" to create one.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-2 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Portfolio History</h2>
      </div>

      <div className="space-y-4">
        {snapshots.map((snapshot) => {
          const isExpanded = expandedId === snapshot._id;

          return (
            <Card key={snapshot._id} className="overflow-hidden border-border/50 shadow-sm">
              <div 
                className="p-4 flex flex-wrap items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : snapshot._id)}
              >
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium">
                    {format(new Date(snapshot.createdAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {snapshot.holdings.length} assets saved
                  </p>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Invested</p>
                    <p className="text-sm font-medium">{formatINR(snapshot.totalInvested)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Value</p>
                    <p className="text-sm font-medium">{formatINR(snapshot.currentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">P&L</p>
                    <p className={`text-sm font-bold ${snapshot.totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {snapshot.totalPnL > 0 ? "+" : ""}{formatINR(snapshot.totalPnL)}
                      <span className="text-xs ml-1 font-medium bg-background px-1 py-0.5 rounded border border-border/50">
                        {snapshot.pnlPercentage > 0 ? "+" : ""}{snapshot.pnlPercentage.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                  <div className="ml-4 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/50 bg-muted/5 p-4">
                  <div className="flex justify-end mb-4 gap-2">
                    <button 
                      className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Sync feature coming soon!");
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync with Today's Prices
                    </button>
                    <button 
                      className="flex items-center gap-2 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 px-3 py-1.5 rounded-md border border-destructive/20 transition-colors"
                      onClick={(e) => handleDeleteSnapshot(snapshot._id, e)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-md border border-border/50">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/30 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Asset</th>
                          <th className="px-4 py-3 font-medium text-right">Qty</th>
                          <th className="px-4 py-3 font-medium text-right">Avg Price</th>
                          <th className="px-4 py-3 font-medium text-right">Saved LTP</th>
                          <th className="px-4 py-3 font-medium text-right">Value</th>
                          <th className="px-4 py-3 font-medium text-right">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {snapshot.holdings.map((h: any, idx: number) => (
                          <tr key={idx} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2">
                              <p className="font-medium">{h.symbol}</p>
                              <p className="text-[10px] text-muted-foreground">{h.name}</p>
                            </td>
                            <td className="px-4 py-2 text-right font-medium">{h.qty}</td>
                            <td className="px-4 py-2 text-right">{formatINR(h.avgPrice)}</td>
                            <td className="px-4 py-2 text-right">{formatINR(h.ltp)}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatINR(h.currentValue)}</td>
                            <td className={`px-4 py-2 text-right font-medium ${h.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {h.pnl > 0 ? "+" : ""}{formatINR(h.pnl)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
