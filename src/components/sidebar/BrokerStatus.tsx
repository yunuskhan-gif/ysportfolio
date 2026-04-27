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
import { ChevronDown, RefreshCw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCookie } from "@/hooks/useCookie";
import { useAuth } from "@/hooks/useAuth";
import BrokerDialog from "../Add-trades/Broker/BrokerDialog";
import { toast } from "sonner";
import {
  useFyersCredentials,
  useAngelOneCredentials,
  useUpstoxCredentials,
  useZerodhaCredentials,
  useCoinDcxCredentials,
  useDeltaExchangeCredentials,
  useCoinDcxLogin,
  useDeltaExchangeLogin,
  useSyncCryptoBrokers,
} from "@/api/hooks/useBrokerQuery";
import { useAppSelector } from "@/redux/hooks/useReduxHooks";

const BrokerStatus = () => {
  const [open, setOpen] = useState(false);
  const [brokerDialogOpen, setBrokerDialogOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { brokerLogin } = useCookie() as any;
  const { user } = useAuth();
  const selectedMarket = useAppSelector((state) => state.market.selectedMarket);
  const email = user?.email || "";

  const { data: fyersCreds } = useFyersCredentials();
  const { data: angelCreds } = useAngelOneCredentials();
  const { data: upstoxCreds } = useUpstoxCredentials();
  const { data: zerodhaCreds } = useZerodhaCredentials();
  const { data: coinDcxCreds } = useCoinDcxCredentials();
  const { data: deltaExchangeCreds } = useDeltaExchangeCredentials();

  const { mutateAsync: loginCoinDcx } = useCoinDcxLogin();
  const { mutateAsync: loginDeltaExchange } = useDeltaExchangeLogin();
  const { mutateAsync: syncCrypto } = useSyncCryptoBrokers();

  const getStatus = (isConnected: boolean | undefined) => {
    return isConnected ? "Connected" : "Disconnected";
  };

  const handleReconnect = (brokerName: string, currentStatus?: string) => {
    if (!email) {
      toast.error("User not authenticated");
      return;
    }

    const hasCredentials = checkBrokerCredentials(brokerName);

    if (!hasCredentials || currentStatus === "Connected") {
      // Directly open dialog with pre-selected broker
      setSelectedBroker(brokerName);
      setBrokerDialogOpen(true);
      setOpen(false);
    } else {
      if (brokerName.toLowerCase() === "coindcx") {
        loginCoinDcx().then((res) => {
          if (res.success) {
            syncCrypto({ mode: "trading", brokers: ["COINDCX"] });
          }
        });
      } else if (brokerName.toLowerCase() === "delta exchange") {
        loginDeltaExchange().then((res) => {
          if (res.success) {
            syncCrypto({ mode: "trading", brokers: ["delta-exchange"] });
          }
        });
      } else {
        redirectToBrokerLogin(brokerName);
      }
    }
  };

  const checkBrokerCredentials = (brokerName: string): boolean => {
    if (brokerName.toLowerCase() === "fyers")
      return !!fyersCreds?.data?.fyersCredentials;
    if (brokerName.toLowerCase() === "angel one")
      return !!angelCreds?.data?.angelOneCredentials;
    if (brokerName.toLowerCase() === "upstox")
      return !!upstoxCreds?.data?.upstoxCredentials;
    if (brokerName.toLowerCase() === "zerodha")
      return !!zerodhaCreds?.data?.zerodhaCredentials;
    if (brokerName.toLowerCase() === "coindcx")
      return !!coinDcxCreds?.data?.coinDcxCredentials;
    if (brokerName.toLowerCase() === "delta exchange")
      return !!deltaExchangeCreds?.data?.deltaExchangeCredentials;
    return false;
  };

  const redirectToBrokerLogin = (brokerName: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL;
    const encodedEmail = encodeURIComponent(email);

    let url = "";

    if (brokerName.toLowerCase() === "fyers") {
      url = `${baseUrl}/api/v1/broker/fyers/login?email=${encodedEmail}`;
    } else if (brokerName.toLowerCase() === "angel one") {
      url = `${baseUrl}/api/v1/broker/angelone/login?email=${encodedEmail}`;
    } else if (brokerName.toLowerCase() === "upstox") {
      url = `${baseUrl}/api/v1/broker/upstox/login?email=${encodedEmail}`;
    } else if (brokerName.toLowerCase() === "zerodha") {
      url = `${baseUrl}/api/v1/broker/zerodha/login?email=${encodedEmail}`;
    } else if (brokerName.toLowerCase() === "coindcx") {
      url = `${baseUrl}/api/v1/broker/coindcx/login?email=${encodedEmail}`;
    } else if (brokerName.toLowerCase() === "delta exchange") {
      url = `${baseUrl}/api/v1/broker/deltaexchange/login?email=${encodedEmail}`;
    }

    if (url) {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = url;
    }
  };

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



  const statusInfo = [
    { name: "Fyers", status: getStatus(brokerLogin?.fyers) },
    { name: "Angel One", status: getStatus(brokerLogin?.angelone) },
    { name: "Upstox", status: getStatus(brokerLogin?.upstox) },
    { name: "Zerodha", status: getStatus(brokerLogin?.zerodha) },
    { name: "CoinDCX", status: getStatus(brokerLogin?.coindcx) },
    { name: "Delta Exchange", status: getStatus(brokerLogin?.deltaexchange) },
  ];

  const filteredStatusInfo = statusInfo.filter((item) => {
    const isCryptoBroker =
      item.name === "CoinDCX" || item.name === "Delta Exchange";
    if (selectedMarket === "crypto") {
      return isCryptoBroker;
    } else {
      return !isCryptoBroker;
    }
  });

  const getBrokerIndex = (name: string): number => {
    if (name === "Fyers") return 3;
    if (name === "Angel One") return 1;
    if (name === "Upstox") return 2;
    if (name === "Zerodha") return 0;
    if (name === "CoinDCX") return 4; // Check BrokerDialog.tsx for correct indices
    if (name === "Delta Exchange") return 5;
    return 0;
  };

  return (
    <>
      <BrokerDialog
        open={brokerDialogOpen}
        onOpenChange={setBrokerDialogOpen}
        initialBroker={
          selectedBroker ? getBrokerIndex(selectedBroker) : undefined
        }
      />

      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <Button
              variant="outline"
              className="flex items-center gap-1.5 shadow-none h-7 text-xs px-2.5"
            >
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  Object.values(brokerLogin || {}).some(v => v === true) ? "bg-green-500" : "bg-muted-foreground/40"
                )} />
                <span className="capitalize font-medium text-[11px] opacity-80">
                  Broker Status
                </span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-40 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
        </div>

        <DropdownMenuContent
          align="end"
          className="w-70"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenuLabel>Broker Status</DropdownMenuLabel>
          <DropdownMenuGroup>
            {filteredStatusInfo.map((item, index) => {
              const hasCredentials = checkBrokerCredentials(item.name);

              return (
                <DropdownMenuItem
                  key={index}
                  className="justify-between group cursor-pointer"
                  asChild
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm uppercase font-bold">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.status === "Disconnected" ? (
                        <Badge variant="destructive">{item.status}</Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {item.status}
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-60 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReconnect(item.name, item.status);
                        }}
                        title={
                          !hasCredentials
                            ? "Add Credentials"
                            : item.status === "Connected"
                              ? "Broker Settings"
                              : "Reconnect"
                        }
                      >
                        {!hasCredentials || item.status === "Connected" ? (
                          <Settings className="h-3.5 w-3.5" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default BrokerStatus;
