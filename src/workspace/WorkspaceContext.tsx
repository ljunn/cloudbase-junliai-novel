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
  const { accessToken, deviceId, isAuthenticated, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);

  const buildFallbackBootstrap = useCallback((): BootstrapPayload | null => {
    if (!session) {
      return null;
    }

    return {
      dashboard: {
        metrics: [
          {
            label: "创作中作品",
            value: "0",
            hint: "后端数据暂时不可用，稍后重试会自动刷新。",
            status: "pending",
          },
          {
            label: "累计章节",
            value: "0",
            hint: "当前仅恢复了 CloudBase 登录态。",
            status: "pending",
          },
          {
            label: "累计字数",
            value: "0 字",
            hint: "等待工作台数据恢复后会自动更新。",
            status: "pending",
          },
          {
            label: "最近 AI 生成",
            value: "0",
            hint: "当前还无法读取生成历史。",
            status: "pending",
          },
        ],
        recentProjects: [],
        pendingChapters: [],
        drafts: [],
        recentGenerations: [],
      },
      works: [],
      templates: [],
      trash: [],
      profile: {
        displayName: session.user.name || "已登录用户",
        email: session.user.email || "",
        phone: session.user.phone || "",
        avatarUrl: session.user.avatarUrl || "",
        planName: "已登录",
        coinBalance: 0,
        usageSummary: "工作台数据暂时不可用，稍后会自动恢复。",
        preferredModel: "hunyuan-2.0-instruct-20251111",
        defaultVoice: "强情节、稳叙事、网文可读性优先",
        preferences: {
          autoSummary: true,
          autoVersioning: true,
          compactEditor: false,
        },
      },
    };
  }, [session]);

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
      setError("");
    } catch (fetchError) {
      const fallback = buildFallbackBootstrap();
      if (fallback) {
        setBootstrap(fallback);
        setError("");
      } else {
        setError(fetchError instanceof Error ? fetchError.message : "加载工作台失败");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, buildFallbackBootstrap, deviceId]);

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
