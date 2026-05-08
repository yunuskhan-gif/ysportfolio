import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EQUITY_SYMBOLS } from "@/constants/symbols";
import { Loader2, Globe } from "lucide-react";
import {
  HOLDINGS_QUERY_KEY,
  saveHolding,
  type StockHolding,
} from "@/lib/portfolio-api";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface LiveSearchResult {
  symbol: string;
  name: string;
  sector: string;
  type: "stock" | "mf";
  ltp?: number;
  change?: number;
  changePercent?: number;
  sourceUrl?: string;
}

interface StockOption {
  symbol: string;
  name: string;
  sector: string;
  source: "live" | "local";
  type: "stock" | "mf";
  ltp?: number;
  changePercent?: number;
  sourceUrl?: string;
}

interface StockFormState {
  symbol: string;
  name: string;
  qty: string;
  avgPrice: string;
  app: string;
  sourceUrl: string;
}

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockAdded?: () => void;
  initialHolding?: StockHolding | null;
  editId?: string | null;
}

const INITIAL_FORM: StockFormState = {
  symbol: "",
  name: "",
  qty: "",
  avgPrice: "",
  app: "Manual",
  sourceUrl: "",
};

const normalizeSymbol = (symbol: string) => {
  const cleaned = symbol.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return "";
  // If it already has an exchange suffix, a colon (GF ID), or looks like an MF code, don't append .NS
  if (cleaned.includes(".") || cleaned.includes(":") || cleaned.length > 10) return cleaned;
  // Common MF prefix pattern for Moneycontrol (3 letters + numbers)
  if (/^[A-Z]{2,}[0-9]+$/.test(cleaned)) return cleaned;
  return `${cleaned}.NS`;
};

const formatSymbol = (symbol: string) => normalizeSymbol(symbol);

export default function AddStockDialog({
  open,
  onOpenChange,
  onStockAdded,
  initialHolding = null,
  editId = null,
}: AddStockDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(editId);
  const [formState, setFormState] = useState<StockFormState>(INITIAL_FORM);
  const [activeSelector, setActiveSelector] = useState<"name" | "symbol" | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedChangePercent, setSelectedChangePercent] = useState<number | null>(null);

  const [liveResults, setLiveResults] = useState<LiveSearchResult[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchLiveSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLiveResults([]);
      setLiveLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLiveLoading(true);
    try {
      const res = await fetch(`/api/search-stocks?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("search failed");
      const data: LiveSearchResult[] = await res.json();
      if (!controller.signal.aborted) {
        setLiveResults(data);
      }
    } catch {
      // Ignore abort errors
    } finally {
      if (!controller.signal.aborted) {
        setLiveLoading(false);
      }
    }
  }, []);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (query.length < 2) {
        setLiveResults([]);
        setLiveLoading(false);
        return;
      }
      setLiveLoading(true);
      searchTimerRef.current = setTimeout(() => void fetchLiveSearch(query), 350);
    },
    [fetchLiveSearch]
  );

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const saveHoldingMutation = useMutation({
    mutationFn: ({ holding, id }: { holding: StockHolding; id?: string | null }) =>
      saveHolding(holding, id),
  });

  const buildMergedOptions = (query: string, field: "name" | "symbol"): StockOption[] => {
    const q = query.trim().toLowerCase().replace(/\.ns$/i, "");

    const liveOptions: StockOption[] = liveResults.map((r) => ({
      symbol: r.symbol,
      name: r.name,
      sector: r.sector,
      source: "live" as const,
      type: r.type,
      ltp: r.ltp,
      changePercent: r.changePercent,
      sourceUrl: (r as any).sourceUrl,
    }));

    const localMatches = q
      ? EQUITY_SYMBOLS.filter((s) => {
          const n = s.n.toLowerCase();
          const sym = s.s.toLowerCase();
          return field === "name"
            ? n.includes(q) || sym.includes(q)
            : sym.includes(q) || n.includes(q);
        }).slice(0, 6)
      : EQUITY_SYMBOLS.slice(0, 6);

    const localOptions: StockOption[] = localMatches.map((s) => ({
      symbol: s.s,
      name: s.n,
      sector: "",
      source: "local" as const,
      type: "stock" as const,
    }));

    const seen = new Set(liveOptions.map((o) => o.symbol.toUpperCase()));
    const merged = [...liveOptions];
    for (const opt of localOptions) {
      if (!seen.has(opt.symbol.toUpperCase())) {
        merged.push(opt);
        seen.add(opt.symbol.toUpperCase());
      }
    }

    return merged.slice(0, 12);
  };

  const stockMatches = useMemo(
    () => buildMergedOptions(formState.name, "name"),
    [formState.name, liveResults]
  );

  const symbolMatches = useMemo(
    () => buildMergedOptions(formState.symbol, "symbol"),
    [formState.symbol, liveResults]
  );

  const handleFormChange = (field: keyof StockFormState, value: string) => {
    if (field === "name") {
      debouncedSearch(value);
      // Reset selected price/stats when searching for something else
      setSelectedPrice(null);
      setSelectedChangePercent(null);
      
      const exactMatch = EQUITY_SYMBOLS.find(
        (stock) => stock.n.toLowerCase() === value.trim().toLowerCase()
      );
      setFormState((current) => ({
        ...current,
        name: value,
        symbol: exactMatch ? formatSymbol(exactMatch.s) : "",
      }));
      return;
    }

    if (field === "symbol") {
      debouncedSearch(value.replace(/\.NS$/i, ""));
      // Reset selected price/stats when manually editing symbol
      setSelectedPrice(null);
      setSelectedChangePercent(null);
    }

    setFormState((current) => ({ ...current, [field]: value }));
  };

  const fetchLivePrice = useCallback(async (symbol: string) => {
    const cleanSymbol = normalizeSymbol(symbol);
    if (!cleanSymbol || cleanSymbol.length < 3) return;

    try {
      const res = await fetch(`/api/prices?symbols=${encodeURIComponent(cleanSymbol)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const p = data[0];
        if (p.price) {
          setSelectedPrice(p.price);
          setSelectedChangePercent(p.changePercent);
          // If the user manually typed and we found a better name, update it if empty
          setFormState(prev => ({
            ...prev,
            symbol: cleanSymbol,
            avgPrice: prev.avgPrice || String(p.price)
          }));
        }
      }
    } catch {
      // Silent fail
    }
  }, []);

  const handleStockSelect = (name: string, symbol: string, ltp?: number, changePercent?: number, sourceUrl?: string) => {
    const finalSymbol = formatSymbol(symbol);
    setFormState((current) => ({
      ...current,
      name,
      symbol: finalSymbol,
      sourceUrl: sourceUrl || "",
      avgPrice: current.avgPrice || (ltp ? String(ltp) : current.avgPrice)
    }));
    
    if (ltp !== undefined) {
      setSelectedPrice(ltp);
    } else {
      // If result had no price, try to fetch it immediately
      fetchLivePrice(finalSymbol);
    }
    
    if (changePercent !== undefined) setSelectedChangePercent(changePercent);
    setActiveSelector(null);
    setLiveResults([]);
    setLiveLoading(false);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  };

  const resetDialogState = () => {
    setFormState(INITIAL_FORM);
    setActiveSelector(null);
    setSelectedPrice(null);
    setSelectedChangePercent(null);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!open) return;

    if (initialHolding) {
      setFormState({
        name: initialHolding.name,
        symbol: initialHolding.symbol,
        qty: String(initialHolding.qty),
        avgPrice: String(initialHolding.avgPrice),
        app: initialHolding.app || "Manual",
        sourceUrl: initialHolding.sourceUrl || "",
      });
      setSelectedPrice(initialHolding.avgPrice);
      setActiveSelector(null);
      return;
    }

    resetDialogState();
  }, [initialHolding, open]);

  // Auto-fetch price when symbol is typed manually but not selected from dropdown
  useEffect(() => {
    if (!open || isEditMode || selectedPrice !== null || !formState.symbol || formState.symbol.length < 3) return;

    const timer = setTimeout(() => {
      fetchLivePrice(formState.symbol);
    }, 2000); // Wait 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [formState.symbol, selectedPrice, open, isEditMode, fetchLivePrice]);

  const handleSubmit = async () => {
    const name = formState.name.trim();
    const symbol = normalizeSymbol(formState.symbol || formState.name);
    const qty = Number(formState.qty);
    const avgPrice = Number(formState.avgPrice);
    const app = formState.app.trim() || "Manual";
    const sourceUrl = formState.sourceUrl.trim();

    if (!name || !symbol || qty <= 0 || avgPrice <= 0) {
      toast.error("Please fill valid stock details.");
      return;
    }

    const nextHolding: StockHolding = {
      symbol,
      name,
      qty,
      avgPrice,
      app,
      sourceUrl,
    };

    try {
      await saveHoldingMutation.mutateAsync({ holding: nextHolding, id: editId });
      await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      toast.success(isEditMode ? "Stock updated." : "Stock added.");
      resetDialogState();
      onOpenChange(false);
      onStockAdded?.();
    } catch (error) {
      toast.error("Failed to save holding.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="relative pr-20">
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
            {isEditMode ? "Edit Holding" : "Add New Holding"}
          </DialogTitle>
          {selectedPrice !== null && (
            <div className="absolute right-0 top-0 flex flex-col items-end">
              <div className="text-lg font-black tracking-tighter">
                {formatINR(selectedPrice)}
              </div>
              {selectedChangePercent !== null && (
                <div className={`text-[10px] font-bold ${selectedChangePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {selectedChangePercent >= 0 ? "+" : ""}{selectedChangePercent.toFixed(2)}%
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="relative space-y-1.5">
              <Label htmlFor="stock-name" className="text-xs font-bold uppercase text-muted-foreground">Asset Name</Label>
              <div className="relative">
                <Input
                  id="stock-name"
                  value={formState.name}
                  onChange={(event) => {
                    handleFormChange("name", event.target.value);
                    setActiveSelector(event.target.value.trim() ? "name" : null);
                  }}
                  onBlur={() => setTimeout(() => setActiveSelector(null), 200)}
                  placeholder="e.g. Reliance Industries"
                  className="h-10 sm:h-11"
                />
                {liveLoading && activeSelector === "name" && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {activeSelector === "name" && stockMatches.length > 0 && (
                <div className="absolute top-full z-50 mt-1 max-h-[400px] w-full overflow-y-auto rounded-xl border bg-popover/95 backdrop-blur-md p-1 shadow-2xl">
                  <div className="grid grid-cols-2 gap-1 min-h-[100px]">
                    {/* Stocks Column */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[9px] font-black uppercase text-emerald-500/80 tracking-widest border-b border-border/30 mb-1 bg-emerald-500/5 rounded-t-lg">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Stocks</span>
                      </div>
                      <div className="space-y-1">
                        {stockMatches.filter(s => s.type === "stock").length > 0 ? (
                          stockMatches.filter(s => s.type === "stock").map((stock) => (
                            <button
                              key={`${stock.symbol}-${stock.source}`}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleStockSelect(stock.name, stock.symbol, stock.ltp, stock.changePercent, stock.sourceUrl)}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-emerald-500/10 transition-all group border border-transparent hover:border-emerald-500/20"
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate font-bold text-[10px] group-hover:text-emerald-600 transition-colors">{stock.name}</span>
                                <span className="text-[8px] text-muted-foreground/60 font-medium uppercase">{stock.symbol}</span>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                {stock.ltp && <span className="text-[10px] font-black">{formatINR(stock.ltp)}</span>}
                                {stock.changePercent !== undefined && (
                                  <span className={`text-[8px] font-bold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-center text-[9px] text-muted-foreground/40 italic">No stocks found</div>
                        )}
                      </div>
                    </div>

                    {/* Mutual Funds Column */}
                    <div className="flex flex-col gap-1 border-l border-border/40 pl-1">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[9px] font-black uppercase text-blue-500/80 tracking-widest border-b border-border/30 mb-1 bg-blue-500/5 rounded-t-lg">
                        <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>Mutual Funds</span>
                      </div>
                      <div className="space-y-1">
                        {stockMatches.filter(s => s.type === "mf").length > 0 ? (
                          stockMatches.filter(s => s.type === "mf").map((stock) => (
                            <button
                              key={`${stock.symbol}-${stock.source}`}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleStockSelect(stock.name, stock.symbol, stock.ltp, stock.changePercent, stock.sourceUrl)}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-blue-500/10 transition-all group border border-transparent hover:border-blue-500/20"
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate font-bold text-[10px] group-hover:text-blue-600 transition-colors">{stock.name}</span>
                                <span className="text-[8px] text-muted-foreground/60 font-medium uppercase">{stock.symbol}</span>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                {stock.ltp && <span className="text-[10px] font-black">{formatINR(stock.ltp)}</span>}
                                {stock.changePercent !== undefined && (
                                  <span className={`text-[8px] font-bold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-center text-[9px] text-muted-foreground/40 italic">No funds found</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative space-y-1.5">
              <Label htmlFor="stock-symbol" className="text-xs font-bold uppercase text-muted-foreground">Symbol</Label>
              <Input
                id="stock-symbol"
                value={formState.symbol}
                onChange={(event) => handleFormChange("symbol", event.target.value)}
                onBlur={() => {
                  if (!selectedPrice && formState.symbol) fetchLivePrice(formState.symbol);
                }}
                placeholder="RELIANCE.NS"
                className="h-10 sm:h-11 uppercase font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stock-qty" className="text-xs font-bold uppercase text-muted-foreground">Quantity</Label>
                <Input
                  id="stock-qty"
                  type="number"
                  value={formState.qty}
                  onChange={(event) => handleFormChange("qty", event.target.value)}
                  placeholder="0"
                  className="h-10 sm:h-11 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock-price" className="text-xs font-bold uppercase text-muted-foreground">Avg. Price</Label>
                <Input
                  id="stock-price"
                  type="number"
                  value={formState.avgPrice}
                  onChange={(event) => handleFormChange("avgPrice", event.target.value)}
                  placeholder="0.00"
                  className="h-10 sm:h-11 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock-app" className="text-xs font-bold uppercase text-muted-foreground">Source / App</Label>
              <Input
                id="stock-app"
                value={formState.app}
                onChange={(event) => handleFormChange("app", event.target.value)}
                placeholder="Manual, Kite, Groww..."
                className="h-10 sm:h-11"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => handleClose(false)} className="flex-1 h-11 rounded-xl font-bold">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saveHoldingMutation.isPending} className="flex-1 h-11 rounded-xl font-bold">
            {saveHoldingMutation.isPending ? "Saving..." : isEditMode ? "Update" : "Add Asset"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
