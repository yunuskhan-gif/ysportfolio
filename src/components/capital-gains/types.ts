export interface Transaction {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: string; // Format: YYYY-MM-DD
  brokerage: number; // Default 0
  stt: number;      // Securities Transaction Tax (Default 0)
  gst: number;      // Goods and Services Tax (Default 0)
  stampDuty: number; // Stamp Duty (Default 0)
  otherCharges?: number; // Other Exchange Transaction charges
}

export interface PurchaseBucket {
  date: string;
  quantity: number; // Remaining quantity to sell of this purchase lot
  originalQuantity: number; // Original purchased quantity
  price: number;
  brokerage: number;
  stt: number;
  gst: number;
  stampDuty: number;
  otherCharges: number;
}

export interface FIFOMatchDetail {
  id: string;
  symbol: string;
  purchaseDate: string;
  saleDate: string;
  purchasePrice: number;
  salePrice: number;
  quantitySold: number;
  holdingPeriodDays: number;
  holdingType: 'STCG' | 'LTCG'; // STCG if <= 365 days, LTCG if > 365 days
  costOfAcquisition: number; // qty * purchasePrice
  saleValue: number;          // qty * salePrice
  purchaseExpenses: number;   // pro-rata proportional purchase cost elements
  saleExpenses: number;       // pro-rata proportional sale cost elements
  netGainLoss: number;        // saleValue - costOfAcquisition - purchaseExpenses - saleExpenses
}

export interface TaxResult {
  totalBuyValue: number;
  totalSellValue: number;
  stcg: number;          // Short Term Capital Gains
  ltcg: number;          // Long Term Capital Gains
  stcgTaxRate: number;   // e.g., 0.20 (20%)
  ltcgTaxRate: number;   // e.g., 0.125 (12.5%)
  ltcgExemptionLimit: number; // ₹1,25,000 for FY 2025-26
  stcgTaxable: number;
  ltcgTaxable: number;
  stcgTax: number;
  ltcgTax: number;
  ltcgExemptionUsed: number;
  previousLossOffsetApplied: number;
  previousLossOffsetAmountUsed: number;
  totalTax: number;
  netRealizedGains: number; // Total net actual gain/loss across portfolio
  grossStcgGains: number;   // Gross short-term gains (profit-only)
  grossStcgLosses: number;  // Gross short-term losses (loss-only)
  grossLtcgGains: number;   // Gross long-term gains (profit-only)
  grossLtcgLosses: number;  // Gross long-term losses (loss-only)
  currentYearLossOffsetUsed: number; // Total current year loss harvested offsets
}

export interface TaxSettings {
  stcgRate: number;       // DEFAULT: 20%
  ltcgRate: number;       // DEFAULT: 12.5%
  ltcgExemption: number;  // DEFAULT: 125000
  previousLossOffset: number; // Set-off of book losses, e.g. previous year loss
}
