"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Home,
  Wallet,
  History,
  TrendingUp,
  Loader2,
  Globe,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface SearchResult {
  symbol: string;
  name: string;
  type: "stock" | "mf";
  ltp?: number;
  changePercent?: number;
}

export function CommandMenu({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const searchTimer = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

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

  React.useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.trim().length >= 2) {
      searchTimer.current = setTimeout(() => fetchResults(query), 300);
    } else {
      setResults([]);
    }
  }, [query]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setQuery("");
    }}>
      <CommandInput 
        placeholder="Search stocks, mutual funds or commands..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[450px] overflow-y-auto">
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Live Market Results">
            {results.map((item) => (
              <CommandItem
                key={item.symbol}
                onSelect={() => {
                  const params = new URLSearchParams({
                    add: item.symbol,
                    name: item.name,
                    price: String(item.ltp || "")
                  });
                  runCommand(() => router.push(`/portfolio?${params.toString()}`));
                }}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.type === 'mf' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-bold text-sm">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">{item.symbol}</span>
                  </div>
                </div>
                {item.ltp && (
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-black tracking-tighter">
                      ₹{item.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {item.changePercent !== undefined && (
                      <span className={`text-[10px] font-bold ${item.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/portfolio"))}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Portfolio</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="System">
          <CommandItem onSelect={() => runCommand(() => router.push("/history"))}>
            <History className="mr-2 h-4 w-4" />
            <span>Trade History</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
