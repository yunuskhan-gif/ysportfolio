// src/components/dashboard/InfoButton.tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function InfoButton({
  arr,
}: {
  arr: { title: string; desc: string }[];
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground hover:bg-muted/80">
            i
          </span>
        </TooltipTrigger>

        <TooltipContent
          className="py-3 px-4 max-w-xs bg-background border"
          sideOffset={5}
        >
          <div className="flex flex-col gap-4">
            {arr?.map((item, index) => (
              <div key={index} className="space-y-1">
                <p className="text-[13px] font-medium">{item.title}</p>

                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
