import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { NumberTicker } from "@/components/ui/number-ticker"

type PointsItem = {
    label: string
    value: number
}

type PointsCapturedProps = {
    total?: number
    breakdown?: PointsItem[]
}

const PointsCaptured = ({
    total,
    breakdown
}: PointsCapturedProps) => {
    console.log(breakdown)
    return (
        <Card className="@container/card h-[150px] max-sm:h-[135px] max-sm:min-w-[240px] max-sm:flex-shrink-0 py-0 flex flex-col overflow-hidden bg-card border-border snap-start">
            <div className="relative flex-none pb-0 px-3 pt-1.5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-normal text-muted-foreground">Points Captured</CardTitle>
                </div>
            </div>

            <CardContent className="flex-1 px-3 py-0 pb-1.5 flex flex-col justify-start space-y-2 min-h-0 -mt-0.5">
                <div className={`@[250px]/card:text-2xl text-xl font-normal tabular-nums leading-none flex items-center ${total!=undefined&&total>0?"text-primary":"text-destructive"}`}>
                    {total != undefined && total < 0 && "-"}
                    <NumberTicker 
                        value={Math.abs(total || 0)} 
                        formatter={(val) => val.toFixed(3)}
                        className={total!=undefined&&total>0?"text-primary":"text-destructive"}
                    />
                </div>

                <div className="h-px bg-border/50" />

                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                    {breakdown?.map((item) => (
                        <div
                            key={item.label}
                            className="flex justify-center gap-0.5 rounded-md px-2 py-1 bg-muted/20 flex-col"
                        >
                            <span className="text-[9.5px] font-normal text-muted-foreground leading-none">
                                {item.label}
                            </span>
                            <span className={`text-[11px] font-medium tabular-nums leading-none ${item.value==undefined?"text-muted-foreground":item.value>0?"text-primary":"text-destructive"}`}>
                                {item.value!=undefined?item.value?.toFixed(2):"NA"}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default PointsCaptured
