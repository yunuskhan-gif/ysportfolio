import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useMarket } from "@/hooks/useMarket";
import * as React from "react";
import { useState, useEffect } from "react";

const marketOptions = [
  { value: "equity", label: "Equity" },
  { value: "option", label: "Options" },
  { value: "crypto", label: "Crypto-Futures" },
] as const;

export function MarketSelect() {
  const { selectedMarket, setSelectedMarket } = useMarket();
  const [open, setOpen] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedMarket = localStorage.getItem("explore") as
      | "equity"
      | "option"
      | "crypto"
      | null;
    if (
      savedMarket &&
      (savedMarket === "equity" ||
        savedMarket === "option" ||
        savedMarket === "crypto")
    ) {
      setSelectedMarket(savedMarket);
    }
  }, [setSelectedMarket]);

  const handleChange = (value: string) => {
    setSelectedMarket(value as typeof selectedMarket);
  };

  const handleMouseEnter = () => {
    if (window.innerWidth < 1024) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      timeoutRef.current = null;
    }, 2000);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Button
            variant="outline"
            className="flex items-center gap-1.5 shadow-none h-7 text-xs px-2.5"
          >
            <span className="capitalize">
              {marketOptions.find((opt) => opt.value === selectedMarket)?.label ||
                selectedMarket}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenuLabel>Market</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selectedMarket}
            onValueChange={handleChange}
          >
            {marketOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}
