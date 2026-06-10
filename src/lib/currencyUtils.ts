import type { MarketType } from "@/redux/slices/marketSlice";

export const getCurrencySymbol = (market?: MarketType): string => {
  if (market === 'crypto' || market === 'forex') {
    return '$';
  }
  return '₹';
};

export const getLocale = (market?: MarketType): string => {
  if (market === 'crypto' || market === 'forex') {
    return 'en-US';
  }
  return 'en-IN';
};

export function formatCurrency(
  value: number,
  market?: MarketType,
  options: { shorten?: boolean; decimals?: number } = {}
): string {
  if (!isFinite(value)) return "0";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const symbol = getCurrencySymbol(market);
  const locale = getLocale(market);

  const { shorten = true, decimals = 0 } = options;

  if (shorten) {
    const units = market === 'crypto' || market === 'forex' 
      ? ["", "K", "M", "B", "T"] 
      : ["", "k", "L", "Cr", "kCr", "LCr"]; // Indian units

    if (market === 'crypto' || market === 'forex') {
      // Standard International Shortening
      let unitIndex = 0;
      let num = absValue;
      while (num >= 1000 && unitIndex < units.length - 1) {
        num /= 1000;
        unitIndex++;
      }
      const formatted = num % 1 === 0 ? num.toString() : num.toFixed(num < 10 ? 1 : 0);
      return `${sign}${symbol}${formatted}${units[unitIndex]}`;
    } else {
      // Indian Shortening (Lakhs, Crores)
      if (absValue >= 1000000000000) {
        return `${sign}${symbol}${(absValue / 1000000000000).toFixed(1)}LCr`;
      } else if (absValue >= 10000000000) {
        return `${sign}${symbol}${(absValue / 10000000000).toFixed(1)}kCr`;
      } else if (absValue >= 10000000) {
        return `${sign}${symbol}${(absValue / 10000000).toFixed(1)}Cr`;
      } else if (absValue >= 100000) {
        return `${sign}${symbol}${(absValue / 100000).toFixed(1)}L`;
      } else if (absValue >= 1000) {
        return `${sign}${symbol}${(absValue / 1000).toFixed(1)}K`;
      }
    }
  }

  // Full formatting
  const formattedValue = absValue.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${sign}${symbol}${formattedValue}`;
}
