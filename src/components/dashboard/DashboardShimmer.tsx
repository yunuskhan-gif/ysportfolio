import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/hooks/useReduxHooks";

const MetricCardShimmer = () => (
    <Card className="h-[150px] flex flex-col overflow-hidden shadow-none">
        <CardHeader className="relative flex-none pb-1 px-3 py-2">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20 mt-1" />
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
            <Skeleton className="h-full w-full rounded-none" />
        </CardContent>
    </Card>
);

const GreeksCardShimmer = () => (
    <Card className="bg-card border-border h-full shadow-none">
        <CardContent className="space-y-3 p-4">
            <Skeleton className="h-4 w-16" />
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-2 w-10" />
                            <Skeleton className="h-2 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const IVAnalysisShimmer = () => (
    <Card className="bg-card border-border shadow-none">
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <Skeleton className="h-[110px] w-full rounded-md" />
        </CardContent>
    </Card>
);

const PointsCapturedShimmer = () => (
    <Card className="bg-card border-border shadow-none">
        <CardContent className="space-y-4 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-28" />
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 p-2 rounded-md bg-muted/20">
                        <Skeleton className="h-2 w-12" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const TopOptionsShimmer = () => (
    <Card className="bg-card border-border shadow-none">
        <CardContent className="space-y-6 p-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-6" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default function DashboardShimmer() {
    const selectedMarket = useAppSelector((state) => state.market.selectedMarket);

    return (
        <div className="w-full space-y-2 animate-in fade-in duration-500">
            {/* Performance Metrics Header */}
            <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-64 rounded-xl" />
            </div>

            {/* Market-Specific Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                {selectedMarket === "option" ? (
                    <>
                        <MetricCardShimmer /> {/* PNL Chart */}
                        <GreeksCardShimmer />
                        <IVAnalysisShimmer />
                        <PointsCapturedShimmer />
                        <TopOptionsShimmer />
                    </>
                ) : (
                    Array.from({ length: 5 }).map((_, i) => <MetricCardShimmer key={i} />)
                )}
            </div>

            {/* Equity Curve Section */}
            <Card className="w-full shadow-none">
                <CardHeader className="p-4">
                    <div className="w-full flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-32 rounded-xl" />
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Skeleton className="h-[350px] w-full rounded-xl" />
                </CardContent>
            </Card>

            {/* Bottom Layout: Calendar and Open Trades */}
            <div className="w-full flex flex-col lg:flex-row gap-2">
                {/* Calendar Card Shimmer */}
                <div className="w-full lg:w-auto lg:flex-shrink-0">
                    <Card className="p-4 space-y-4 shadow-none w-fit border">
                        <div className="flex items-center justify-between gap-4">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-8" />
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <Skeleton key={i} className="h-[40px] w-[40px] rounded-md" />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Open Trades Table Shimmer */}
                <div className="w-full lg:flex-1 min-w-0">
                    <Card className="h-full shadow-none border">
                        <div className="p-2 h-full">
                            <div className="rounded-md border p-4 bg-muted/10 h-full">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-4 w-full" />
                                        ))}
                                    </div>
                                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                                        <div key={rowIndex} className="grid grid-cols-5 gap-4 py-1">
                                            {Array.from({ length: 5 }).map((_, colIndex) => (
                                                <Skeleton key={colIndex} className="h-10 w-full rounded-md" />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
