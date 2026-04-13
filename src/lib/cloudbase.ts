import cloudbase from "@cloudbase/js-sdk";
import { APP_ENV_ID, APP_PUBLISHABLE_KEY, APP_REGION } from "./cloudbaseConfig";

export const cloudbaseApp = cloudbase.init({
  env: APP_ENV_ID,
  region: APP_REGION,
  accessKey: APP_PUBLISHABLE_KEY,
  auth: {
    detectSessionInUrl: true,
  },
});

export const auth = cloudbaseApp.auth({
  persistence: "local",
});
