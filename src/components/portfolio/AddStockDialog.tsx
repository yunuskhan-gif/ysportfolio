import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EQUITY_SYMBOLS } from "@/constants/symbols";
import {
  appendHoldings,
  fetchMotilalHoldings,
  fetchMotilalSettings,
  HOLDINGS_QUERY_KEY,
  MOTILAL_SETTINGS_QUERY_KEY,
  saveHolding,
  saveMotilalSettings,
  clearMotilalSavedSession,
  type StockHolding,
} from "@/lib/portfolio-api";
import { MOTILAL_SYNC_EVENT } from "@/lib/motilal-storage";

interface StockFormState {
  symbol: string;
  name: string;
  qty: string;
  avgPrice: string;
  app: string;
}

interface MotilalFormState {
  clientcode: string;
  userid: string;
  password: string;
  dob: string;
  totp: string;
  apiKey: string;
  apiSecretKey: string;
  vendorinfo: string;
  totpSecret: string;
}

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockAdded?: () => void;
  initialHolding?: StockHolding | null;
  editId?: string | null;
}

const INITIAL_FORM: StockFormState = {
  symbol: "",
  name: "",
  qty: "",
  avgPrice: "",
  app: "Manual",
};

const INITIAL_MOTILAL_FORM: MotilalFormState = {
  clientcode: "",
  userid: "",
  password: "",
  dob: "",
  totp: "",
  apiKey: "",
  apiSecretKey: "",
  vendorinfo: "",
  totpSecret: "",
};

const normalizeSymbol = (symbol: string) => {
  const cleaned = symbol.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return "";
  if (cleaned.includes(".")) return cleaned;
  return `${cleaned}.NS`;
};

const formatSymbol = (symbol: string) => `${symbol}.NS`;

const formatDobInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export default function AddStockDialog({
  open,
  onOpenChange,
  onStockAdded,
  initialHolding = null,
  editId = null,
}: AddStockDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(editId);
  const [formState, setFormState] = useState<StockFormState>(INITIAL_FORM);
  const [activeSelector, setActiveSelector] = useState<"name" | "symbol" | null>(null);
  const [mode, setMode] = useState<"manual" | "motilal">("manual");
  const [motilalForm, setMotilalForm] = useState<MotilalFormState>(INITIAL_MOTILAL_FORM);
  const [motilalPreview, setMotilalPreview] = useState<StockHolding[]>([]);
  const [motilalError, setMotilalError] = useState<string | null>(null);
  const [motilalSessionSavedAt, setMotilalSessionSavedAt] = useState("");
  const [autoFetchedMotilal, setAutoFetchedMotilal] = useState(false);
  const { data: motilalSettings } = useQuery({
    queryKey: MOTILAL_SETTINGS_QUERY_KEY,
    queryFn: fetchMotilalSettings,
    enabled: open,
  });

  const saveHoldingMutation = useMutation({
    mutationFn: ({ holding, id }: { holding: StockHolding; id?: string | null }) =>
      saveHolding(holding, id),
  });

  const fetchMotilalMutation = useMutation({
    mutationFn: fetchMotilalHoldings,
  });

  const importHoldingsMutation = useMutation({
    mutationFn: appendHoldings,
  });

  const stockMatches = useMemo(() => {
    const query = formState.name.trim().toLowerCase();
    if (!query) return EQUITY_SYMBOLS.slice(0, 8);

    return EQUITY_SYMBOLS.filter((stock) => {
      const name = stock.n.toLowerCase();
      const symbol = stock.s.toLowerCase();
      return name.includes(query) || symbol.includes(query);
    }).slice(0, 8);
  }, [formState.name]);

  const symbolMatches = useMemo(() => {
    const query = formState.symbol.trim().toLowerCase().replace(".ns", "");
    if (!query) return EQUITY_SYMBOLS.slice(0, 8);

    return EQUITY_SYMBOLS.filter((stock) => {
      const name = stock.n.toLowerCase();
      const symbol = stock.s.toLowerCase();
      return symbol.includes(query) || name.includes(query);
    }).slice(0, 8);
  }, [formState.symbol]);

  const handleFormChange = (field: keyof StockFormState, value: string) => {
    if (field === "name") {
      const exactMatch = EQUITY_SYMBOLS.find(
        (stock) => stock.n.toLowerCase() === value.trim().toLowerCase()
      );

      setFormState((current) => ({
        ...current,
        name: value,
        symbol: exactMatch ? formatSymbol(exactMatch.s) : current.symbol,
      }));
      return;
    }

    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleStockSelect = (name: string, symbol: string) => {
    setFormState((current) => ({
      ...current,
      name,
      symbol: formatSymbol(symbol),
    }));
    setActiveSelector(null);
  };

  const loadSavedMotilalState = (settings = motilalSettings) => {
    if (!settings) return;
    setMotilalForm((current) => ({
      ...current,
      clientcode: settings.clientcode || "",
      userid: settings.userid || "",
      dob: settings.dob || "",
      apiKey: settings.apiKey || "",
      apiSecretKey: settings.apiSecretKey || "",
      vendorinfo: settings.vendorinfo || "",
      totpSecret: settings.totpSecret || "",
      password: "",
      totp: "",
    }));
    setMotilalSessionSavedAt(settings.session?.savedAt || "");
  };

  const resetDialogState = () => {
    setFormState(INITIAL_FORM);
    setActiveSelector(null);
    setMode("manual");
    setMotilalForm(INITIAL_MOTILAL_FORM);
    loadSavedMotilalState();
    setMotilalPreview([]);
    setMotilalError(null);
    setAutoFetchedMotilal(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialHolding) {
      setFormState({
        name: initialHolding.name,
        symbol: initialHolding.symbol,
        qty: String(initialHolding.qty),
        avgPrice: String(initialHolding.avgPrice),
        app: initialHolding.app || "Manual",
      });
      setMode("manual");
      setActiveSelector(null);
      return;
    }

    resetDialogState();
  }, [initialHolding, open, motilalSettings]);

  useEffect(() => {
    if (mode !== "motilal") {
      return;
    }

    void saveMotilalSettings({
      clientcode: motilalForm.clientcode,
      userid: motilalForm.userid,
      dob: motilalForm.dob,
      apiKey: motilalForm.apiKey,
      apiSecretKey: motilalForm.apiSecretKey,
      vendorinfo: motilalForm.vendorinfo,
      totpSecret: motilalForm.totpSecret,
    });
  }, [
    mode,
    motilalForm.clientcode,
    motilalForm.userid,
    motilalForm.dob,
    motilalForm.apiKey,
    motilalForm.apiSecretKey,
    motilalForm.vendorinfo,
    motilalForm.totpSecret,
  ]);

  useEffect(() => {
    if (!open || mode !== "motilal" || isEditMode || autoFetchedMotilal || fetchMotilalMutation.isPending) {
      return;
    }

    const hasSavedSession = Boolean(motilalSessionSavedAt);
    const hasRequiredPrefs = Boolean(
      motilalForm.apiKey && motilalForm.apiSecretKey && motilalForm.userid
    );

    if (!hasSavedSession || !hasRequiredPrefs) {
      return;
    }

    setAutoFetchedMotilal(true);
    void handleImportMotilalHoldings(true);
  }, [
    open,
    mode,
    isEditMode,
    autoFetchedMotilal,
    fetchMotilalMutation.isPending,
    motilalSessionSavedAt,
    motilalForm.apiKey,
    motilalForm.apiSecretKey,
    motilalForm.userid,
  ]);

  const handleSubmit = async () => {
    const name = formState.name.trim();
    const symbol = normalizeSymbol(formState.symbol || formState.name);
    const qty = Number(formState.qty);
    const avgPrice = Number(formState.avgPrice);
    const app = formState.app.trim() || "Manual";

    if (!name || !symbol || qty <= 0 || avgPrice <= 0) {
      toast.error("Please fill valid stock details.");
      return;
    }

    const nextHolding: StockHolding = {
      symbol,
      name,
      qty,
      avgPrice,
      app,
    };

    await saveHoldingMutation.mutateAsync({ holding: nextHolding, id: editId });
    await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
    window.dispatchEvent(new CustomEvent(MOTILAL_SYNC_EVENT));
    toast.success(isEditMode ? "Stock updated." : "Stock added.");
    resetDialogState();
    onOpenChange(false);
    onStockAdded?.();
  };

  const handleMotilalFieldChange = (field: keyof MotilalFormState, value: string) => {
    if (
      field === "clientcode" ||
      field === "userid" ||
      field === "apiKey" ||
      field === "apiSecretKey"
    ) {
      void clearMotilalSavedSession();
      setMotilalSessionSavedAt("");
      setAutoFetchedMotilal(false);
    }

    setMotilalForm((current) => ({
      ...current,
      [field]: field === "dob" ? formatDobInput(value) : value,
    }));
  };

  const handleImportMotilalHoldings = async (preferSavedSession = false) => {
    setMotilalError(null);
    try {
      const data = await fetchMotilalMutation.mutateAsync({
        ...motilalForm,
        password: preferSavedSession ? "" : motilalForm.password,
        totp: preferSavedSession ? "" : motilalForm.totp,
        persistHoldings: false,
      });

      await saveMotilalSettings({
        clientcode: motilalForm.clientcode,
        userid: motilalForm.userid,
        dob: motilalForm.dob,
        apiKey: motilalForm.apiKey,
        apiSecretKey: motilalForm.apiSecretKey,
        vendorinfo: motilalForm.vendorinfo,
        totpSecret: motilalForm.totpSecret,
      });
      await queryClient.invalidateQueries({ queryKey: MOTILAL_SETTINGS_QUERY_KEY });
      setMotilalSessionSavedAt(data.session?.savedAt || "");
      setMotilalPreview(data.holdings);
      setMotilalForm((current) => ({
        ...current,
        password: "",
        totp: "",
      }));
      toast.success(`Fetched ${data.holdings.length} Motilal holdings.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to import Motilal holdings";
      setMotilalError(message);
      toast.error(message);
    }
  };

  const handleConfirmMotilalImport = async () => {
    if (motilalPreview.length === 0) {
      toast.error("Fetch holdings first.");
      return;
    }

    await importHoldingsMutation.mutateAsync(motilalPreview);
    await queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
    window.dispatchEvent(new CustomEvent(MOTILAL_SYNC_EVENT));
    toast.success(`Imported ${motilalPreview.length} Motilal holdings.`);
    resetDialogState();
    onOpenChange(false);
    onStockAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[calc(100vw-96px)] !max-w-[1650px] min-h-[70vh]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Stock" : "Add Stock"}</DialogTitle>
        </DialogHeader>

        {!isEditMode ? (
          <div className="flex gap-2 border-b pb-4">
            <Button
              type="button"
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
            >
              Manual
            </Button>
            <Button
              type="button"
              variant={mode === "motilal" ? "default" : "outline"}
              onClick={() => setMode("motilal")}
            >
              Motilal API
            </Button>
          </div>
        ) : null}

        {mode === "manual" || isEditMode ? (
          <div className="grid gap-8 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative grid gap-1.5">
                <Label htmlFor="stock-name">Stock Name</Label>
                <Input
                  id="stock-name"
                  value={formState.name}
                  onChange={(event) => {
                    handleFormChange("name", event.target.value);
                    setActiveSelector(event.target.value.trim() ? "name" : null);
                  }}
                  placeholder="Reliance"
                />
                {activeSelector === "name" && stockMatches.length > 0 && (
                  <div className="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-lg">
                    {stockMatches.map((stock) => (
                      <button
                        key={stock.s}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleStockSelect(stock.n, stock.s)}
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        <span className="truncate pr-3">{stock.n}</span>
                        <span className="text-xs text-muted-foreground">{stock.s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative grid gap-1.5">
                <Label htmlFor="stock-symbol">Symbol</Label>
                <Input
                  id="stock-symbol"
                  value={formState.symbol}
                  onFocus={() => setActiveSelector("symbol")}
                  onChange={(event) => {
                    handleFormChange("symbol", event.target.value);
                    setActiveSelector("symbol");
                  }}
                  placeholder="RELIANCE.NS"
                />
                {activeSelector === "symbol" && symbolMatches.length > 0 && (
                  <div className="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-lg">
                    {symbolMatches.map((stock) => (
                      <button
                        key={`${stock.s}-symbol`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleStockSelect(stock.n, stock.s)}
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        <span className="font-medium">{stock.s}</span>
                        <span className="truncate pl-3 text-xs text-muted-foreground">{stock.n}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="stock-qty">Quantity</Label>
                <Input
                  id="stock-qty"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.qty}
                  onFocus={() => setActiveSelector(null)}
                  onChange={(event) => handleFormChange("qty", event.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="stock-price">Avg Price</Label>
                <Input
                  id="stock-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.avgPrice}
                  onFocus={() => setActiveSelector(null)}
                  onChange={(event) => handleFormChange("avgPrice", event.target.value)}
                  placeholder="1450"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="stock-app">App / Source</Label>
                <Input
                  id="stock-app"
                  value={formState.app}
                  onFocus={() => setActiveSelector(null)}
                  onChange={(event) => handleFormChange("app", event.target.value)}
                  placeholder="Manual"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 py-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
              <div className="grid gap-1.5 xl:col-span-1">
                <Label htmlFor="motilal-clientcode">Client Code</Label>
                <Input
                  id="motilal-clientcode"
                  value={motilalForm.clientcode}
                  onChange={(event) => handleMotilalFieldChange("clientcode", event.target.value)}
                  placeholder="AA020"
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-1">
                <Label htmlFor="motilal-userid">User ID</Label>
                <Input
                  id="motilal-userid"
                  value={motilalForm.userid}
                  onChange={(event) => handleMotilalFieldChange("userid", event.target.value)}
                  placeholder="AA020"
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-2">
                <Label htmlFor="motilal-password">Password</Label>
                <Input
                  id="motilal-password"
                  type="password"
                  value={motilalForm.password}
                  onChange={(event) => handleMotilalFieldChange("password", event.target.value)}
                  placeholder="Motilal password"
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-1">
                <Label htmlFor="motilal-dob">DOB</Label>
                <Input
                  id="motilal-dob"
                  value={motilalForm.dob}
                  onChange={(event) => handleMotilalFieldChange("dob", event.target.value)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
              {!motilalForm.totpSecret && (
                <div className="grid gap-1.5 xl:col-span-1">
                  <Label htmlFor="motilal-totp">TOTP (Manual)</Label>
                  <Input
                    id="motilal-totp"
                    value={motilalForm.totp}
                    onChange={(event) => handleMotilalFieldChange("totp", event.target.value)}
                    placeholder="6-digit code"
                  />
                </div>
              )}
              <div className="grid gap-1.5 xl:col-span-2">
                <Label htmlFor="motilal-apikey">API Key</Label>
                <Input
                  id="motilal-apikey"
                  value={motilalForm.apiKey}
                  onChange={(event) => handleMotilalFieldChange("apiKey", event.target.value)}
                  placeholder="Your API key"
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-2">
                <Label htmlFor="motilal-secret">API Secret Key</Label>
                <Input
                  id="motilal-secret"
                  value={motilalForm.apiSecretKey}
                  onChange={(event) => handleMotilalFieldChange("apiSecretKey", event.target.value)}
                  placeholder="Your API secret key"
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-2">
                <Label htmlFor="motilal-vendor">Vendor Info</Label>
                <Input
                  id="motilal-vendor"
                  value={motilalForm.vendorinfo}
                  onChange={(event) => handleMotilalFieldChange("vendorinfo", event.target.value)}
                  placeholder="Optional vendor"
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-2">
                <Label htmlFor="motilal-totp-secret">TOTP Secret</Label>
                <Input
                  id="motilal-totp-secret"
                  type="password"
                  value={motilalForm.totpSecret}
                  onChange={(event) => handleMotilalFieldChange("totpSecret", event.target.value)}
                  placeholder="Y7RK..."
                />
              </div>
              <div className="grid gap-1.5 xl:col-span-2">
                <Label className="opacity-0">Action</Label>
                <Button
                  type="button"
                  onClick={() => void handleImportMotilalHoldings()}
                  disabled={fetchMotilalMutation.isPending}
                  className="w-full min-w-[180px]"
                >
                  {fetchMotilalMutation.isPending ? "Importing..." : "Fetch Holdings"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs">
              <p className="text-muted-foreground">
                We save your Motilal configuration and session in MongoDB and auto-fetch
                holdings when the saved session is still valid. If you provide the{" "}
                <strong>TOTP Secret</strong>, login will be fully automatic!
              </p>
            </div>

            {motilalSessionSavedAt ? (
              <p className="text-xs text-muted-foreground">
                Saved session available from {new Date(motilalSessionSavedAt).toLocaleString()}.
              </p>
            ) : null}

            {motilalError ? <p className="text-sm text-red-500">{motilalError}</p> : null}

            {motilalPreview.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  {motilalPreview.length} holdings ready to import
                </div>
                <div className="rounded-md border max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-3 py-2">Name</th>
                        <th className="text-right px-3 py-2">Qty</th>
                        <th className="text-right px-3 py-2">Avg Price</th>
                        <th className="text-left px-3 py-2">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {motilalPreview.map((holding, index) => (
                        <tr key={`${holding.symbol}-${index}`} className="border-b border-border/30">
                          <td className="px-3 py-2">{holding.name}</td>
                          <td className="px-3 py-2 text-right">{holding.qty}</td>
                          <td className="px-3 py-2 text-right">{holding.avgPrice.toFixed(2)}</td>
                          <td className="px-3 py-2">{holding.app || "MOFS API"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          {mode === "manual" || isEditMode ? (
            <Button type="button" onClick={handleSubmit}>
              {isEditMode ? "Save Changes" : "Add"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConfirmMotilalImport}
              disabled={motilalPreview.length === 0}
            >
              Import Holdings
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
