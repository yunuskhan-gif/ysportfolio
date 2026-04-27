"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type GreekItem = {
    title: string
    value: number
}

const defaultGreeks: GreekItem[] = [
    { title: "Delta", value: 0 },
    { title: "Gamma", value: 0 },
    { title: "Theta", value: 0 },
    { title: "Vega", value: 0 },
]

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

const RangeLine = ({ value, title }: GreekItem) => {
    const v = clamp(value)
    const percent = Math.abs(v) * 50
    const dotLeft =
        v > 0 ? `calc(50% + ${percent}%)` : `calc(50% - ${percent}%)`

    return (
        <div className="relative w-full h-[10px]">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-muted">
                {v < 0 && (
                    <div
                        className="absolute right-1/2 h-full bg-red"
                        style={{ width: `${percent}%` }}
                    />
                )}

                {v > 0 && (
                    <div
                        className="absolute left-1/2 h-full bg-green"
                        style={{ width: `${percent}%` }}
                    />
                )}

                <span className="absolute left-0 top-[4px] text-[6px] text-foreground leading-none opacity-50">
                    -1
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 top-[4px] text-[6px] text-foreground leading-none opacity-50">
                    0
                </span>
                <span className="absolute right-0 top-[4px] text-[6px] text-foreground leading-none opacity-50">
                    1
                </span>

                {v !== 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className="absolute top-1/2 h-1.5 w-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                style={{
                                    left: dotLeft,
                                    backgroundColor:
                                        v < 0 ? "red-500" : "green-500",

                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <span className="text-xs">
                                {title}: {v.toFixed(2)}
                            </span>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

const GreeksCard = ({ greeks = defaultGreeks }: { greeks?: GreekItem[] }) => {
    return (
        <Card className="@container/card h-[150px] max-sm:h-[135px] max-sm:min-w-[240px] max-sm:flex-shrink-0 py-0 flex flex-col pb-0 overflow-hidden bg-card border-border snap-start">
            <div className="relative flex-none pb-0 px-3 pt-1.5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-normal text-muted-foreground">Greeks</CardTitle>
                </div>
            </div>

            <CardContent className="flex-1 px-2.5 py-0 pb-1 min-h-0 overflow-hidden flex flex-col justify-evenly -mt-1.5">
                <div className="flex flex-col w-full h-full justify-evenly">
                    {greeks.map((greek) => (
                        <div key={greek.title} className="w-full flex flex-col justify-center">
                            <div className="flex justify-between text-[7px] mb-px">
                                <span className="text-muted-foreground font-normal leading-none tracking-tight">
                                    {greek.title}
                                </span>
                                <span
                                    className={`flex items-center ${
                                        greek.value > 0
                                            ? "font-medium text-primary tabular-nums leading-none"
                                            : greek.value < 0
                                                ? "font-medium text-destructive tabular-nums leading-none"
                                                : "font-medium text-foreground tabular-nums leading-none"
                                    }`}
                                >
                                    {greek.value < 0 && "-"}
                                    <NumberTicker
                                        value={Math.abs(greek.value)}
                                        formatter={(val) => val.toFixed(2)}
                                        className={
                                            greek.value > 0
                                                ? "text-primary"
                                                : greek.value < 0
                                                    ? "text-destructive"
                                                    : "text-foreground"
                                        }
                                    />
                                </span>
                            </div>
                            <RangeLine {...greek} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default GreeksCard


