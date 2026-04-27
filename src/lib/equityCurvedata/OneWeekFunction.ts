import { getTime24, toISTDate } from "../TimeFormat";
import { FormatTime, type TradingData, type TradingInputData } from "./OneDayFunction";

export default function OneWeekFunction(
  input: TradingInputData[] = [],
  range: '1d' | '1w' | '1m' | '1y'
): TradingData[] {
  const result: TradingData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    
    targetDate.setHours(0, 0, 0, 0);

    const inputData = input.find((item) => {
      const itemDate = new Date(item._raw || item.timestamp);

      return (
        itemDate.getDate() === targetDate.getDate() &&
        itemDate.getMonth() === targetDate.getMonth() &&
        itemDate.getFullYear() === targetDate.getFullYear()
      );
    });

    result.push({
      timestamp: FormatTime(targetDate.toISOString(), range),
      time: inputData?.timestamp || getTime24(toISTDate(targetDate.toISOString())),
      _raw: inputData?._raw || targetDate.toISOString(),
      profit: inputData?.profit ?? 0,
      loss: inputData?.loss ?? 0,
      profitTrades: inputData?.profitTrades ?? 0,
      lossTrades: inputData?.lossTrades ?? 0,
      pnl: (inputData?.profit ?? 0) + (inputData?.loss ?? 0),
      totalTrades: (inputData?.profitTrades ?? 0) + (inputData?.lossTrades ?? 0),
    });
  }

  return result;
}