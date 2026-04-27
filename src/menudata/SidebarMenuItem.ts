// src/menudata/SidebarMenuItem.ts
import { Home, Wallet, KeyRound, History as HistoryIcon } from "lucide-react";

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
      title: "Motilal Settings",
      url: "/settings",
      icon: KeyRound,
    },
    {
      title: "History",
      url: "/history",
      icon: HistoryIcon,
    },
]
