export const DEFAULT_ENV_ID = "fanqie-xinshu-front-4cjw9c4ef031";
export const DEFAULT_REGION = "ap-shanghai";
export const DEFAULT_LOGIN_ORIGIN = "https://junliai.com";
export const DEFAULT_APP_BASE_PATH = "/novel";
export const DEFAULT_PUBLISHABLE_KEY =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2ZhbnFpZS14aW5zaHUtZnJvbnQtNGNqdzljNGVmMDMxLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJmYW5xaWUteGluc2h1LWZyb250LTRjanc5YzRlZjAzMSIsImV4cCI6NDA3NzQ5ODc3OCwiaWF0IjoxNzczODE1NTc4LCJub25jZSI6IkpUVkRPbnhlUjFTY1poVW5SV3VGNkEiLCJhdF9oYXNoIjoiSlRWRE9ueGVSMVNjWmhVblJXdUY2QSIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJmYW5xaWUteGluc2h1LWZyb250LTRjanc5YzRlZjAzMSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.eGeArhDTT99fXGWM7JMiSDQ673zxJaPzL8EMaVA1oyDiDCfC7YJbeyiIEIpLeJY7XE1RRyXPa1O6oti5MaWJ3G31sa-u8kE0H_WF6XN0SGwyaoeoNtunbeHXTawFXBzit9IXend3j695palG2dG7ViHzaRVmFQEdo27-2Hq-2x2uAAg_dsUCnVQTi5jn9vBrxJ1Re0a3CPk5nKuNMm8lAxj-Dm2cxdqDQNft6fWngXYoKj_t47og8lSb8XEpBLz0ceOsCNtpk-x90viyxrAnPMPtMm41Cg4FsVERfk1_dCEy8hQVPx7-sTuNNNB3SNXQgtFIqLECtuGJ2xEloaZTrg";

export const APP_ENV_ID =
  import.meta.env.VITE_CLOUDBASE_ENV_ID ||
  import.meta.env.VITE_ENV_ID ||
  DEFAULT_ENV_ID;
export const APP_REGION =
  import.meta.env.VITE_CLOUDBASE_REGION ||
  import.meta.env.VITE_REGION ||
  DEFAULT_REGION;
export const APP_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLOUDBASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_PUBLISHABLE_KEY ||
  DEFAULT_PUBLISHABLE_KEY;
export const APP_CLIENT_ID =
  import.meta.env.VITE_CLOUDBASE_CLIENT_ID || APP_ENV_ID;
export const APP_BASE_PATH_HINT =
  import.meta.env.VITE_APP_BASE_PATH || DEFAULT_APP_BASE_PATH;
export const APP_API_ORIGIN = String(import.meta.env.VITE_API_ORIGIN || "")
  .trim()
  .replace(/\/+$/, "");
export const APP_LOGIN_ORIGIN = String(
  import.meta.env.VITE_LOGIN_ORIGIN ||
    (typeof window !== "undefined"
      ? window.location.origin
      : DEFAULT_LOGIN_ORIGIN),
)
  .trim()
  .replace(/\/+$/, "");
