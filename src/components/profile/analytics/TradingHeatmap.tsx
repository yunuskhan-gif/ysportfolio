// components/analytics/TradingHeatmap.tsx
import TradingCalendar from "./TradingCalendar";

interface TradingHeatmapProps {
  segment: string;
  selectedYear: number;
  onYearChange?: (year: number) => void;
  targetUserId?: string; // ✅ Add this
}

const TradingHeatmap = ({
  segment,
  selectedYear,
  onYearChange,
  targetUserId,
}: TradingHeatmapProps) => {
  return (
    <TradingCalendar
      segment={segment}
      selectedYear={selectedYear}
      onYearChange={onYearChange}
      targetUserId={targetUserId} // ✅ Pass it through
    />
  );
};

export default TradingHeatmap;
