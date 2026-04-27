import { useState, useRef } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, Plus, PenTool, Upload, Link2 } from "lucide-react";
import { useCookie } from "@/hooks/useCookie";
import UploadDialog from "../Add-trades/upload/upload-dialog";
import BrokerDialog from "../Add-trades/Broker/BrokerDialog";
import UploadDialogManual from "../Add-trades/upload/upload-dialog-manual";

export const ToolboxSelector = () => {
    const [open, setOpen] = useState(false);
    const [manualOpen, setManualOpen] = useState(false);
    const [fileOpen, setFileOpen] = useState(false);
    const [brokerOpen, setBrokerOpen] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { brokerLogin } = useCookie();

    const hasConnectedBroker = Object.values(brokerLogin || {}).some(
        (isConnected) => isConnected === true,
    );

    const connectedBroker = hasConnectedBroker
        ? Object.entries(brokerLogin || {})
            .find(([, isConnected]) => isConnected === true)?.[0]
            ?.toUpperCase()
        : "manual";



    const handleMouseEnter = () => {
        if (window.innerWidth < 1024) return;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        if (window.innerWidth < 1024) return;
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
            timeoutRef.current = null;
        }, 2000);
    };

    const triggerManual = () => {
        setOpen(false);
        setManualOpen(true);
    };

    const triggerFile = () => {
        setOpen(false);
        setFileOpen(true);
    };

    const triggerBroker = () => {
        setOpen(false);
        setBrokerOpen(true);
    };

    return (
        <>
            {/* Dialogs outside to prevent unmounting when menu closes */}
            <UploadDialogManual
                broker={connectedBroker}
                open={manualOpen}
                onOpenChange={setManualOpen}
            />
            <UploadDialog
                open={fileOpen}
                onOpenChange={setFileOpen}
            />
            <BrokerDialog
                open={brokerOpen}
                onOpenChange={setBrokerOpen}
            />

            <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                    <Button
                        variant="outline"
                        className="flex items-center gap-1.5 shadow-none h-7 text-xs px-2.5"
                    >
                        <Plus className="h-3.5 w-3.5 opacity-70" />
                        <span className="capitalize">Add Trades</span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent
                    align="end"
                    className="w-56"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <DropdownMenuLabel>Trading Toolbox</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={triggerManual}
                            className="gap-2 cursor-pointer"
                        >
                            <PenTool className="h-4 w-4 opacity-70" />
                            <span>Manual Entry</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={triggerFile}
                            className="gap-2 cursor-pointer"
                        >
                            <Upload className="h-4 w-4 opacity-70" />
                            <span>Upload Files</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={triggerBroker}
                            className="gap-2 cursor-pointer"
                        >
                            <Link2 className="h-4 w-4 opacity-70" />
                            <span>API Integrations</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
