export type HubSpotConnectionStatus = {
  configured: boolean;
  connected: boolean;
  portalId?: number | null;
  user?: string | null;
};

const key = "followpilot:hubspot-status";

export function readHubSpotStatus() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) as HubSpotConnectionStatus : null;
  } catch {
    return null;
  }
}

export function saveHubSpotStatus(status: HubSpotConnectionStatus) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(status));
  } catch {
    // Status caching is only a visual optimization; the server remains authoritative.
  }
}
