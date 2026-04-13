import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const normalizeBasePath = (value: string | undefined) => {
  const normalized = String(value || "/").trim();

  if (!normalized || normalized === "/") {
    return "/";
  }

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  return `${withLeadingSlash.replace(/\/+$/, "")}/`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const loginOrigin = String(env.VITE_LOGIN_ORIGIN || "https://junliai.com")
    .trim()
    .replace(/\/+$/, "");

  return {
    plugins: [react()],
    base: normalizeBasePath(env.VITE_APP_BASE_PATH || "/novel"),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: "127.0.0.1",
      proxy: {
        "/novel/api": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
        },
        "/__auth": {
          target: loginOrigin,
          changeOrigin: true,
        },
      },
      allowedHosts: true,
    },
  };
});
