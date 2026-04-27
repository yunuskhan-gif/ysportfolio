import { Card, CardContent, CardTitle } from "@/components/ui/card";

export type TopOption = {
  symbol: string;
  count: number;
};

type TopOptionsProps = {
  data?: TopOption[];
};

const defaultData: TopOption[] = [
  { symbol: "NIFTY", count: 0 },
  { symbol: "BANKNIFTY", count: 0 },
  { symbol: "FINNIFTY", count: 0 },
  { symbol: "RELIANCE", count: 0 },
  { symbol: "TATASTEEL", count: 0 },
];

const TopOptions = ({ data }: TopOptionsProps) => {
  const safeData = Array.isArray(data) ? data : defaultData;

  return (
    <Card className="@container/card h-[150px] max-sm:h-[135px] max-sm:min-w-[240px] max-sm:flex-shrink-0 py-0 flex flex-col overflow-hidden bg-card border-border snap-start">
      <div className="relative flex-none pb-0 px-3 pt-1.5">
         <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-normal text-muted-foreground">Top Options</CardTitle>
         </div>
      </div>

      <CardContent className="flex-1 px-3 py-0 min-h-0 overflow-hidden flex flex-col justify-start -mt-2">
        <div className="flex flex-col w-full gap-0.5">
          {safeData.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center justify-between rounded-md px-2 py-[2px] transition hover:bg-muted/50"
            >
              <span className="text-[10.5px] font-normal text-muted-foreground">
                {index + 1}. {item.symbol}
              </span>

              <span className="text-[11px] font-medium text-primary tabular-nums">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopOptions;
