import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  Calendar,
} from "lucide-react";

interface TradeHistoryProps {
  targetUserId?: string;
}

// Dummy trade data
const dummyTrades = [
  {
    id: "1",
    date: "2024-02-26",
    symbol: "RELIANCE",
    type: "BUY",
    quantity: 100,
    price: 2456.75,
    pnl: +1250.5,
    segment: "EQUITY",
    strategy: "Momentum",
  },
  {
    id: "2",
    date: "2024-02-26",
    symbol: "TCS",
    type: "SELL",
    quantity: 50,
    price: 3567.25,
    pnl: -875.25,
    segment: "EQUITY",
    strategy: "Swing",
  },
  {
    id: "3",
    date: "2024-02-25",
    symbol: "BANKNIFTY",
    type: "BUY",
    quantity: 25,
    price: 48750.0,
    pnl: +3250.0,
    segment: "OPTION",
    strategy: "Scalping",
  },
  {
    id: "4",
    date: "2024-02-25",
    symbol: "HDFC",
    type: "BUY",
    quantity: 200,
    price: 1650.3,
    pnl: +890.4,
    segment: "EQUITY",
    strategy: "Breakout",
  },
  {
    id: "5",
    date: "2024-02-24",
    symbol: "NIFTY",
    type: "SELL",
    quantity: 75,
    price: 22350.0,
    pnl: -1250.0,
    segment: "FUTURES",
    strategy: "Reversal",
  },
  {
    id: "6",
    date: "2024-02-24",
    symbol: "INFY",
    type: "BUY",
    quantity: 150,
    price: 1450.6,
    pnl: +2340.8,
    segment: "EQUITY",
    strategy: "Momentum",
  },
  {
    id: "7",
    date: "2024-02-23",
    symbol: "SBIN",
    type: "BUY",
    quantity: 500,
    price: 678.9,
    pnl: -567.3,
    segment: "EQUITY",
    strategy: "Positional",
  },
  {
    id: "8",
    date: "2024-02-23",
    symbol: "BAJFINANCE",
    type: "SELL",
    quantity: 30,
    price: 6789.5,
    pnl: +1875.0,
    segment: "EQUITY",
    strategy: "Swing",
  },
];

// eslint-disable-next-line no-empty-pattern
export default function TradeHistory({ }: TradeHistoryProps) {
  // ✅ Add prop
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

 

  const filteredTrades = dummyTrades.filter((trade) => {
    const matchesSearch =
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.strategy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSegment =
      segmentFilter === "all" || trade.segment === segmentFilter;

    const matchesType = typeFilter === "all" || trade.type === typeFilter;

    return matchesSearch && matchesSegment && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trades..."
              className="pl-9 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="EQUITY">Equity</SelectItem>
              <SelectItem value="OPTION">Options</SelectItem>
              <SelectItem value="FUTURES">Futures</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="BUY">Buy</SelectItem>
              <SelectItem value="SELL">Sell</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Trades Table */}
      <Card className="overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Strategy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow
                  key={trade.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs">
                    {new Date(trade.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        trade.type === "BUY"
                          ? "border-green-500/30 bg-green-500/10 text-green-600"
                          : "border-red-500/30 bg-red-500/10 text-red-600"
                      }
                    >
                      {trade.type === "BUY" ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right font-mono">
                    ₹{trade.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {trade.pnl >= 0 ? "+" : ""}₹
                      {Math.abs(trade.pnl).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {trade.segment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {trade.strategy}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer with summary */}
        <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Showing{" "}
              <span className="text-foreground font-medium">
                {filteredTrades.length}
              </span>{" "}
              trades
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
