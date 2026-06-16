export interface StockHolding {
  id?: string;
  symbol: string;
  name: string;
  qty: number;
  avgPrice: number;
  app?: string;
  sourceUrl?: string;
}

export interface MotilalPrefs {
  clientcode: string;
  userid: string;
  dob: string;
  apiKey: string;
  apiSecretKey: string;
  vendorinfo: string;
  totpSecret: string;
}

export interface MotilalSessionInfo {
  hasSession: boolean;
  savedAt: string;
}

export interface MotilalSettingsResponse extends Partial<MotilalPrefs> {
  session: MotilalSessionInfo;
}

export interface MotilalHoldingsResponse {
  holdings: StockHolding[];
  session?: {
    savedAt?: string;
    reusedSession?: boolean;
  };
  skipped?: boolean;
  message?: string;
  requiresReauth?: boolean;
}

export const HOLDINGS_QUERY_KEY = ["portfolio", "holdings"] as const;
export const MOTILAL_SETTINGS_QUERY_KEY = ["motilal", "settings"] as const;

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Request failed");
  }

  return data;
}

export async function fetchHoldings(): Promise<StockHolding[]> {
  const response = await fetch("/api/portfolio/holdings", {
    method: "GET",
    cache: "no-store",
  });

  return parseJson<StockHolding[]>(response);
}

export async function replaceHoldings(holdings: StockHolding[]) {
  const response = await fetch("/api/portfolio/holdings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ holdings }),
  });

  return parseJson<StockHolding[]>(response);
}

export async function appendHoldings(holdings: StockHolding[]) {
  const response = await fetch("/api/portfolio/holdings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "append", holdings }),
  });

  return parseJson<StockHolding[]>(response);
}

export async function saveHolding(holding: StockHolding, id?: string | null) {
  const response = await fetch("/api/portfolio/holdings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "upsert", id, holding }),
  });

  return parseJson<StockHolding[]>(response);
}

export async function deleteHolding(id: string) {
  const response = await fetch(`/api/portfolio/holdings?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return parseJson<StockHolding[]>(response);
}

export async function fetchMotilalSettings(): Promise<MotilalSettingsResponse> {
  const response = await fetch("/api/settings/motilal", {
    method: "GET",
    cache: "no-store",
  });

  return parseJson<MotilalSettingsResponse>(response);
}

export async function saveMotilalSettings(payload: Partial<MotilalPrefs>) {
  const response = await fetch("/api/settings/motilal", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJson<MotilalSettingsResponse>(response);
}

export async function clearMotilalSettings() {
  const response = await fetch("/api/settings/motilal", {
    method: "DELETE",
  });

  return parseJson<{ success: boolean }>(response);
}

export async function clearMotilalSavedSession() {
  const response = await fetch("/api/settings/motilal/session", {
    method: "DELETE",
  });

  return parseJson<{ success: boolean }>(response);
}

export async function fetchMotilalHoldings(
  payload: Partial<
    MotilalPrefs & {
      password: string;
      totp: string;
      persistHoldings: boolean;
    }
  >
) {
  const response = await fetch("/api/motilal/holdings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJson<MotilalHoldingsResponse>(response);
}

export interface Loan {
  id?: string;
  bank: string;
  sanctionLoan: number;
  type: string;
  emi: number;
  outstanding: number;
}

export const LOANS_QUERY_KEY = ["portfolio", "loans"] as const;

export async function fetchLoans(): Promise<Loan[]> {
  const response = await fetch("/api/portfolio/loans", {
    method: "GET",
    cache: "no-store",
  });

  return parseJson<Loan[]>(response);
}

export async function replaceLoans(loans: Loan[]) {
  const response = await fetch("/api/portfolio/loans", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loans }),
  });

  return parseJson<Loan[]>(response);
}

export async function appendLoans(loans: Loan[]) {
  const response = await fetch("/api/portfolio/loans", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "append", loans }),
  });

  return parseJson<Loan[]>(response);
}

export async function saveLoan(loan: Loan, id?: string | null) {
  const response = await fetch("/api/portfolio/loans", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "upsert", id, loan }),
  });

  return parseJson<Loan[]>(response);
}

export async function deleteLoan(id: string) {
  const response = await fetch(`/api/portfolio/loans?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return parseJson<Loan[]>(response);
}

export interface OtherInvestment {
  id?: string;
  particulars: string;
  amount: number;
}

export const OTHER_INVESTMENTS_QUERY_KEY = ["portfolio", "other-investments"] as const;

export async function fetchOtherInvestments(): Promise<OtherInvestment[]> {
  const response = await fetch("/api/portfolio/other-investments", {
    method: "GET",
    cache: "no-store",
  });

  return parseJson<OtherInvestment[]>(response);
}

export async function replaceOtherInvestments(investments: OtherInvestment[]) {
  const response = await fetch("/api/portfolio/other-investments", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ investments }),
  });

  return parseJson<OtherInvestment[]>(response);
}

export async function appendOtherInvestments(investments: OtherInvestment[]) {
  const response = await fetch("/api/portfolio/other-investments", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "append", investments }),
  });

  return parseJson<OtherInvestment[]>(response);
}

export async function saveOtherInvestment(investment: OtherInvestment, id?: string | null) {
  const response = await fetch("/api/portfolio/other-investments", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "upsert", id, investment }),
  });

  return parseJson<OtherInvestment[]>(response);
}

export async function deleteOtherInvestment(id: string) {
  const response = await fetch(`/api/portfolio/other-investments?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return parseJson<OtherInvestment[]>(response);
}


