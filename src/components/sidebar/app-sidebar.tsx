"use client";

import { Moon, Sun, Plus, Palette, LogOut, User, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { items } from "@/menudata/SidebarMenuItem";
import { NavMain } from "../dashboard/components/nav-main";
import { useTheme } from "@/hooks/useTheme";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import CompanyLogo from "./CompanyLogo";
import AddStockDialog from "@/components/portfolio/AddStockDialog";
import { ALL_THEMES } from "@/constants/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleTheme, selectedTheme, setSelectedTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const selectableThemes = ALL_THEMES.filter((theme) => theme.value !== "system");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || null);
        }
      } catch (err) {
        setCurrentUser(null);
      }
    }
    fetchUser();
  }, []);

  const isAdmin = currentUser === "main";
  const availableItems = isAdmin
    ? items
    : items.filter((item) => item.url !== "/users");

  const displayItems = isMobile
    ? availableItems.filter((item) => item.url !== "/search")
    : availableItems;

  const actionItems = [
    {
      title: "Add Stock",
      icon: Plus,
      onClick: () => setIsAddStockOpen(true),
    },
  ];

  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDarkMode(dark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const getButtonText = () => {
    return isDarkMode ? "Light Mode" : "Dark Mode";
  };

  const currentTheme = ALL_THEMES.find((theme) => theme.value === selectedTheme);

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <CompanyLogo isDarkMode={isDarkMode} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={displayItems} actionItems={actionItems} />
      </SidebarContent>

      <SidebarFooter className="space-y-2">
        {currentUser && (
          <div className="mx-1 my-1 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <Avatar className="h-7 w-7 border border-red-500/30 bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold text-[10px]">
                  <AvatarFallback className="bg-transparent text-white font-bold">
                    {currentUser.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>
              {state !== "collapsed" && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white truncate">{currentUser}</span>
                    <Badge variant="outline" className={`text-[8px] px-1 py-0 h-3.5 font-mono ${
                      isAdmin ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    }`}>
                      {isAdmin ? "Admin" : "User"}
                    </Badge>
                  </div>
                  <span className="text-[9px] text-zinc-400 truncate block">Logged in profile</span>
                </div>
              )}
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-start cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:ml-1 transition-all">
                  <Palette className="h-4 w-4 transition-all" />
                  {state !== "collapsed" && (
                    <span className="ml-2 truncate">
                      {currentTheme?.label || "Theme"}
                    </span>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedTheme}
                  onValueChange={(value) => setSelectedTheme(value)}
                >
                  {selectableThemes.map((theme) => {
                    const Icon = theme.icon;

                    return (
                      <DropdownMenuRadioItem key={theme.value} value={theme.value}>
                        <Icon className="h-4 w-4" />
                        <span>{theme.label}</span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              className="w-full justify-start cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:ml-1 transition-all"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 transition-all" />
                  {state !== "collapsed" && <span className="ml-2">{getButtonText()}</span>}
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 transition-all" />
                  {state !== "collapsed" && <span className="ml-2">{getButtonText()}</span>}
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="w-full justify-start cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:ml-1 transition-all text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 transition-all" />
              {state !== "collapsed" && <span className="ml-2">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <AddStockDialog
        open={isAddStockOpen}
        onOpenChange={setIsAddStockOpen}
        onStockAdded={() => window.location.reload()}
      />
    </Sidebar>
  );
}
