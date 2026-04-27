import { useState } from "react";
import TimeToggle from "../Timetoggle";
import { useAppSelector } from "@/redux/hooks/useReduxHooks";

import PointsCaptured from "./PointsCaptured";
import TopOptions from "./TopOptions";
import IVAnalysis from "./IVAnalysis";
import GreeksCard from "./GreeksCard";
import { ChartAreaDefault } from "../AreaChart";
import OneDayContinous from "@/lib/MetricsData/OneDayContinous";
import OneWeekContinous from "@/lib/MetricsData/OneWeekContinous";
import oneMonthContinous from "@/lib/MetricsData/OneMonthContinous";
import oneYearContinous from "@/lib/MetricsData/OneYearContinous";

type ApiTimeRange = "1d" | "1w" | "1m" | "1y";

type DataPoint = {
  timestamp: string;
  value: number;
};

const dummyCards = {
  pnl: {
    "1d": {
      value: 1200,
      data: [
        { timestamp: "10:00", value: 200 },
        { timestamp: "11:00", value: 500 },
        { timestamp: "12:00", value: 800 },
      ],
    },
    "1w": { value: 3000, data: [] },
    "1m": { value: 8000, data: [] },
    "1y": { value: 25000, data: [] },
  },
  greeks: {
    "1d": { delta: 0.5, gamma: 0.1, theta: -0.05, vega: 0.2 },
    "1w": { delta: 0.6, gamma: 0.12, theta: -0.07, vega: 0.25 },
    "1m": { delta: 0.4, gamma: 0.08, theta: -0.03, vega: 0.15 },
    "1y": { delta: 0.7, gamma: 0.15, theta: -0.1, vega: 0.3 },
  },
  ivAnalysis: {
    "1d": { buyGraph: [], sellGraph: [] },
    "1w": { buyGraph: [], sellGraph: [] },
    "1m": { buyGraph: [], sellGraph: [] },
    "1y": { buyGraph: [], sellGraph: [] },
  },
  pointsCaptured: {
    "1d": {
      total: 120,
      breakdown: {
        nifty: 50,
        banknifty: 40,
        finnifty: 20,
        others: 10,
      },
    },
    "1w": {
      total: 300,
      breakdown: {
        nifty: 120,
        banknifty: 100,
        finnifty: 50,
        others: 30,
      },
    },
    "1m": {
      total: 800,
      breakdown: {
        nifty: 300,
        banknifty: 250,
        finnifty: 150,
        others: 100,
      },
    },
    "1y": {
      total: 2000,
      breakdown: {
        nifty: 800,
        banknifty: 700,
        finnifty: 300,
        others: 200,
      },
    },
  },
  topTradedOptions: {
    "1d": [
      { symbol: "NIFTY", count: 10 },
      { symbol: "BANKNIFTY", count: 8 },
    ],
    "1w": [],
    "1m": [],
    "1y": [],
  },
};

const OptionsMetric = () => {
  const [selectedRange, setSelectedRange] = useState<ApiTimeRange>("1d");

  useAppSelector((state) => state.market.selectedMarket);

  const range = selectedRange;
  const cards = dummyCards;

  const greeksRaw = cards.greeks[range];
  const ivData = cards.ivAnalysis[range];
  const pointsCaptured = cards.pointsCaptured[range];
  const topOptions = cards.topTradedOptions[range];
  const pnlData = cards.pnl[range];

  let continousData: DataPoint[] = pnlData.data ?? [];

  if (range === "1d") {
    continousData = OneDayContinous(pnlData.data);
  } else if (range === "1w") {
    continousData = OneWeekContinous(pnlData.data);
  } else if (range === "1m") {
    continousData = oneMonthContinous(pnlData.data);
  } else {
    continousData = oneYearContinous(pnlData.data);
  }

  const greeks = [
    { title: "Delta", value: greeksRaw.delta },
    { title: "Gamma", value: greeksRaw.gamma },
    { title: "Theta", value: greeksRaw.theta },
    { title: "Vega", value: greeksRaw.vega },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <h4 className="scroll-m-20 font-medium">Performance Metrics</h4>

        <TimeToggle
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
      </div>

      <div className="grid max-sm:grid-cols-1 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        <ChartAreaDefault
          chartTitle="PNL"
          data={continousData}
          currentValue={pnlData.value}
          prevValue={undefined}
          timeRange={selectedRange}
          size={6}
        />

        <GreeksCard greeks={greeks} />

        <IVAnalysis buy={ivData.buyGraph} sell={ivData.sellGraph} />

        <PointsCaptured
          total={pointsCaptured.total}
          breakdown={[
            { label: "NIFTY", value: pointsCaptured.breakdown.nifty },
            { label: "BANKNIFTY", value: pointsCaptured.breakdown.banknifty },
            { label: "FINNIFTY", value: pointsCaptured.breakdown.finnifty },
            { label: "OTHERS", value: pointsCaptured.breakdown.others },
          ]}
        />

        <TopOptions data={topOptions} />
      </div>
    </div>
  );
};

export default OptionsMetric;
