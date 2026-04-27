// src/types/dashboard/diagnolBox.types.ts
import type { IndividualPnL } from '@/api/types/pnl.types'

export interface DiagnolBoxStats {
  date: string
  netPnl: number
  count: number
  winPercentage: number
  avgWin: number
  avgLoss: number
  profitFactor: number | "∞"
  trades: IndividualPnL[]
}

export interface JournalStats {
  winPercentage: number
  profitFactor: number | "∞"
  averageWin: number
  averageLoss: number
}

export interface StatItemProps {
  label: string
  value: string | number
  valueForColor?: number
}