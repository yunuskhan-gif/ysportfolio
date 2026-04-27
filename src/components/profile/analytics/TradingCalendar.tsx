import { Card, CardContent } from "@/components/ui/card";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeatmap } from "@/api/hooks/useHeatmapQuery";
import { useCookie } from "@/hooks/useCookie";
import type {
  HeatmapResponseData,
  HeatmapSegmentKey,
} from "@/api/types/heatmap.types";
import { useTheme } from "@/hooks/useTheme";
import { apiDateToYYYYMMDD } from "@/lib/TimeFormat";
import HeatmapTooltip from "./HeatmapTooltip";
import { useState, useRef, useEffect } from "react";

interface TradingCalendarProps {
  segment: string;
  selectedYear: number;
  onYearChange?: (year: number) => void;
  targetUserId?: string;
}

// Define the tooltip data type
interface TooltipData {
  date: string;
  count: number;
  level: number;
}

const segmentMapping: Record<string, string> = {
  EQUITY: "EQUITY",
  OPTION: "OPTION",
  FUTURES: "FUTURES",
  DEFAULT: "EQUITY",
  FOREX: "FOREX",
  CRYPTO: "CRYPTO",
  "F&O": "OPTION",
};

function toLevel(count: number): Activity["level"] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function buildActivityData(
  apiData: HeatmapResponseData,
  segment: string,
  year: number,
): Activity[] {
  const mappedSegment = segmentMapping[segment] || segment;
  const countMap = new Map<string, number>();

  console.log("🔨 Building activity data for year:", year);
  console.log("📦 API Data received:", apiData);

  // Check what years are present in API data
  const yearsPresent = new Set<number>();

  Object.entries(apiData).forEach(([isoDate]) => {
    const dateStr = apiDateToYYYYMMDD(isoDate);
    const dateYear = new Date(dateStr).getFullYear();
    yearsPresent.add(dateYear);
  });

  console.log("📅 Years present in API data:", Array.from(yearsPresent));

  Object.entries(apiData).forEach(([isoDate, dayData]) => {
    const dateStr = apiDateToYYYYMMDD(isoDate);
    const dateYear = new Date(dateStr).getFullYear();

    if (dateYear === year) {
      let count = 0;

      if (segment === "ALL") {
        count = dayData.TOTAL || 0;
      } else {
        const segKey = mappedSegment.toUpperCase() as HeatmapSegmentKey;
        count = dayData[segKey] || 0;
      }

      if (count > 0) {
        countMap.set(dateStr, count);
      }
    }
  });

  const activities: Activity[] = [];
  const currentDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const count = countMap.get(dateStr) || 0;

    activities.push({
      date: dateStr,
      count: count,
      level: toLevel(count),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalForYear = activities.reduce((sum, day) => sum + day.count, 0);
  console.log(`✅ Total trades for ${year}:`, totalForYear);

  return activities;
}

const YEARS = [2023, 2024, 2025, 2026];

// Helper function to get CSS variable value

// Get theme colors based on current theme - ONLY modifying dark and light mode
// Get theme colors based on current theme - using shades of primary color for all themes
const getThemeColors = (isDarkMode: boolean) => {
  // Use the "good" default box colors for Level 0
  const level0 = isDarkMode ? "#1a1a1a" : "#f1f5f9";
  
  // Levels 1-4 are shades of the theme's primary color
  // Mixed with background to create beautiful, theme-aware shades
  return [
    level0,
    "color-mix(in oklab, var(--primary), var(--background) 85%)", // Level 1 (Lightest)
    "color-mix(in oklab, var(--primary), var(--background) 65%)", // Level 2
    "color-mix(in oklab, var(--primary), var(--background) 35%)", // Level 3
    "var(--primary)",                                           // Level 4 (Highest)
  ];
};

const TradingCalendar = ({
  segment,
  selectedYear,
  onYearChange,
  targetUserId,
}: TradingCalendarProps) => {
  const { userId: ownUserId } = useCookie();
  useTheme();
  // Check if document has dark class to determine color scheme
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains("dark");
  const colorScheme = isDarkMode ? "dark" : "light";

  const effectiveUserId = targetUserId || ownUserId;
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [blockSize, setBlockSize] = useState(12);

  console.log("🎯 Selected Year from props:", selectedYear);

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerRect(rect);

        // Dynamic block size calculation
        // Total weeks is 53. blockMargin is 4. labels take some space (~30-40px)
        const availableWidth = rect.width;
        const newBlockSize = Math.floor((availableWidth - 40) / 53) - 4;
        setBlockSize(Math.max(8, Math.min(18, newBlockSize)));
      }
    };

    updateRect();

    window.addEventListener("scroll", updateRect);
    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  // Fix the type here - use the TooltipData type or null
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean;
    targetRect: DOMRect | null;
    data: TooltipData | null;
  }>({
    isVisible: false,
    targetRect: null,
    data: null,
  });

  const {
    data: apiData,
    isLoading,
    isError,
    refetch,
  } = useHeatmap({
    userId: effectiveUserId ?? "",
    year: selectedYear,
  });

  // Force refetch when year changes
  useEffect(() => {
    console.log("📆 Year changed to:", selectedYear);
    refetch?.();
  }, [selectedYear, refetch]);

  // Log API response
  useEffect(() => {
    if (apiData) {
      console.log("🌐 API Response for year", selectedYear, ":", apiData);

      // Check what years are in the data
      const years = new Set<number>();
      Object.keys(apiData).forEach((date) => {
        const year = new Date(apiDateToYYYYMMDD(date)).getFullYear();
        years.add(year);
      });
      console.log("📊 Years in API response:", Array.from(years));
    }
  }, [apiData, selectedYear]);

  const activities = buildActivityData(apiData ?? {}, segment, selectedYear);
  const totalTrades = activities.reduce((sum, day) => sum + day.count, 0);

  const handleBlockHover = (
    activity: Activity,
    _event: React.MouseEvent,
    rect: DOMRect,
  ) => {
    setTooltipState({
      isVisible: true,
      targetRect: rect,
      data: {
        date: activity.date,
        count: activity.count,
        level: activity.level,
      },
    });
  };

  // Get theme colors - using isDarkMode to determine Level 0
  const themeColors = getThemeColors(isDarkMode);

  return (
    <>
      <HeatmapTooltip
        isVisible={tooltipState.isVisible}
        targetRect={tooltipState.targetRect}
        containerRect={containerRect}
        data={tooltipState.data}
      />

      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {segment} Segment — {selectedYear} ({totalTrades} trades)
            </p>

            <div className="flex gap-1">
              {YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    console.log("👆 Year button clicked:", year);
                    onYearChange?.(year);
                  }}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    year === selectedYear
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : isError ? (
            <p className="text-xs text-destructive py-4">
              Failed to load heatmap data.
            </p>
          ) : (
            <div
              ref={containerRef}
              className="overflow-x-auto pb-2 relative w-full"
              onMouseLeave={() =>
                setTooltipState((prev) => ({ ...prev, isVisible: false }))
              }
            >
              <ActivityCalendar
                data={activities}
                blockSize={blockSize}
                blockRadius={3}
                blockMargin={4}
                fontSize={10}
                colorScheme={colorScheme}
                theme={{
                  light: themeColors,
                  dark: themeColors,
                }}
                labels={{
                  months: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  totalCount: "{{count}} trades in {{year}}",
                  legend: { less: "Less", more: "More" },
                }}
                showWeekdayLabels={false}
                showMonthLabels={true}
                showTotalCount={true}
                showColorLegend={true}
                style={{ maxWidth: "100%", overflow: "visible" }}
                renderBlock={(block, activity) => {
                  return (
                    <g
                      onMouseEnter={(e) => {
                        const rect = (
                          e.currentTarget as SVGGElement
                        ).getBoundingClientRect();
                        handleBlockHover(activity, e, rect);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {block}
                    </g>
                  );
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TradingCalendar;