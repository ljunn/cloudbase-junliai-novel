import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchSession } from "../lib/api";
import {
  APP_CLIENT_ID,
  APP_ENV_ID,
  APP_LOGIN_ORIGIN,
} from "../lib/cloudbaseConfig";
import { APP_BASE_PATH } from "../lib/basePath";
import { getDeviceId } from "../lib/visitor";
import type { SessionPayload } from "../types";

interface AuthContextValue {
  loading: boolean;
  accessToken: string | null;
  session: SessionPayload | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  deviceId: string;
  refreshSession: () => Promise<void>;
  goToLoginPage: (redirectUri?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ACCESS_TOKEN_STORAGE_KEY = "junli-novel-access-token";
const POST_LOGIN_HASH_STORAGE_KEY = "junli-novel-post-login-hash";
const AUTH_CALLBACK_HINT_PATTERN =
  /(?:^|[?#&])(access_token|refresh_token|authorization_code|code|oobCode|state)=/;

let authModulePromise: Promise<typeof import("../lib/cloudbase")> | null = null;

const loadAuthModule = () => {
  authModulePromise ??= import("../lib/cloudbase");
  return authModulePromise;
};

const readCachedAccessToken = () => {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistAccessToken = (accessToken: string | null) => {
  try {
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures and keep auth flow usable.
  }
};

const readPostLoginHash = () => {
  try {
    return window.sessionStorage.getItem(POST_LOGIN_HASH_STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistPostLoginHash = (hash: string | null) => {
  try {
    if (hash) {
      window.sessionStorage.setItem(POST_LOGIN_HASH_STORAGE_KEY, hash);
    } else {
      window.sessionStorage.removeItem(POST_LOGIN_HASH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures and keep auth flow usable.
  }
};

const normalizeSessionToken = (response: unknown) => {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    "session" in response.data
  ) {
    return (
      (response.data as { session?: { access_token?: string } }).session || null
    );
  }

  return null;
};

const normalizeLocalUserSession = (authUser: unknown, claims: unknown): SessionPayload => {
  const user = authUser && typeof authUser === "object" ? authUser : {};
  const metadata =
    "user_metadata" in user &&
    user.user_metadata &&
    typeof user.user_metadata === "object"
      ? user.user_metadata
      : {};
  const tokenClaims =
    claims && typeof claims === "object" ? claims : {};

  const groups =
    "groups" in tokenClaims && Array.isArray(tokenClaims.groups)
      ? tokenClaims.groups.map((item) => String(item))
      : [];

  const nameCandidates = [
    "name" in metadata ? metadata.name : "",
    "nickName" in metadata ? metadata.nickName : "",
    "username" in metadata ? metadata.username : "",
    "name" in tokenClaims ? tokenClaims.name : "",
    "email" in user ? user.email : "",
    "phone" in user ? user.phone : "",
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return {
    user: {
      id: String(
        ("sub" in tokenClaims ? tokenClaims.sub : "") ||
          ("user_id" in tokenClaims ? tokenClaims.user_id : "") ||
          ("id" in user ? user.id : "") ||
          "",
      ),
      name: nameCandidates[0] || "已登录用户",
      email: String(
        ("email" in user ? user.email : "") ||
          ("email" in tokenClaims ? tokenClaims.email : "") ||
          "",
      ),
      phone: String(
        ("phone" in user ? user.phone : "") ||
          ("phone_number" in tokenClaims ? tokenClaims.phone_number : "") ||
          "",
      ),
      avatarUrl: String(
        ("picture" in metadata ? metadata.picture : "") ||
          ("avatarUrl" in metadata ? metadata.avatarUrl : "") ||
          ("picture" in tokenClaims ? tokenClaims.picture : "") ||
          "",
      ),
      groups,
      isAnonymous: Boolean(
        ("is_anonymous" in user ? user.is_anonymous : false) ||
          ("scope" in tokenClaims ? tokenClaims.scope === "anonymous" : false),
      ),
    },
    isAdmin: Boolean(
      "is_system_admin" in tokenClaims ? tokenClaims.is_system_admin : false,
    ),
  };
};

const hasAuthCallbackHint = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return AUTH_CALLBACK_HINT_PATTERN.test(
    `${window.location.search}${window.location.hash}`,
  );
};

const getHostedLoginCallbackUrl = () => {
  if (typeof window === "undefined") {
    return APP_BASE_PATH === "/" ? "/" : `${APP_BASE_PATH}/`;
  }

  const callbackPath = APP_BASE_PATH === "/" ? "/" : `${APP_BASE_PATH}/`;
  return `${window.location.origin}${callbackPath}`;
};

const restorePostLoginRouteIfNeeded = () => {
  if (typeof window === "undefined") {
    return;
  }

  const savedHash = readPostLoginHash();
  const normalizedHash = savedHash && savedHash.startsWith("#") ? savedHash : "#/";
  const hasCallbackHint = hasAuthCallbackHint();
  const currentUrl = new URL(window.location.href);

  if (!savedHash && !hasCallbackHint) {
    return;
  }

  persistPostLoginHash(null);

  const targetHash = savedHash ? normalizedHash : currentUrl.hash || "#/";
  const nextUrl = `${currentUrl.origin}${currentUrl.pathname}${targetHash}`;

  if (nextUrl !== window.location.href) {
    window.location.replace(nextUrl);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const deviceId = getDeviceId();

  const applySession = (nextAccessToken: string, payload: SessionPayload) => {
    setAccessToken(nextAccessToken);
    setSession(payload);
    persistAccessToken(nextAccessToken);
    restorePostLoginRouteIfNeeded();
  };

  const clearSession = () => {
    setAccessToken(null);
    setSession(null);
    persistAccessToken(null);
  };

  const hydrateSession = async (nextAccessToken: string | null | undefined) => {
    if (!nextAccessToken) {
      clearSession();
      return;
    }

    try {
      const payload = await fetchSession(nextAccessToken, deviceId);
      applySession(nextAccessToken, payload);
      return;
    } catch {
      const { auth } = await loadAuthModule();
      const [userResult, claimsResult] = await Promise.all([
        auth.getUser().catch(() => null),
        auth.getClaims().catch(() => null),
      ]);

      const fallbackPayload = normalizeLocalUserSession(
        userResult?.data?.user,
        claimsResult?.data?.claims,
      );
      applySession(nextAccessToken, fallbackPayload);
    }
  };

  const restoreSessionFromAuth = async () => {
    const { auth } = await loadAuthModule();
    const response = await auth.getSession();
    const sessionData = normalizeSessionToken(response);

    await hydrateSession(sessionData?.access_token);
  };

  const refreshSession = async () => {
    await restoreSessionFromAuth();
  };

  useEffect(() => {
    let disposed = false;
    let unsubscribe = () => {};

    const attachAuthListener = async ({
      refreshImmediately,
    }: {
      refreshImmediately: boolean;
    }) => {
      try {
        const { auth } = await loadAuthModule();

        if (disposed) {
          return;
        }

        if (refreshImmediately) {
          await restoreSessionFromAuth();

          if (disposed) {
            return;
          }
        }

        const subscription = auth.onAuthStateChange((event, nextSession) => {
          if (event === "SIGNED_OUT") {
            if (!disposed) {
              clearSession();
            }
            return;
          }

          void hydrateSession(nextSession?.access_token).catch(() => {
            void restoreSessionFromAuth().catch(() => {
              if (!disposed) {
                clearSession();
              }
            });
          });
        });

        unsubscribe = () => {
          subscription.data.subscription.unsubscribe();
        };
      } catch {
        if (!disposed && refreshImmediately) {
          clearSession();
        }
      }
    };

    const boot = async () => {
      try {
        const cachedAccessToken = readCachedAccessToken();

        if (cachedAccessToken) {
          try {
            await hydrateSession(cachedAccessToken);
          } catch {
            if (!disposed) {
              clearSession();
            }

            await restoreSessionFromAuth();
          }
        } else {
          await restoreSessionFromAuth();
        }

        await attachAuthListener({ refreshImmediately: false });
      } catch {
        if (!disposed) {
          clearSession();
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void boot();

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [deviceId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      accessToken,
      session,
      isAuthenticated: Boolean(accessToken && session),
      isAdmin: Boolean(session?.isAdmin),
      deviceId,
      refreshSession,
      async goToLoginPage(redirectUri) {
        const target = redirectUri || window.location.href;
        const targetUrl = new URL(target, window.location.origin);
        persistPostLoginHash(targetUrl.hash || window.location.hash || "#/");
        const loginUrl =
          `${APP_LOGIN_ORIGIN}/__auth/?env_id=${encodeURIComponent(APP_ENV_ID)}` +
          `&client_id=${encodeURIComponent(APP_CLIENT_ID)}` +
          `&config_version=env` +
          `&redirect_uri=${encodeURIComponent(getHostedLoginCallbackUrl())}`;

        window.location.href = loginUrl;
      },
      async signOut() {
        const { auth } = await loadAuthModule();
        await auth.signOut();
        clearSession();
      },
    }),
    [accessToken, deviceId, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
