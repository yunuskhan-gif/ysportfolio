// src/menudata/SidebarMenuItem.ts
import { Home, Wallet, KeyRound, History as HistoryIcon, Search, Book, PieChart, Settings, BrainCircuit, Landmark } from "lucide-react";

export const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Stocks Fund",
      url: "/portfolio",
      icon: Wallet,
    },
    {
      title: "Mutual Funds",
      url: "/mutual-funds",
      icon: PieChart,
    },
    {
      title: "Loans",
      url: "/loans",
      icon: Landmark,
    },
    {
      title: "Market Search",
      url: "/search",
      icon: Search,
    },
    {
      title: "AI Insights",
      url: "/ai-insights",
      icon: BrainCircuit,
    },
    {
      title: "History",
      url: "/history",
      icon: HistoryIcon,
    },
    {
      title: "Cash Book",
      url: "/cashbook",
      icon: Book,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
];
