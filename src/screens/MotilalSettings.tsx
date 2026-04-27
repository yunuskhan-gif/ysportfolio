import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  clearMotilalPrefs,
  clearMotilalSession,
  loadMotilalPrefs,
  saveMotilalPrefs,
} from "@/lib/motilal-storage";
import { MOTILAL_SETTINGS_QUERY_KEY } from "@/lib/portfolio-api";

type SettingsFormState = {
  clientcode: string;
  userid: string;
  dob: string;
  apiKey: string;
  apiSecretKey: string;
  vendorinfo: string;
  totpSecret: string;
};

const EMPTY_FORM: SettingsFormState = {
  clientcode: "",
  userid: "",
  dob: "",
  apiKey: "",
  apiSecretKey: "",
  vendorinfo: "",
  totpSecret: "",
};

const MotilalSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM);

  const { data: settings, isLoading } = useQuery({
    queryKey: MOTILAL_SETTINGS_QUERY_KEY,
    queryFn: loadMotilalPrefs,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      clientcode: settings.clientcode || "",
      userid: settings.userid || "",
      dob: settings.dob || "",
      apiKey: settings.apiKey || "",
      apiSecretKey: settings.apiSecretKey || "",
      vendorinfo: settings.vendorinfo || "",
      totpSecret: settings.totpSecret || "",
    });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: saveMotilalPrefs,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MOTILAL_SETTINGS_QUERY_KEY });
      toast.success("Motilal settings saved.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save Motilal settings.");
    },
  });

  const clearSessionMutation = useMutation({
    mutationFn: clearMotilalSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MOTILAL_SETTINGS_QUERY_KEY });
      toast.success("Saved Motilal session cleared.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to clear session.");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await clearMotilalSession();
      await clearMotilalPrefs();
    },
    onSuccess: async () => {
      setForm(EMPTY_FORM);
      await queryClient.invalidateQueries({ queryKey: MOTILAL_SETTINGS_QUERY_KEY });
      toast.success("Saved Motilal config cleared.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to clear Motilal config.");
    },
  });

  const handleChange = (field: keyof SettingsFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync(form);
  };

  const handleClearSession = async () => {
    await clearSessionMutation.mutateAsync();
  };

  const handleClearAll = async () => {
    await clearAllMutation.mutateAsync();
  };

  const sessionSavedAt = settings?.session?.savedAt || "";

  return (
    <div className="space-y-4">
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Motilal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Save your non-sensitive Motilal details here once. Then the app can auto-fetch
            holdings when your saved session is still valid.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-clientcode">Client Code</Label>
              <Input id="mot-settings-clientcode" value={form.clientcode} onChange={(event) => handleChange("clientcode", event.target.value)} placeholder="AA020" disabled={isLoading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-userid">User ID</Label>
              <Input
                id="mot-settings-userid"
                value={form.userid}
                onChange={(event) => {
                  const val = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    userid: val,
                    // Auto-fill clientcode if it was empty or matches old userid
                    clientcode: !prev.clientcode || prev.clientcode === prev.userid ? val : prev.clientcode,
                  }));
                }}
                placeholder="AA020"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-dob">DOB</Label>
              <Input id="mot-settings-dob" value={form.dob} onChange={(event) => handleChange("dob", event.target.value)} placeholder="DD/MM/YYYY" disabled={isLoading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-apikey">API Key</Label>
              <Input id="mot-settings-apikey" value={form.apiKey} onChange={(event) => handleChange("apiKey", event.target.value)} placeholder="Your API key" disabled={isLoading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-secret">API Secret Key</Label>
              <Input id="mot-settings-secret" type="password" value={form.apiSecretKey} onChange={(event) => handleChange("apiSecretKey", event.target.value)} placeholder="Your API secret key" disabled={isLoading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-vendor">Vendor Info (Optional)</Label>
              <Input id="mot-settings-vendor" value={form.vendorinfo} onChange={(event) => handleChange("vendorinfo", event.target.value)} placeholder="Use Client Code if not a vendor" disabled={isLoading} />
              <p className="text-[10px] text-muted-foreground mt-1">
                If you are a retail client, leave this blank or use your <strong>Client Code</strong>.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mot-settings-totp-secret">TOTP Secret (32 chars)</Label>
              <Input id="mot-settings-totp-secret" type="password" value={form.totpSecret} onChange={(event) => handleChange("totpSecret", event.target.value)} placeholder="Y7RK..." disabled={isLoading} />
            </div>
          </div>

          <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Password is not saved. If you provide the <strong>TOTP Secret</strong>, the app can
            automatically generate login codes for you. Otherwise, you'll need to enter
            the 6-digit TOTP manually from your authenticator app during login.
          </div>

          {sessionSavedAt ? (
            <p className="text-xs text-muted-foreground">
              Saved session available from {new Date(sessionSavedAt).toLocaleString()}.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No saved Motilal session right now.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handleSave()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!form.apiKey) {
                  toast.error("Please save your API Key first.");
                  return;
                }
                window.location.href = "/api/auth/motilal/login";
              }}
            >
              Login via Portal
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleClearSession()} disabled={clearSessionMutation.isPending}>
              {clearSessionMutation.isPending ? "Clearing..." : "Clear Session"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleClearAll()} disabled={clearAllMutation.isPending}>
              {clearAllMutation.isPending ? "Clearing..." : "Clear All"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MotilalSettings;
