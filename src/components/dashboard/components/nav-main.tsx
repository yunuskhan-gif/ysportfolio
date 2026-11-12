"use client";

import { useEffect } from "react";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  actionItems = [],
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  actionItems?: {
    title: string;
    icon?: LucideIcon;
    onClick: () => void;
  }[];
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    const pingPresence = () => {
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping" }),
      }).catch(() => {});
    };

    pingPresence();
    const interval = setInterval(pingPresence, 20000);

    const handleBeforeUnload = () => {
      try {
        const blob = new Blob([JSON.stringify({ action: "offline" })], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/chat", blob);
      } catch {}
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            const tourId = `tour-nav-${item.url.replace(/\//g, "") || "home"}`;

            return (
              <SidebarMenuItem key={item.title} data-tour-id={tourId}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "w-full transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                      : "",
                    "group-data-[collapsible=icon]:ml-1"
                  )}
                >
                  <Link
                    href={item.url}
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    {item.icon && <item.icon className="transition-all" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          {actionItems.map((item) => {
            const tourId = `tour-action-${item.title.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <SidebarMenuItem key={item.title} data-tour-id={tourId}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn("w-full transition-all group-data-[collapsible=icon]:ml-1")}
                  onClick={() => {
                    item.onClick();
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
                  {item.icon && <item.icon className="transition-all" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
