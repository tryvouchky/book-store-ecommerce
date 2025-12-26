export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "FoodHub";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=FoodHub";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  try {
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    
    // If environment variables are not set, return a placeholder
    if (!oauthPortalUrl || !appId) {
      console.warn("OAuth environment variables not configured. Falling back to local /login route.");
      // In development, use the local mock login page
      return "/login";
    }
    
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (error) {
    console.warn("Failed to construct login URL", error);
    return "#";
  }
};
