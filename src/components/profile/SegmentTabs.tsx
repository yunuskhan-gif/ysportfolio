// src/components/profile/SegmentTabs.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";

interface SegmentTabsProps {
  activeSegment: string;
  onSegmentChange: (value: string) => void;
  segments: string[];
  children?: ReactNode;
}

const SegmentTabs = ({
  activeSegment,
  onSegmentChange,
  segments,
  children,
}: SegmentTabsProps) => {
  const defaultSegment = segments.length > 0 ? segments[0] : "";

  return (
    <Tabs
      value={activeSegment || defaultSegment}
      className="w-full"
      onValueChange={onSegmentChange}
    >
      <div className="w-full pt-2 pb-2">
        <TabsList className="h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
          {segments.map((segment) => (
            <TabsTrigger
              key={segment}
              value={segment}
              className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-4 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow dark:data-[state=active]:bg-background dark:data-[state=active]:border-transparent hover:text-foreground"
            >
              {segment}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};

export default SegmentTabs;
