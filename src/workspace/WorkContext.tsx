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
  exportWork,
  fetchWorkDetail,
  generateChapterContent,
  removeDocument,
  runAssistant,
  saveChapter,
  saveDocument,
  saveSingletonDocument,
  saveVolume,
  updateWorkMeta,
} from "@/lib/api";
import type {
  AssistantReply,
  ExportRecord,
  GenerationRecord,
  GenerationRequest,
  WorkDetail,
} from "@/types";

interface WorkContextValue {
  loading: boolean;
  error: string;
  work: WorkDetail | null;
  refresh: () => Promise<void>;
  updateProject: (payload: object) => Promise<void>;
  updateSingletonDocument: (
    documentType: string,
    payload: object,
  ) => Promise<void>;
  upsertDocument: (
    documentType: string,
    payload: object,
    documentId?: string,
  ) => Promise<void>;
  deleteDocument: (documentType: string, documentId: string) => Promise<void>;
  upsertVolume: (
    payload: object,
    volumeId?: string,
  ) => Promise<void>;
  upsertChapter: (
    payload: object,
    chapterId?: string,
  ) => Promise<void>;
  runGeneration: (
    chapterId: string,
    payload: GenerationRequest,
  ) => Promise<GenerationRecord>;
  askAssistant: (
    payload: Pick<
      GenerationRequest,
      "instruction" | "contextScope" | "includeContexts" | "selectedText"
    >,
  ) => Promise<AssistantReply>;
  triggerExport: (
    format: "txt" | "markdown" | "docx",
    scope: "full" | "volume" | "selection",
    chapterIds?: string[],
  ) => Promise<ExportRecord & { contentBase64: string; mimeType: string }>;
}

const WorkContext = createContext<WorkContextValue | null>(null);

export const WorkProvider = ({
  workId,
  children,
}: {
  workId: string;
  children: ReactNode;
}) => {
  const { accessToken, deviceId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [work, setWork] = useState<WorkDetail | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setWork(null);
      setLoading(false);
      return;
    }

    const shouldShowLoading = !work;
    if (shouldShowLoading) {
      setLoading(true);
    }
    setError("");

    try {
      setWork(await fetchWorkDetail(accessToken, deviceId, workId));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "读取作品失败");
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [accessToken, deviceId, work, workId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const guardedCall = useCallback(
    async (action: () => Promise<void>) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      await action();
      await refresh();
    },
    [accessToken, refresh],
  );

  const updateProject = useCallback(
    async (payload: object) => {
      await guardedCall(async () => {
        await updateWorkMeta(accessToken!, deviceId, workId, payload);
      });
    },
    [accessToken, deviceId, guardedCall, workId],
  );

  const updateSingletonDocument = useCallback(
    async (documentType: string, payload: object) => {
      await guardedCall(async () => {
        await saveSingletonDocument(accessToken!, deviceId, workId, documentType, payload);
      });
    },
    [accessToken, deviceId, guardedCall, workId],
  );

  const upsertDocument = useCallback(
    async (
      documentType: string,
      payload: object,
      documentId?: string,
    ) => {
      await guardedCall(async () => {
        await saveDocument(accessToken!, deviceId, workId, documentType, payload, documentId);
      });
    },
    [accessToken, deviceId, guardedCall, workId],
  );

  const deleteDocument = useCallback(
    async (documentType: string, documentId: string) => {
      await guardedCall(async () => {
        await removeDocument(accessToken!, deviceId, workId, documentType, documentId);
      });
    },
    [accessToken, deviceId, guardedCall, workId],
  );

  const upsertVolume = useCallback(
    async (payload: object, volumeId?: string) => {
      await guardedCall(async () => {
        await saveVolume(accessToken!, deviceId, workId, payload, volumeId);
      });
    },
    [accessToken, deviceId, guardedCall, workId],
  );

  const upsertChapter = useCallback(
    async (payload: object, chapterId?: string) => {
      await guardedCall(async () => {
        await saveChapter(accessToken!, deviceId, workId, payload, chapterId);
      });
    },
    [accessToken, deviceId, guardedCall, workId],
  );

  const runGeneration = useCallback(
    async (chapterId: string, payload: GenerationRequest) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      const result = await generateChapterContent(
        accessToken,
        deviceId,
        workId,
        chapterId,
        payload,
      );
      await refresh();
      return result;
    },
    [accessToken, deviceId, refresh, workId],
  );

  const askAssistant = useCallback(
    async (
      payload: Pick<
        GenerationRequest,
        "instruction" | "contextScope" | "includeContexts" | "selectedText"
      >,
    ) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      return runAssistant(accessToken, deviceId, workId, payload);
    },
    [accessToken, deviceId, workId],
  );

  const triggerExport = useCallback(
    async (
      format: "txt" | "markdown" | "docx",
      scope: "full" | "volume" | "selection",
      chapterIds?: string[],
    ) => {
      if (!accessToken) {
        throw new Error("请先登录");
      }

      return exportWork(accessToken, deviceId, workId, format, scope, chapterIds);
    },
    [accessToken, deviceId, workId],
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      work,
      refresh,
      updateProject,
      updateSingletonDocument,
      upsertDocument,
      deleteDocument,
      upsertVolume,
      upsertChapter,
      runGeneration,
      askAssistant,
      triggerExport,
    }),
    [
      askAssistant,
      deleteDocument,
      error,
      loading,
      refresh,
      runGeneration,
      triggerExport,
      updateProject,
      updateSingletonDocument,
      upsertChapter,
      upsertDocument,
      upsertVolume,
      work,
    ],
  );

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
};

export const useWork = () => {
  const context = useContext(WorkContext);

  if (!context) {
    throw new Error("useWork must be used within WorkProvider");
  }

  return context;
};
