import { fetchMotilalSettings } from "@/lib/portfolio-api";

export const MOTILAL_SYNC_EVENT = "motilal-holdings-synced";

export async function loadMotilalSession() {
  const settings = await fetchMotilalSettings();
  return settings.session?.hasSession
    ? { savedAt: settings.session.savedAt }
    : null;
}

export {
  type MotilalPrefs,
  fetchMotilalSettings as loadMotilalPrefs,
  saveMotilalSettings as saveMotilalPrefs,
  clearMotilalSettings as clearMotilalPrefs,
  clearMotilalSavedSession as clearMotilalSession,
} from "@/lib/portfolio-api";
