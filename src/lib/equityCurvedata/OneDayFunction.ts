import { getTime24, toISTDate } from "../TimeFormat";

export interface TradingInputData {
  timestamp: string;
  _raw?: string;
  profit: number;
  loss: number;
  profitTrades: number;
  lossTrades: number;
}

export interface TradingData {
  timestamp: string;
  time?: string;
  _raw?: string;
  profit: number;
  loss: number;
  profitTrades: number;
  lossTrades: number;
  pnl: number;
  totalTrades: number;
}

export function FormatTime(timestamp: string, timeRange: string = '1d', onlyTime: boolean = false): string {
  if (!timestamp) return "N/A";
  
  const date = toISTDate(timestamp);
  if (isNaN(date.getTime())) return "N/A";

  if (onlyTime) return getTime24(date);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    hour12: false,
  };

  switch (timeRange) {
    case '1d': {
      return getTime24(date);
    }

    case '1w':
      return new Intl.DateTimeFormat('en-GB', {
        ...options,
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      }).format(date);

    case '1m':
      return new Intl.DateTimeFormat('en-GB', {
        ...options,
        month: 'numeric',
        day: 'numeric',
      }).format(date);

    case '1y':
      return new Intl.DateTimeFormat('en-GB', {
        ...options,
        month: 'short',
        year: 'numeric',
      }).format(date);

    default:
      return new Intl.DateTimeFormat('en-GB', {
        ...options,
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
  }
}





export default function OneDayFunction(
  input: TradingInputData[] = [],
  range: '1d' | '1w' | '1m' | '1y'
): TradingData[] {
  if (range === "1d") {
    // Standard market hours (IST): 09:15 to 15:30
    const fixedIntervals = [
      { label: "09:00 - 10:00", start: 9 * 60 },
      { label: "10:00 - 11:00", start: 10 * 60 },
      { label: "11:00 - 12:00", start: 11 * 60 },
      { label: "12:00 - 13:00", start: 12 * 60 },
      { label: "13:00 - 14:00", start: 13 * 60 },
      { label: "14:00 - 15:00", start: 14 * 60 },
      { label: "15:00 - 15:30", start: 15 * 60 },
    ];

    const resultsMap = new Map<string, any>();

    fixedIntervals.forEach((interval) => {
      resultsMap.set(interval.label, {
        timestamp: interval.label,
        time: interval.label,
        _raw: "", 
        profit: 0,
        loss: 0,
        profitTrades: 0,
        lossTrades: 0,
        pnl: 0,
        totalTrades: 0,
        _rawDate: interval.start, 
      });
    });

    if (input && input.length > 0) {
      input.forEach((item) => {
        const profit = item.profit ?? 0;
        const loss = item.loss ?? 0;
        const rawTimestamp = item._raw || item.timestamp;
        const currentDate = toISTDate(rawTimestamp);
        const hh = currentDate.getHours();
        const mm = currentDate.getMinutes();
        const t = hh * 60 + mm;
        const timeStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

        let label = "";

        // Adjustment: Make boundaries inclusive at the end (e.g. 15:00 goes into 14:00-15:00 bucket)
        if (t >= 9 * 60 && t <= 10 * 60) label = "09:00 - 10:00";
        else if (t > 10 * 60 && t <= 11 * 60) label = "10:00 - 11:00";
        else if (t > 11 * 60 && t <= 12 * 60) label = "11:00 - 12:00";
        else if (t > 12 * 60 && t <= 13 * 60) label = "12:00 - 13:00";
        else if (t > 13 * 60 && t <= 14 * 60) label = "13:00 - 14:00";
        else if (t > 14 * 60 && t <= 15 * 60) label = "14:00 - 15:00";
        else if (t > 15 * 60 && t <= 15 * 60 + 30) label = "15:00 - 15:30";

        // Fallback for exact boundaries if not caught by range logic
        if (!label) {
          if (timeStr === "09:00" || timeStr === "09:15") label = "09:00 - 10:00";
          else if (timeStr === "10:00") label = "09:00 - 10:00";
          else if (timeStr === "11:00") label = "10:00 - 11:00";
          else if (timeStr === "12:00") label = "11:00 - 12:00";
          else if (timeStr === "13:00") label = "12:00 - 13:00";
          else if (timeStr === "14:00") label = "13:00 - 14:00";
          else if (timeStr === "15:00") label = "14:00 - 15:00";
          else if (timeStr === "15:30") label = "15:00 - 15:30";
        }

        if (label && resultsMap.has(label)) {
          const existing = resultsMap.get(label)!;
          existing.profit += profit;
          existing.loss += loss;
          existing.profitTrades += (item.profitTrades ?? 0);
          existing.lossTrades += (item.lossTrades ?? 0);
          existing.pnl = existing.profit + existing.loss;
          existing.totalTrades = existing.profitTrades + existing.lossTrades;
          if (!existing._raw) existing._raw = rawTimestamp;
        } else {
          // Dynamic bucket for trades outside standard hours
          let displayH = hh;
          let displayStartH = hh - 1;
          
          // If exactly on the hour (e.g., 03:00), we bucket it as 02:00 - 03:00
          if (mm === 0 && hh > 0) {
            displayH = hh;
            displayStartH = hh - 1;
          } else {
            // Otherwise it's the start of the next hour (e.g. 03:15 is 03:00 - 04:00)
            displayH = hh + 1;
            displayStartH = hh;
          }

          const dynamicLabel = `${String(displayStartH).padStart(2, "0")}:00 - ${String(displayH).padStart(2, "0")}:00`;
          
          if (!resultsMap.has(dynamicLabel)) {
            resultsMap.set(dynamicLabel, {
              timestamp: dynamicLabel,
              time: dynamicLabel,
              _raw: rawTimestamp,
              profit: 0,
              loss: 0,
              profitTrades: 0,
              lossTrades: 0,
              pnl: 0,
              totalTrades: 0,
              _rawDate: displayStartH * 60, // Sort by the start of the bucket
            });
          }
          const existing = resultsMap.get(dynamicLabel)!;
          existing.profit += profit;
          existing.loss += loss;
          existing.profitTrades += (item.profitTrades ?? 0);
          existing.lossTrades += (item.lossTrades ?? 0);
          existing.pnl = existing.profit + existing.loss;
          existing.totalTrades = existing.profitTrades + existing.lossTrades;
        }
      });
    }

    return Array.from(resultsMap.values())
      .sort((a, b) => a._rawDate - b._rawDate)
      .map(({ _rawDate, ...rest }) => rest);
  }

  if (!input || input.length === 0) return [];

  return input
    .map((item) => {
      const profit = item.profit ?? 0;
      const loss = item.loss ?? 0;
      const rawTimestamp = item._raw || item.timestamp;
      const currentDate = toISTDate(rawTimestamp);

      let timestampLabel = FormatTime(rawTimestamp, range);

      return {
        timestamp: timestampLabel,
        time: getTime24(currentDate),
        _raw: rawTimestamp,
        profit: profit,
        loss: loss,
        profitTrades: item.profitTrades ?? 0,
        lossTrades: item.lossTrades ?? 0,
        pnl: profit + loss,
        totalTrades: (item.profitTrades ?? 0) + (item.lossTrades ?? 0),
        // Add raw date for sorting
        _rawDate: currentDate.getTime(),
      };
    })
    .sort((a, b) => a._rawDate - b._rawDate)
    .map(({ _rawDate, ...rest }) => rest);
}
