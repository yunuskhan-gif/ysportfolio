import { formatCurrency } from "./currencyUtils";

/**
 * @deprecated Use formatCurrency from currencyUtils instead for market-aware formatting.
 * This remains for backward compatibility.
 */
export function currencyFormat(value: number): string {
    // Default to en-IN/Rupee for legacy callers if no market is provided
    // but the new utility handles the core logic.
    return formatCurrency(value, 'equity', { shorten: true });
}
  