import CrudeOilTracker from "@/components/commodity/CrudeOilTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crude Oil & Global Commodities | YS Portfolio",
  description:
    "Real-time Crude Oil, Brent, Natural Gas, Commodities, Stocks, Forex, Crypto & Bonds rates tracker synced with TradingEconomics.",
};

export default function CrudeOilPage() {
  return (
    <div className="p-2 sm:p-4 md:p-6 w-full">
      <CrudeOilTracker />
    </div>
  );
}

