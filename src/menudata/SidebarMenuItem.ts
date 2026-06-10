// src/menudata/SidebarMenuItem.ts
import { Home, Wallet, KeyRound, History as HistoryIcon, Search, Book, PieChart, Settings } from "lucide-react";

export const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: Wallet,
    },
    {
      title: "Mutual Funds",
      url: "/mutual-funds",
      icon: PieChart,
    },
    {
      title: "Market Search",
      url: "/search",
      icon: Search,
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
