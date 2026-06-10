import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMutualFund(symbol: string): boolean {
  if (!symbol) return false;
  const cleanSymbol = symbol.replace(".NS", "").replace(".BO", "").toUpperCase();
  return (
    /^[A-Z]{2,}[A-Z0-9_]*[0-9]+$/.test(cleanSymbol) ||
    cleanSymbol.includes("_") ||
    cleanSymbol.includes(":") ||
    cleanSymbol.length > 12 ||
    /FUND|GROWTH|DIRECT|REGULAR|PLAN/i.test(cleanSymbol)
  );
}
