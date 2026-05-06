// src/menudata/SidebarMenuItem.ts
import { Home, Wallet, KeyRound, History as HistoryIcon, Search } from "lucide-react";

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
      title: "Market Search",
      url: "/search",
      icon: Search,
    },
    {
      title: "History",
      url: "/history",
      icon: HistoryIcon,
    },
]
