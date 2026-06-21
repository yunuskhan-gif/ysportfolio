import { Transaction, PurchaseBucket, FIFOMatchDetail, TaxResult, TaxSettings } from './types';

/**
 * Calculates holding period difference in days between two date strings (YYYY-MM-DD)
 */
export function calculateDays(purchaseDateStr: string, saleDateStr: string): number {
  const pDate = new Date(purchaseDateStr);
  const sDate = new Date(saleDateStr);
  
  const pUtc = Date.UTC(pDate.getUTCFullYear(), pDate.getUTCMonth(), pDate.getUTCDate());
  const sUtc = Date.UTC(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate());
  
  const diffTime = sUtc - pUtc;
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(days) ? 0 : days;
}

/**
 * Calculates the FIFO match slice with expense tracking.
 */
export function calculate_fifo_sale(
  bucket: PurchaseBucket,
  useQuantity: number,
  salePrice: number,
  brokerage: number = 0,
  stt: number = 0,
  gst: number = 0,
  stampDuty: number = 0,
  otherCharges: number = 0,
  totalSaleQuantity: number = useQuantity
): {
  purchaseExpenses: number;
  saleExpenses: number;
  costOfAcquisition: number;
  saleValue: number;
  netGainLoss: number;
  saleValueNetOfExpenses: number;
} {
  // Pro-rata expenses of purchase
  const pRatio = useQuantity / bucket.originalQuantity;
  const purchaseExpenses = (
    (bucket.brokerage || 0) +
    (bucket.stt || 0) +
    (bucket.gst || 0) +
    (bucket.stampDuty || 0) +
    (bucket.otherCharges || 0)
  ) * pRatio;

  // Pro-rata expenses of sale
  const sRatio = useQuantity / totalSaleQuantity;
  const saleExpenses = (
    brokerage +
    stt +
    gst +
    stampDuty +
    otherCharges
  ) * sRatio;

  const costOfAcquisition = useQuantity * bucket.price;
  const saleValue = useQuantity * salePrice;
  
  const saleValueNetOfExpenses = saleValue - saleExpenses;
  const totalCostIncludingPurchaseExpenses = costOfAcquisition + purchaseExpenses;
  
  const netGainLoss = saleValueNetOfExpenses - totalCostIncludingPurchaseExpenses;

  return {
    purchaseExpenses,
    saleExpenses,
    costOfAcquisition,
    saleValue,
    netGainLoss,
    saleValueNetOfExpenses
  };
}

/**
 * Performs FIFO match tracking across all transactions and calculates gains & taxes
 */
export function calculateFIFOTax(
  transactions: Transaction[],
  settings: TaxSettings,
  previousStcgLoss: number = 0,
  previousLtcgLoss: number = 0
): {
  matchDetails: FIFOMatchDetail[];
  taxResult: TaxResult;
  warnings: string[];
} {
  const warnings: string[] = [];
  const matchDetails: FIFOMatchDetail[] = [];
  
  // Sort transactions chronologically
  const sortedTx = [...transactions].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    if (a.action === 'BUY' && b.action === 'SELL') return -1;
    if (a.action === 'SELL' && b.action === 'BUY') return 1;
    return 0;
  });

  const purchaseBuckets: Record<string, PurchaseBucket[]> = {};
  let totalBuyValue = 0;
  let totalSellValue = 0;

  for (const tx of sortedTx) {
    const symbol = tx.symbol.trim().toUpperCase();
    const quantity = Number(tx.quantity);
    const price = Number(tx.price);
    const value = quantity * price;
    
    if (tx.action === 'BUY') {
      totalBuyValue += value;
      if (!purchaseBuckets[symbol]) {
        purchaseBuckets[symbol] = [];
      }
      purchaseBuckets[symbol].push({
        date: tx.date,
        quantity: quantity,
        originalQuantity: quantity,
        price: price,
        brokerage: tx.brokerage || 0,
        stt: tx.stt || 0,
        gst: tx.gst || 0,
        stampDuty: tx.stampDuty || 0,
        otherCharges: tx.otherCharges || 0
      });
      purchaseBuckets[symbol].sort((a, b) => a.date.localeCompare(b.date));
      
    } else if (tx.action === 'SELL') {
      totalSellValue += value;
      let remainingToSell = quantity;
      const symbolBuckets = purchaseBuckets[symbol] || [];
      
      while (remainingToSell > 0 && symbolBuckets.length > 0) {
        const bucket = symbolBuckets[0];
        const useQuantity = Math.min(bucket.quantity, remainingToSell);
        
        const matchedSale = calculate_fifo_sale(
          bucket,
          useQuantity,
          tx.price,
          tx.brokerage || 0,
          tx.stt || 0,
          tx.gst || 0,
          tx.stampDuty || 0,
          tx.otherCharges || 0,
          quantity
        );

        const days = calculateDays(bucket.date, tx.date);
        const holdingType = days <= 365 ? 'STCG' : 'LTCG';

        matchDetails.push({
          id: `${tx.id}-${bucket.date}-${Math.random().toString(36).substring(2, 6)}`,
          symbol,
          purchaseDate: bucket.date,
          saleDate: tx.date,
          purchasePrice: bucket.price,
          salePrice: tx.price,
          quantitySold: useQuantity,
          holdingPeriodDays: days,
          holdingType,
          costOfAcquisition: matchedSale.costOfAcquisition,
          saleValue: matchedSale.saleValue,
          purchaseExpenses: matchedSale.purchaseExpenses,
          saleExpenses: matchedSale.saleExpenses,
          netGainLoss: matchedSale.netGainLoss
        });

        bucket.quantity -= useQuantity;
        remainingToSell -= useQuantity;

        if (bucket.quantity <= 0) {
          symbolBuckets.shift();
        }
      }

      if (remainingToSell > 0) {
        warnings.push(`Missing BUY records for ${remainingToSell} shares of ${symbol} sold on ${tx.date}.`);
        
        const sRatio = remainingToSell / quantity;
        const saleExpenses = ((tx.brokerage || 0) + (tx.stt || 0) + (tx.gst || 0)) * sRatio;

        matchDetails.push({
          id: `${tx.id}-short-${Math.random().toString(36).substring(2, 6)}`,
          symbol,
          purchaseDate: tx.date,
          saleDate: tx.date,
          purchasePrice: 0,
          salePrice: tx.price,
          quantitySold: remainingToSell,
          holdingPeriodDays: 0,
          holdingType: 'STCG',
          costOfAcquisition: 0,
          saleValue: remainingToSell * tx.price,
          purchaseExpenses: 0,
          saleExpenses,
          netGainLoss: (remainingToSell * tx.price) - saleExpenses
        });
      }
    }
  }

  // Calculate gross variables
  let grossStcgGains = 0, grossStcgLosses = 0;
  let grossLtcgGains = 0, grossLtcgLosses = 0;
  let netRealizedGains = 0;

  for (const detail of matchDetails) {
    netRealizedGains += detail.netGainLoss;
    if (detail.holdingType === 'STCG') {
      if (detail.netGainLoss >= 0) grossStcgGains += detail.netGainLoss;
      else grossStcgLosses += Math.abs(detail.netGainLoss);
    } else {
      if (detail.netGainLoss >= 0) grossLtcgGains += detail.netGainLoss;
      else grossLtcgLosses += Math.abs(detail.netGainLoss);
    }
  }

  // Tax Loss Harvesting Offset Priority
  let remainingStcl = grossStcgLosses;
  let remainingLtcl = grossLtcgLosses;
  let stcgAfterCurrentLossSetoff = grossStcgGains;
  let ltcgAfterCurrentLossSetoff = grossLtcgGains;
  let currentYearLossOffsetUsed = 0;

  // 1. STCL offsets STCG
  if (stcgAfterCurrentLossSetoff > 0 && remainingStcl > 0) {
    const used = Math.min(stcgAfterCurrentLossSetoff, remainingStcl);
    stcgAfterCurrentLossSetoff -= used;
    remainingStcl -= used;
    currentYearLossOffsetUsed += used;
  }
  // 2. STCL offsets LTCG
  if (ltcgAfterCurrentLossSetoff > 0 && remainingStcl > 0) {
    const used = Math.min(ltcgAfterCurrentLossSetoff, remainingStcl);
    ltcgAfterCurrentLossSetoff -= used;
    remainingStcl -= used;
    currentYearLossOffsetUsed += used;
  }
  // 3. LTCL offsets LTCG (LTCL cannot offset STCG)
  if (ltcgAfterCurrentLossSetoff > 0 && remainingLtcl > 0) {
    const used = Math.min(ltcgAfterCurrentLossSetoff, remainingLtcl);
    ltcgAfterCurrentLossSetoff -= used;
    remainingLtcl -= used;
    currentYearLossOffsetUsed += used;
  }

  // Carry Forward Offsets
  let remainingPreviousStcgLoss = previousStcgLoss;
  let remainingPreviousLtcgLoss = previousLtcgLoss;
  let stcgAfterAllSetoff = stcgAfterCurrentLossSetoff;
  let ltcgAfterAllSetoff = ltcgAfterCurrentLossSetoff;
  let previousLossOffsetAmountUsed = 0;

  if (ltcgAfterAllSetoff > 0 && remainingPreviousLtcgLoss > 0) {
    const used = Math.min(ltcgAfterAllSetoff, remainingPreviousLtcgLoss);
    ltcgAfterAllSetoff -= used;
    remainingPreviousLtcgLoss -= used;
    previousLossOffsetAmountUsed += used;
  }
  if (stcgAfterAllSetoff > 0 && remainingPreviousStcgLoss > 0) {
    const used = Math.min(stcgAfterAllSetoff, remainingPreviousStcgLoss);
    stcgAfterAllSetoff -= used;
    remainingPreviousStcgLoss -= used;
    previousLossOffsetAmountUsed += used;
  }
  if (ltcgAfterAllSetoff > 0 && remainingPreviousStcgLoss > 0) {
    const used = Math.min(ltcgAfterAllSetoff, remainingPreviousStcgLoss);
    ltcgAfterAllSetoff -= used;
    remainingPreviousStcgLoss -= used;
    previousLossOffsetAmountUsed += used;
  }

  const stcgTaxable = Math.max(0, stcgAfterAllSetoff);
  const stcgTax = stcgTaxable * settings.stcgRate;

  const ltcgExemptionLimit = settings.ltcgExemption;
  const ltcgExemptionUsed = ltcgAfterAllSetoff > 0 ? Math.min(ltcgExemptionLimit, ltcgAfterAllSetoff) : 0;
  
  const ltcgTaxable = Math.max(0, ltcgAfterAllSetoff - ltcgExemptionUsed);
  const ltcgTax = ltcgTaxable * settings.ltcgRate;

  return {
    matchDetails,
    warnings,
    taxResult: {
      totalBuyValue,
      totalSellValue,
      stcg: Math.max(0, grossStcgGains - grossStcgLosses),
      ltcg: Math.max(0, grossLtcgGains - grossLtcgLosses),
      stcgTaxRate: settings.stcgRate,
      ltcgTaxRate: settings.ltcgRate,
      ltcgExemptionLimit,
      stcgTaxable,
      ltcgTaxable,
      stcgTax,
      ltcgTax,
      ltcgExemptionUsed,
      previousLossOffsetApplied: previousStcgLoss + previousLtcgLoss,
      previousLossOffsetAmountUsed,
      totalTax: stcgTax + ltcgTax,
      netRealizedGains,
      grossStcgGains,
      grossStcgLosses,
      grossLtcgGains,
      grossLtcgLosses,
      currentYearLossOffsetUsed
    }
  };
}

/**
 * Generic Parser for CSV Import
 */
export function parseBrokerCSV(csvContent: string): { transactions: Transaction[]; errors: string[] } {
  const transactions: Transaction[] = [];
  const errors: string[] = [];
  const lines = csvContent.split(/\r?\n/);
  if (lines.length < 2) return { transactions, errors: ['CSV is empty or lacks headers.'] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const findColIndex = (names: string[]): number => 
    headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));

  const symbolIdx = findColIndex(['symbol', 'stock', 'scrip', 'company', 'instrument']);
  const actionIdx = findColIndex(['transaction', 'type', 'action', 'buy/sell', 'side']);
  const quantityIdx = findColIndex(['quantity', 'qty', 'shares', 'vol', 'volume']);
  const priceIdx = findColIndex(['price', 'average price', 'avg price', 'rate']);
  const dateIdx = findColIndex(['date', 'trade date', 'transaction date', 'trade_date']);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 4) continue;

    const sSym = symbolIdx !== -1 ? cols[symbolIdx] : cols[0];
    const sAct = actionIdx !== -1 ? cols[actionIdx] : cols[1];
    const sQty = quantityIdx !== -1 ? cols[quantityIdx] : cols[2];
    const sPri = priceIdx !== -1 ? cols[priceIdx] : cols[3];
    const sDat = dateIdx !== -1 ? cols[dateIdx] : cols[4] || new Date().toISOString().split('T')[0];

    const action = (sAct.toUpperCase().includes('S') || sAct.toUpperCase().includes('SELL')) ? 'SELL' : 'BUY';
    const quantity = Number(sQty);
    const price = Number(sPri);

    if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0) continue;

    transactions.push({
      id: `imported-${i}-${Math.random().toString(36).substring(2, 6)}`,
      symbol: sSym.toUpperCase(),
      action,
      quantity,
      price,
      date: sDat,
      brokerage: 0,
      stt: 0,
      gst: 0,
      stampDuty: 0,
    });
  }
  return { transactions, errors };
}
