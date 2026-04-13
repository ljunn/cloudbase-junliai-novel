import type {
  AssistantReply,
  BootstrapPayload,
  ChapterRecord,
  CreateWorkInput,
  ExportRecord,
  GenerationRecord,
  GenerationRequest,
  ProfilePayload,
  SessionPayload,
  WorkDetail,
} from "@/types";
import { withApiBase } from "./basePath";

interface RequestOptions extends RequestInit {
  authToken?: string | null;
  deviceId?: string | null;
  timeoutMs?: number;
}

const REQUEST_TIMEOUT_MS = 12000;

const createRequestSignal = (
  timeoutMs?: number,
  sourceSignal?: AbortSignal | null,
) => {
  if (!timeoutMs && !sourceSignal) {
    return { signal: undefined, cleanup: () => {} };
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const abortFromSource = () => {
    controller.abort();
  };

  if (sourceSignal) {
    if (sourceSignal.aborted) {
      controller.abort();
    } else {
      sourceSignal.addEventListener("abort", abortFromSource, { once: true });
    }
  }

  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (sourceSignal) {
        sourceSignal.removeEventListener("abort", abortFromSource);
      }
    },
  };
};

const request = async <T>(path: string, init?: RequestOptions): Promise<T> => {
  const headers = new Headers(init?.headers || {});
  const { signal, cleanup } = createRequestSignal(
    init?.timeoutMs || REQUEST_TIMEOUT_MS,
    init?.signal,
  );

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (init?.authToken) {
    headers.set("Authorization", `Bearer ${init.authToken}`);
  }

  if (init?.deviceId) {
    headers.set("x-device-id", init.deviceId);
  }

  try {
    const response = await fetch(path, {
      headers,
      ...init,
      signal,
    });

    const payload = (await response.json()) as T & { message?: string };

    if (!response.ok) {
      throw new Error(payload.message || "请求失败");
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("请求超时，请稍后重试");
    }

    throw error;
  } finally {
    cleanup();
  }
};

export const fetchSession = (authToken: string, deviceId: string) =>
  request<SessionPayload>(withApiBase("/api/session"), {
    authToken,
    deviceId,
  });

export const fetchBootstrap = (authToken: string, deviceId: string) =>
  request<BootstrapPayload>(withApiBase("/api/bootstrap"), {
    authToken,
    deviceId,
  });

export const createWork = (
  authToken: string,
  deviceId: string,
  payload: CreateWorkInput,
) =>
  request<{ projectId: string }>(withApiBase("/api/works"), {
    method: "POST",
    authToken,
    deviceId,
    body: JSON.stringify(payload),
  });

export const fetchWorkDetail = (
  authToken: string,
  deviceId: string,
  workId: string,
) =>
  request<WorkDetail>(withApiBase(`/api/works/${encodeURIComponent(workId)}`), {
    authToken,
    deviceId,
  });

export const updateWorkMeta = (
  authToken: string,
  deviceId: string,
  workId: string,
  payload: object,
) =>
  request(withApiBase(`/api/works/${encodeURIComponent(workId)}`), {
    method: "PUT",
    authToken,
    deviceId,
    body: JSON.stringify(payload),
  });

export const duplicateWork = (
  authToken: string,
  deviceId: string,
  workId: string,
) =>
  request<{ projectId: string }>(
    withApiBase(`/api/works/${encodeURIComponent(workId)}/duplicate`),
    {
      method: "POST",
      authToken,
      deviceId,
    },
  );

export const saveDocument = (
  authToken: string,
  deviceId: string,
  workId: string,
  documentType: string,
  payload: object,
  documentId?: string,
) =>
  request(
    withApiBase(
      documentId
        ? `/api/works/${encodeURIComponent(workId)}/documents/${documentType}/${encodeURIComponent(documentId)}`
        : `/api/works/${encodeURIComponent(workId)}/documents/${documentType}`,
    ),
    {
      method: documentId ? "PUT" : "POST",
      authToken,
      deviceId,
      body: JSON.stringify(payload),
    },
  );

export const saveSingletonDocument = (
  authToken: string,
  deviceId: string,
  workId: string,
  documentType: string,
  payload: object,
) =>
  request(
    withApiBase(
      `/api/works/${encodeURIComponent(workId)}/documents/${documentType}`,
    ),
    {
      method: "PUT",
      authToken,
      deviceId,
      body: JSON.stringify(payload),
    },
  );

export const removeDocument = (
  authToken: string,
  deviceId: string,
  workId: string,
  documentType: string,
  documentId: string,
) =>
  request(
    withApiBase(
      `/api/works/${encodeURIComponent(workId)}/documents/${documentType}/${encodeURIComponent(documentId)}`,
    ),
    {
      method: "DELETE",
      authToken,
      deviceId,
    },
  );

export const saveVolume = (
  authToken: string,
  deviceId: string,
  workId: string,
  payload: object,
  volumeId?: string,
) =>
  request(
    withApiBase(
      volumeId
        ? `/api/works/${encodeURIComponent(workId)}/volumes/${encodeURIComponent(volumeId)}`
        : `/api/works/${encodeURIComponent(workId)}/volumes`,
    ),
    {
      method: volumeId ? "PUT" : "POST",
      authToken,
      deviceId,
      body: JSON.stringify(payload),
    },
  );

export const saveChapter = (
  authToken: string,
  deviceId: string,
  workId: string,
  payload: object,
  chapterId?: string,
) =>
  request<ChapterRecord>(
    withApiBase(
      chapterId
        ? `/api/works/${encodeURIComponent(workId)}/chapters/${encodeURIComponent(chapterId)}`
        : `/api/works/${encodeURIComponent(workId)}/chapters`,
    ),
    {
      method: chapterId ? "PUT" : "POST",
      authToken,
      deviceId,
      body: JSON.stringify(payload),
      timeoutMs: 20000,
    },
  );

export const generateChapterContent = (
  authToken: string,
  deviceId: string,
  workId: string,
  chapterId: string,
  payload: GenerationRequest,
) =>
  request<GenerationRecord>(
    withApiBase(
      `/api/works/${encodeURIComponent(workId)}/chapters/${encodeURIComponent(chapterId)}/generate`,
    ),
    {
      method: "POST",
      authToken,
      deviceId,
      body: JSON.stringify(payload),
      timeoutMs: 120000,
    },
  );

export const runAssistant = (
  authToken: string,
  deviceId: string,
  workId: string,
  payload: Pick<
    GenerationRequest,
    "instruction" | "contextScope" | "includeContexts" | "selectedText"
  >,
) =>
  request<AssistantReply>(
    withApiBase(`/api/works/${encodeURIComponent(workId)}/assistant`),
    {
      method: "POST",
      authToken,
      deviceId,
      body: JSON.stringify(payload),
      timeoutMs: 120000,
    },
  );

export const exportWork = (
  authToken: string,
  deviceId: string,
  workId: string,
  format: "txt" | "markdown" | "docx",
  scope: "full" | "volume" | "selection",
  chapterIds?: string[],
) =>
  request<ExportRecord & { contentBase64: string; mimeType: string }>(
    withApiBase(`/api/works/${encodeURIComponent(workId)}/export`),
    {
      method: "POST",
      authToken,
      deviceId,
      body: JSON.stringify({ format, scope, chapterIds }),
      timeoutMs: 120000,
    },
  );

export const updateProfile = (
  authToken: string,
  deviceId: string,
  payload: Partial<ProfilePayload>,
) =>
  request<ProfilePayload>(withApiBase("/api/profile"), {
    method: "PUT",
    authToken,
    deviceId,
    body: JSON.stringify(payload),
  });
