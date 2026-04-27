"use client";

import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { TrendingUp } from "lucide-react";

interface CompanyLogoProps {
    isDarkMode: boolean;
}

const CompanyLogo = ({ isDarkMode }: CompanyLogoProps) => {
    const { state, isMobile, setOpenMobile } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Link
            href="/dashboard"
            onClick={() => {
                if (isMobile) {
                    setOpenMobile(false);
                }
            }}
            className={`flex items-center gap-2 p-1.5 transition-all duration-200 hover:opacity-80 ${
                isCollapsed ? "justify-center group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:ml-1" : ""
            }`}
        >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary font-bold">
                <TrendingUp className="size-5" />
            </div>
            {!isCollapsed && (
                <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold tracking-wide text-sm">YS Portfolio</span>
                </div>
            )}
        </Link>
    );
};

export default CompanyLogo;
