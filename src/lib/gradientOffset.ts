// src/lib/gradientOffset.ts

import type { ChartData } from "@/components/dashboard/chart.types"

export function calculateGradientOffset(chartData: ChartData[]): number {
  if (!chartData.length) return 0.5
  const values = chartData.map(i => i.value).filter(Number.isFinite)
  if (!values.length) return 0.5
  const dataMax = Math.max(...values)
  const dataMin = Math.min(...values)
  if (dataMax <= 0) return 0
  if (dataMin >= 0) return 1
  if (dataMax === dataMin) return 0.5
  return dataMax / (dataMax - dataMin)
}