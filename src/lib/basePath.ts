import { APP_API_ORIGIN, APP_BASE_PATH_HINT } from "./cloudbaseConfig";

const normalizeBasePath = (value: string | undefined) => {
  const normalized = String(value || "/").trim();

  if (!normalized || normalized === "/") {
    return "/";
  }

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  return withLeadingSlash.replace(/\/+$/, "");
};

export const APP_BASE_PATH = normalizeBasePath(APP_BASE_PATH_HINT);
const APP_API_BASE =
  APP_API_ORIGIN || (APP_BASE_PATH === "/" ? "" : APP_BASE_PATH);

export const withBasePath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return APP_BASE_PATH === "/"
    ? normalizedPath
    : `${APP_BASE_PATH}${normalizedPath}`;
};

export const withApiBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return APP_API_BASE ? `${APP_API_BASE}${normalizedPath}` : normalizedPath;
};

export const withHashRoute = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const routePath =
    APP_BASE_PATH !== "/" &&
    (normalizedPath === APP_BASE_PATH ||
      normalizedPath.startsWith(`${APP_BASE_PATH}/`))
      ? normalizedPath.slice(APP_BASE_PATH.length) || "/"
      : normalizedPath;

  return `${APP_BASE_PATH === "/" ? "" : APP_BASE_PATH}/#${routePath}`;
};
