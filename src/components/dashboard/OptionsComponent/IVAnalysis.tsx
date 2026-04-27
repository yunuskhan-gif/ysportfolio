"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

type IVAnalysisProps = {
    buy?: (number | null)[]
    sell?: (number | null)[]
}

const xLabels = [
    "0-10",
    "11-20",
    "21-30",
    "31-40",
    "41-50",
    "51-60",
    "61-70",
    "71-80",
    "81-90",
    "91-100",
]

const defaultBuy = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const defaultSell = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const chartConfig = {
    buy: {
        label: "IV Buy",
        color: "var(--primary)",
    },
    sell: {
        label: "IV Sell",
        color: "var(--destructive)",
    },
} satisfies ChartConfig

export default function IVAnalysis({
    buy = defaultBuy,
    sell = defaultSell,
}: IVAnalysisProps) {
    const chartData = xLabels.map((label, index) => ({
        range: label,
        buy: buy[index] ?? null,
        sell: sell[index] ?? null,
    }))
    
    return (
        <Card className="@container/card h-[150px] max-sm:h-[135px] max-sm:min-w-[240px] max-sm:flex-shrink-0 py-0 flex flex-col pb-0 overflow-hidden bg-card border-border snap-start">
            <div className="relative flex-none pb-0 px-3 pt-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-normal text-muted-foreground">IV Analysis</CardTitle>
                </div>
            </div>

            <CardContent className="flex-1 p-0 min-h-0 pt-0.5">
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <AreaChart
                        data={chartData}
                        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="range"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            hide
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />

                        <defs>
                            <linearGradient id="fillBuy" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-buy)"
                                    stopOpacity={0.6}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-buy)"
                                    stopOpacity={0}
                                />
                            </linearGradient>

                            <linearGradient id="fillSell" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-sell)"
                                    stopOpacity={0.6}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-sell)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>


                        <Area
                            type="monotone"
                            dataKey="sell"
                            stroke="var(--color-sell)"
                            fill="url(#fillSell)"
                            fillOpacity={1}
                            stackId="ivsell"
                            strokeWidth={1.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="buy"
                            stroke="var(--color-buy)"
                            fill="url(#fillBuy)"
                            fillOpacity={1}
                            stackId="ivbuy"
                            strokeWidth={1.5}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
