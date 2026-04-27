// src/types/enums/timeRange.types.ts
export type TimeRange = '1d' | '1w' | '1m' | '1y';

export const TimeRangeLabels: Record<TimeRange, string> = {
  '1d': 'Day',
  '1w': 'Week',
  '1m': 'Month',
  '1y': 'Year'
};