import { useState } from "react";
import { TimeRange } from "@/components/dashboard/Timetoggle";

export const useTimeRange = (initialRange: TimeRange = "1d") => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(initialRange);

  return {
    selectedRange,
    setSelectedRange,
  };
};
