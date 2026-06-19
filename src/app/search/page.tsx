"use client";

import { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, TrendingDown, Plus, Loader2, Globe, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { HOLDINGS_QUERY_KEY, type StockHolding } from "@/lib/portfolio-api";
import toast from "react-hot-toast";
import AddStockDialog from "@/components/portfolio/AddStockDialog";
import StockScreenerDialog from "@/components/shared/StockScreenerDialog";

interface SearchResult {
  symbol: string;
  name: string;
  sector: string;
  type: "stock" | "mf";
  ltp?: number;
  change?: number;
  changePercent?: number;
  sourceUrl?: string;
}

export default function MarketSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<StockHolding | null>(null);

  // Screener dialog states
  const [screenerSymbol, setScreenerSymbol] = useState<string | null>(null);
  const [screenerName, setScreenerName] = useState<string>("");
  const [isScreenerOpen, setIsScreenerOpen] = useState(false);

  const handleOpenScreener = (stock: SearchResult) => {
    setScreenerSymbol(stock.symbol);
    setScreenerName(stock.name);
    setIsScreenerOpen(true);
  };

  const fetchResults = async (q: string) => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search-stocks?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim()) {
      searchTimeout.current = setTimeout(() => fetchResults(query), 400);
    } else {
      setResults([]);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const handleAddStock = (stock: SearchResult) => {
    setSelectedHolding({
      name: stock.name,
      symbol: stock.symbol.includes(".") ? stock.symbol : `${stock.symbol}.NS`,
      qty: 1,
      avgPrice: stock.ltp || 0,
      app: stock.type === "mf" ? "MF" : "NSE",
      sourceUrl: stock.sourceUrl,
    });
    setIsAddStockOpen(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto pt-12 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3 mb-10 w-full">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Market Intelligence
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Search for 10,000+ Stocks and Mutual Funds with real-time pricing and intelligence.
        </p>
      </div>

      <div className="relative w-full max-w-2xl group">
        <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks, ETFs, mutual funds..."
            className="h-14 pl-12 pr-12 text-lg shadow-xl border-border/50 bg-background/80 backdrop-blur-sm rounded-2xl focus-visible:ring-primary/30 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
            </div>
          )}
        </div>
      </div>

      <div className="grid w-full gap-4 mt-12 md:grid-cols-2">
        {results.length > 0 ? (
          results.map((item) => (
            <Card key={item.symbol} className="group overflow-hidden border-border/40 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-4">
                <div 
                  className="flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/10 p-1.5 rounded-lg transition-all animate-none"
                  title="Click to view Screener analysis and charts"
                  onClick={() => handleOpenScreener(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate text-base group-hover:text-primary transition-colors">{item.name}</h3>
                      {item.type === "mf" ? (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-[10px] font-bold border-none h-5 px-1.5">MF</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border-none h-5 px-1.5">STOCK</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-primary/70">{item.symbol}</span>
                      <span>•</span>
                      <span className="truncate">{item.sector}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0">
                    {item.ltp ? (
                      <>
                        <div className="text-lg font-black tracking-tighter text-white">
                          ₹{item.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {item.changePercent !== undefined && (
                          <div className={`flex items-center gap-0.5 text-[11px] font-bold ${item.changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {item.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(item.changePercent).toFixed(2)}%
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">Price pending</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      <Globe className="w-3 h-3" /> Live
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      <BarChart3 className="w-3 h-3" /> NSE
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 px-3 text-xs font-bold gap-1.5 hover:bg-primary hover:text-primary-foreground transition-all rounded-xl border-primary/20"
                    onClick={() => handleAddStock(item)}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : query && !loading ? (
          <div className="col-span-full py-20 text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-muted/30">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm italic">No assets found for "{query}"</p>
          </div>
        ) : !query && (
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 opacity-60">
             {/* Suggested Search Placeholders */}
             {["Reliance", "Tata Motors", "SBI Mutual Fund"].map((term) => (
                <button 
                  key={term} 
                  onClick={() => setQuery(term)}
                  className="p-4 rounded-xl border border-dashed border-border flex flex-col items-center gap-2 hover:bg-muted/50 transition-all group"
                >
                  <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium">{term}</span>
                </button>
             ))}
          </div>
        )}
      </div>

      <AddStockDialog
        open={isAddStockOpen}
        onOpenChange={setIsAddStockOpen}
        initialHolding={selectedHolding}
        onStockAdded={() => {
          queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
        }}
      />

      {screenerSymbol && (
        <StockScreenerDialog
          symbol={screenerSymbol}
          name={screenerName}
          open={isScreenerOpen}
          onOpenChange={setIsScreenerOpen}
        />
      )}
    </div>
  );
}
