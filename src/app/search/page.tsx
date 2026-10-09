"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  Globe,
  BarChart3,
  Star,
  BookmarkCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
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

interface WishlistItem {
  id?: string;
  symbol: string;
  name: string;
  sector?: string;
  type?: "stock" | "mf";
  ltp?: number;
  change?: number;
  changePercent?: number;
  createdAt?: string;
}

export default function MarketSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "wishlist">("all");
  const queryClient = useQueryClient();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Watchlist / Wishlist states
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [favoriteSymbols, setFavoriteSymbols] = useState<Set<string>>(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState<boolean>(true);

  // Add stock dialog states
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<StockHolding | null>(null);

  // Screener dialog states
  const [screenerSymbol, setScreenerSymbol] = useState<string | null>(null);
  const [screenerName, setScreenerName] = useState<string>("");
  const [isScreenerOpen, setIsScreenerOpen] = useState(false);
  const [screenerLtp, setScreenerLtp] = useState<number | undefined>(undefined);
  const [screenerChangePercent, setScreenerChangePercent] = useState<number | undefined>(undefined);

  // 1. Fetch user's wishlist from API
  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/watchlist/stocks");
      if (res.ok) {
        const data = await res.json();
        if (data.watchlist && Array.isArray(data.watchlist)) {
          setWishlist(data.watchlist);
          const symbols = new Set<string>(
            data.watchlist.map((item: WishlistItem) => item.symbol.trim().toUpperCase())
          );
          setFavoriteSymbols(symbols);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch wishlist:", err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // 2. Toggle Favorite / Wishlist
  const handleToggleFavorite = async (stock: SearchResult | WishlistItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const cleanSym = stock.symbol.trim().toUpperCase();
    const isCurrentlyFav = favoriteSymbols.has(cleanSym);

    // Optimistic UI update
    setFavoriteSymbols((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFav) {
        next.delete(cleanSym);
      } else {
        next.add(cleanSym);
      }
      return next;
    });

    if (isCurrentlyFav) {
      setWishlist((prev) => prev.filter((i) => i.symbol.trim().toUpperCase() !== cleanSym));
    } else {
      const newItem: WishlistItem = {
        symbol: cleanSym,
        name: stock.name,
        sector: stock.sector || "Equities",
        type: stock.type || "stock",
        ltp: stock.ltp,
        change: stock.change,
        changePercent: stock.changePercent,
        createdAt: new Date().toISOString(),
      };
      setWishlist((prev) => [newItem, ...prev.filter((i) => i.symbol.trim().toUpperCase() !== cleanSym)]);
    }

    try {
      const res = await fetch("/api/watchlist/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: cleanSym,
          name: stock.name,
          sector: stock.sector || "Equities",
          type: stock.type || "stock",
          ltp: stock.ltp,
          change: stock.change,
          changePercent: stock.changePercent,
          action: "toggle",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.isFavorite) {
          toast.success(`⭐ Added ${stock.name} to Wishlist`, {
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid rgba(245, 158, 11, 0.4)",
            },
          });
        } else {
          toast(`${stock.name} removed from Wishlist`, {
            icon: "🗑️",
            style: {
              background: "#0f172a",
              color: "#94a3b8",
            },
          });
        }
      } else {
        // Rollback on server failure
        fetchWishlist();
        toast.error("Failed to update wishlist on server");
      }
    } catch (err) {
      // Rollback
      fetchWishlist();
      toast.error("Network error updating wishlist");
    }
  };

  const handleOpenScreener = (stock: SearchResult | WishlistItem) => {
    setScreenerSymbol(stock.symbol);
    setScreenerName(stock.name);
    setScreenerLtp(stock.ltp);
    setScreenerChangePercent(stock.changePercent);
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

  const handleAddStock = (stock: SearchResult | WishlistItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedHolding({
      name: stock.name,
      symbol: stock.symbol.includes(".") ? stock.symbol : `${stock.symbol}.NS`,
      qty: 1,
      avgPrice: stock.ltp || 0,
      app: stock.type === "mf" ? "MF" : "NSE",
      sourceUrl: (stock as any).sourceUrl,
    });
    setIsAddStockOpen(true);
  };

  // Filtered wishlist items matching current query if typed in wishlist tab
  const displayedWishlist = query.trim()
    ? wishlist.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.symbol.toLowerCase().includes(query.toLowerCase())
      )
    : wishlist;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl min-w-0 mx-auto pt-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title & Header */}
      <div className="text-center space-y-3 mb-8 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Market & Watchlist Hub</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Market Intelligence & Wishlist
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Search 10,000+ Indian Stocks & Mutual Funds, pin your favorite assets, and monitor live NSE prices.
        </p>
      </div>

      {/* Tabs: All Search vs My Wishlist */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/40 mb-6 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-background text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Market Search</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "wishlist"
              ? "bg-amber-500/15 text-amber-400 shadow-sm border border-amber-500/30"
              : "text-muted-foreground hover:text-amber-400"
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>My Wishlist / Favorites</span>
          <Badge
            variant="secondary"
            className="ml-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] px-1.5 py-0 h-4"
          >
            {wishlist.length}
          </Badge>
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="relative w-full max-w-2xl group">
        <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === "wishlist"
                ? "Filter your wishlisted stocks..."
                : "Search stocks, ETFs, mutual funds (e.g. Reliance, TCS, HDFC)..."
            }
            className="h-14 pl-12 pr-12 text-base sm:text-lg shadow-xl border-border/50 bg-background/80 backdrop-blur-sm rounded-2xl focus-visible:ring-primary/30 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
            </div>
          )}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ALL SEARCH RESULTS                                       */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {activeTab === "all" && (
        <div className="w-full">
          <div className="grid w-full gap-4 mt-10 md:grid-cols-2">
            {results.length > 0 ? (
              results.map((item) => {
                const isFav = favoriteSymbols.has(item.symbol.trim().toUpperCase());
                return (
                  <Card
                    key={item.symbol}
                    className={`group overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative ${
                      isFav ? "ring-1 ring-amber-500/20 bg-amber-500/[0.02]" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Top Bar inside Card */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          title="Click to view Screener analysis and charts"
                          onClick={() => handleOpenScreener(item)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold truncate text-base group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            {item.type === "mf" ? (
                              <Badge
                                variant="secondary"
                                className="bg-blue-500/10 text-blue-500 text-[10px] font-bold border-none h-5 px-1.5 shrink-0"
                              >
                                MF
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border-none h-5 px-1.5 shrink-0"
                              >
                                STOCK
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono font-medium text-primary/70">{item.symbol}</span>
                            <span>•</span>
                            <span className="truncate">{item.sector}</span>
                          </div>
                        </div>

                        {/* Top-Right: Quick Star Button & Price */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(item, e)}
                            title={isFav ? "Remove from Wishlist" : "Add to Wishlist / Favorites"}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isFav
                                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 shadow-xs"
                                : "text-muted-foreground hover:text-amber-400 hover:bg-muted/50"
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 transition-transform active:scale-125 ${
                                isFav ? "fill-amber-400 text-amber-400" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Price Display */}
                      <div
                        className="flex items-center justify-between p-2 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer my-2"
                        onClick={() => handleOpenScreener(item)}
                      >
                        <span className="text-xs text-muted-foreground font-medium">Market Price (LTP)</span>
                        <div className="flex items-center gap-2.5">
                          {item.ltp ? (
                            <>
                              <div className="text-base font-black tracking-tight text-foreground font-mono">
                                ₹
                                {item.ltp.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                              {item.changePercent !== undefined && (
                                <div
                                  className={`flex items-center gap-0.5 text-xs font-mono font-bold ${
                                    item.changePercent >= 0 ? "text-emerald-500" : "text-red-500"
                                  }`}
                                >
                                  {item.changePercent >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  <span>{Math.abs(item.changePercent).toFixed(2)}%</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Live price pending</span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenScreener(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
                          >
                            <BarChart3 className="w-3 h-3 text-primary" /> Screener & Chart
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Wishlist toggle button */}
                          <Button
                            size="sm"
                            variant={isFav ? "secondary" : "outline"}
                            className={`h-8 px-2.5 text-xs font-bold gap-1 rounded-xl cursor-pointer transition-all ${
                              isFav
                                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30"
                                : "hover:border-amber-400/60 hover:text-amber-400"
                            }`}
                            onClick={(e) => handleToggleFavorite(item, e)}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                            <span>{isFav ? "In Wishlist" : "Wishlist"}</span>
                          </Button>

                          {/* Add to Portfolio button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs font-bold gap-1 hover:bg-primary hover:text-primary-foreground transition-all rounded-xl border-primary/30 cursor-pointer"
                            onClick={(e) => handleAddStock(item, e)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : query && !loading ? (
              <div className="col-span-full py-16 text-center space-y-3">
                <div className="inline-flex p-4 rounded-full bg-muted/30">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-sm italic">No assets found for &quot;{query}&quot;</p>
              </div>
            ) : null}
          </div>

          {/* Empty search: Show Pinned Wishlist Preview & Popular Suggestions */}
          {!query && (
            <div className="w-full mt-10 space-y-8">
              {/* If user has wishlisted items, display them right on the main search screen! */}
              {wishlist.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Your Pinned Wishlist ({wishlist.length})
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {wishlist.slice(0, 6).map((item) => (
                      <div
                        key={item.symbol}
                        onClick={() => handleOpenScreener(item)}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card/60 hover:bg-muted/40 hover:border-amber-500/40 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-sm truncate group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground uppercase">{item.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.ltp ? (
                            <div className="text-right">
                              <span className="font-mono font-bold text-xs text-foreground block">
                                ₹{item.ltp.toLocaleString("en-IN")}
                              </span>
                              {item.changePercent !== undefined && (
                                <span
                                  className={`text-[10px] font-mono font-semibold block ${
                                    item.changePercent >= 0 ? "text-emerald-500" : "text-rose-500"
                                  }`}
                                >
                                  {item.changePercent >= 0 ? "+" : ""}
                                  {item.changePercent.toFixed(2)}%
                                </span>
                              )}
                            </div>
                          ) : null}
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(item, e)}
                            title="Remove from Wishlist"
                            className="p-1.5 rounded-lg text-amber-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Star className="w-4 h-4 fill-amber-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Popular Indian Market Searches
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    "Reliance",
                    "Tata Motors",
                    "HDFC Bank",
                    "TCS",
                    "SBI Mutual Fund",
                    "Infosys",
                    "ITC",
                    "Adani Enterprises",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="p-3 rounded-xl border border-dashed border-border/60 hover:border-primary/50 flex items-center justify-between gap-2 hover:bg-muted/40 transition-all group text-left cursor-pointer"
                    >
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground truncate">
                        {term}
                      </span>
                      <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* TAB 2: MY WISHLIST / FAVORITES VIEW                             */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {activeTab === "wishlist" && (
        <div className="w-full mt-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>My Wishlist & Favorite Stocks</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assets pinned to your private host-isolated watchlist for quick monitoring and portfolio addition.
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-amber-500/10 border-amber-500/30 text-amber-400 font-mono text-xs px-2.5 py-1"
            >
              {wishlist.length} {wishlist.length === 1 ? "Stock" : "Stocks"} Saved
            </Badge>
          </div>

          {displayedWishlist.length > 0 ? (
            <div className="grid w-full gap-4 md:grid-cols-2">
              {displayedWishlist.map((item) => (
                <Card
                  key={item.symbol}
                  className="group overflow-hidden border-border/40 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 relative bg-card/80"
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        title="Click to view Screener analysis and charts"
                        onClick={() => handleOpenScreener(item)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold truncate text-base group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border-none h-5 px-1.5 shrink-0"
                          >
                            {item.type === "mf" ? "MF" : "STOCK"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono font-medium text-primary/70">{item.symbol}</span>
                          <span>•</span>
                          <span className="truncate">{item.sector || "Equities"}</span>
                        </div>
                      </div>

                      {/* Un-favorite button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(item, e)}
                        title="Remove from Wishlist"
                        className="p-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-rose-500/15 hover:text-rose-400 transition-all cursor-pointer group/star"
                      >
                        <Star className="w-4 h-4 fill-amber-400 group-hover/star:hidden" />
                        <Trash2 className="w-4 h-4 hidden group-hover/star:block" />
                      </button>
                    </div>

                    {/* Price details */}
                    <div
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer my-2"
                      onClick={() => handleOpenScreener(item)}
                    >
                      <span className="text-xs text-muted-foreground font-medium">Market Price</span>
                      <div className="flex items-center gap-2.5">
                        {item.ltp ? (
                          <>
                            <div className="text-base font-black tracking-tight text-foreground font-mono">
                              ₹
                              {item.ltp.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            {item.changePercent !== undefined && (
                              <div
                                className={`flex items-center gap-0.5 text-xs font-mono font-bold ${
                                  item.changePercent >= 0 ? "text-emerald-500" : "text-red-500"
                                }`}
                              >
                                {item.changePercent >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span>{Math.abs(item.changePercent).toFixed(2)}%</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">₹ — (Tap to screen)</span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenScreener(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
                      >
                        <BarChart3 className="w-3 h-3 text-primary" /> Screener & Chart
                      </button>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                          onClick={(e) => handleToggleFavorite(item, e)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Remove</span>
                        </Button>

                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs font-bold gap-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-xl cursor-pointer"
                          onClick={(e) => handleAddStock(item, e)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Portfolio</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-16 text-center space-y-4 rounded-3xl border border-dashed border-border/60 p-8 bg-muted/10">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Star className="w-8 h-8 fill-amber-400/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Your Wishlist is Empty</h3>
                <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                  Search any stock or mutual fund above and click the{" "}
                  <strong className="text-amber-400">Star (Wishlist)</strong> icon to track it here.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("all")}
                className="rounded-xl border-primary/30 text-xs font-semibold cursor-pointer"
              >
                Go to Market Search
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
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
          initialPrice={screenerLtp}
          changePercent={screenerChangePercent}
        />
      )}
    </div>
  );
}
