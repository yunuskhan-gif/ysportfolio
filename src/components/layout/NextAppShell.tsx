"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import toast from "react-hot-toast";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import ExcelUploadDialog from "@/components/portfolio/ExcelUploadDialog";
import AddStockDialog from "@/components/portfolio/AddStockDialog";
import { fetchMotilalHoldings, HOLDINGS_QUERY_KEY } from "@/lib/portfolio-api";
import { MOTILAL_SYNC_EVENT } from "@/lib/motilal-storage";

import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function NextAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes("/portfolio")) return "Portfolio";
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/search")) return "Market Search";
    if (pathname.includes("/settings")) return "Motilal Settings";
    if (pathname.includes("/history")) return "Portfolio History";
    return "Dashboard";
  };

  useEffect(() => {
    document.title = `YS Portfolio | ${getPageTitle()}`;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const syncMotilalOnLoad = async () => {
      // Prevent syncing on every navigation. Only once per session or if manually triggered.
      const hasSyncedThisSession = sessionStorage.getItem("motilal_synced_this_session");
      if (hasSyncedThisSession) return;

      try {
        const response = await fetchMotilalHoldings({ persistHoldings: true });
        if (!cancelled && !response.skipped) {
          sessionStorage.setItem("motilal_synced_this_session", "true");
          await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
          window.dispatchEvent(new CustomEvent(MOTILAL_SYNC_EVENT));
        }
      } catch (error) {
        if (!cancelled && pathname.includes("/portfolio")) {
          const message = error instanceof Error ? error.message : "Motilal sync failed.";
          if (message.includes("session") || message.includes("Credentials")) {
            toast.error("Motilal session expired. Please re-authenticate in Settings or Add Stock dialog.", { id: "motilal-sync-error" });
          } else {
            // Silently fail if it's not a session error to avoid annoying the user
            console.warn("Motilal background sync failed:", message);
          }
        }
      }
    };

    void syncMotilalOnLoad();

    return () => {
      cancelled = true;
    };
  }, [queryClient]); // Removed pathname to prevent re-syncing on every page change

  const handleDataUploaded = async () => {
    await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
  };

  const isPortfolioPage = pathname.includes("/portfolio");

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar variant="inset" />

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">{getPageTitle()}</h1>

            <div className="ml-auto flex items-center gap-2">
              {isPortfolioPage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer gap-2 text-xs font-bold uppercase tracking-tighter"
                  onClick={() => setIsAddStockOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Stock</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer gap-2 text-xs font-bold uppercase tracking-tighter"
                  onClick={() => setIsUploadOpen(true)}
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload Excel</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="scrollbar-hide flex-1 overflow-y-auto p-2">
          <PrimeReactProvider>{children}</PrimeReactProvider>
        </div>

        <ExcelUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onDataUploaded={handleDataUploaded}
        />
        <AddStockDialog
          open={isAddStockOpen}
          onOpenChange={setIsAddStockOpen}
          onStockAdded={handleDataUploaded}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
