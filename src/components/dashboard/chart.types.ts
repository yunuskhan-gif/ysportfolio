// src/types/dashboard/chart.types.ts
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

export interface ChartData {
  timestamp: string
  value: number
  formattedTime?: string
  time?: string
  isOriginal?: boolean
}

export type TimeRange = '1d' | '1w' | '1m' | '1y'

export interface ChartAreaDefaultProps {
  chartTitle?: string
  data: ChartData[]
  currentValue?: number
    percentChange?: string | number;  // Add this line

  prevValue?: number
  timeRange?: string
  selectedRange?: TimeRange
  onRangeChange?: (range: TimeRange) => void
  size: number
  flag?: 0 | 1
  syncId?: string
  explore?: string
}

export interface CustomActiveDotProps {
  cx?: number
  cy?: number
  payload?: ChartData
}

export interface BadgeComponentProps {
  currentValue?: number
  prevValue?: number
  explore?: string
  selectedRange?: TimeRange
  onRangeChange?: (range: TimeRange) => void
}

export interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  chartTitle?: string
  timeRange?: string
  flag?: number
}

export interface InfoItem {
  title: string
  desc: string
}

export type InfoArr = Record<string, InfoItem[]>