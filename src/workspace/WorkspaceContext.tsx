import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  createWork,
  duplicateWork,
  fetchBootstrap,
  updateProfile,
} from "@/lib/api";
import type { BootstrapPayload, CreateWorkInput, ProfilePayload } from "@/types";

interface WorkspaceContextValue {
  loading: boolean;
  error: string;
  bootstrap: BootstrapPayload | null;
  refreshBootstrap: () => Promise<void>;
  createWorkAndRefresh: (payload: CreateWorkInput) => Promise<string>;
  duplicateWorkAndRefresh: (workId: string) => Promise<string>;
  updateProfileAndRefresh: (payload: Partial<ProfilePayload>) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, deviceId, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);

  const refreshBootstrap = useCallback(async () => {
    if (!accessToken) {
      setBootstrap(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await fetchBootstrap(accessToken, deviceId);
      setBootstrap(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "加载工作台失败");
    } finally {
      setLoading(false);
    }
  }, [accessToken, deviceId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBootstrap(null);
      setLoading(false);
      return;
    }

    void refreshBootstrap();
  }, [isAuthenticated, refreshBootstrap]);

  const createWorkAndRefresh = useCallback(
    async (payload: CreateWorkInput) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      const result = await createWork(accessToken, deviceId, payload);
      await refreshBootstrap();
      return result.projectId;
    },
    [accessToken, deviceId, refreshBootstrap],
  );

  const duplicateWorkAndRefresh = useCallback(
    async (workId: string) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      const result = await duplicateWork(accessToken, deviceId, workId);
      await refreshBootstrap();
      return result.projectId;
    },
    [accessToken, deviceId, refreshBootstrap],
  );

  const updateProfileAndRefresh = useCallback(
    async (payload: Partial<ProfilePayload>) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      const nextProfile = await updateProfile(accessToken, deviceId, payload);
      setBootstrap((current) =>
        current
          ? {
              ...current,
              profile: nextProfile,
            }
          : current,
      );
    },
    [accessToken, deviceId],
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      bootstrap,
      refreshBootstrap,
      createWorkAndRefresh,
      duplicateWorkAndRefresh,
      updateProfileAndRefresh,
    }),
    [
      bootstrap,
      createWorkAndRefresh,
      duplicateWorkAndRefresh,
      error,
      loading,
      refreshBootstrap,
      updateProfileAndRefresh,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
};
