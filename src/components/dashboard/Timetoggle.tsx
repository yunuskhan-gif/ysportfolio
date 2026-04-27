// src/components/dashboard/Timetoggle.tsx
import { cn } from "@/lib/utils";

export type TimeRange = "1d" | "1w" | "1m" | "1y";

interface TimeToggleProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

const TimeToggle = ({
  selectedRange,
  onRangeChange,
  className,
}: TimeToggleProps) => {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: "1d", label: "D" },
    { value: "1w", label: "W" },
    { value: "1m", label: "M" },
    { value: "1y", label: "Y" },
  ];

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {ranges.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onRangeChange(value)}
          data-state={selectedRange === value ? "active" : "inactive"}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
            "hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TimeToggle;
