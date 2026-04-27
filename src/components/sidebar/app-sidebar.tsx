"use client";

import { Moon, Sun, Plus, Palette, LogOut } from "lucide-react";
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
  const { state } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const selectableThemes = ALL_THEMES.filter((theme) => theme.value !== "system");

  const displayItems = items;
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
                window.location.reload();
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
