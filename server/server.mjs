import compression from "compression";
import express from "express";
import { resolveCurrentUser, HttpError } from "./auth.mjs";
import { generateNovelText } from "./ai.mjs";
import {
  buildDocxExport,
  buildMarkdownExport,
  buildTxtExport,
} from "./exporter.mjs";
import { appConfig } from "./config.mjs";
import { repository } from "./repository.mjs";

const app = express();
const port = Number(process.env.PORT || 3000);
const publicBaseUrl = new URL(appConfig.publicBaseUrl);
const publicBasePath = (() => {
  const value = String(appConfig.publicBasePath || "/").trim();
  if (!value || value === "/") {
    return "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
})();
const allowedOrigins = new Set([
  ...appConfig.corsAllowedOrigins,
  publicBaseUrl.origin,
]);

const isPrivateIpv4Host = (hostname) => {
  if (/^127(?:\.\d{1,3}){3}$/.test(hostname)) {
    return true;
  }

  if (/^10(?:\.\d{1,3}){3}$/.test(hostname)) {
    return true;
  }

  if (/^192\.168(?:\.\d{1,3}){2}$/.test(hostname)) {
    return true;
  }

  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) {
    return false;
  }

  const [first, second] = parts.map(Number);
  return first === 172 && second >= 16 && second <= 31;
};

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return false;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const { protocol, hostname } = url;

    if (protocol !== "http:" && protocol !== "https:") {
      return false;
    }

    if (
      protocol === "http:" &&
      (hostname === "localhost" ||
        hostname === "[::1]" ||
        isPrivateIpv4Host(hostname))
    ) {
      return true;
    }

    if (
      protocol === "https:" &&
      (hostname.endsWith(".tcloudbaseapp.com") ||
        hostname.endsWith(".tcb.qcloud.la"))
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const serializeContextText = (detail, chapter, payload) => {
  const sections = [];
  const include = new Set(payload.includeContexts || []);

  if (include.has("current_chapter")) {
    sections.push(
      `【当前章节】\n标题：${chapter.title}\n摘要：${chapter.summary}\n正文：\n${chapter.content}`,
    );
  }

  if (include.has("previous_chapter")) {
    const index = detail.chapters.findIndex((item) => item.id === chapter.id);
    const previous = index > 0 ? detail.chapters[index - 1] : null;
    if (previous) {
      sections.push(`【上一章摘要】\n${previous.title}\n${previous.summary}`);
    }
  }

  if (include.has("recent_chapters")) {
    const recent = detail.chapters
      .filter((item) => item.id !== chapter.id)
      .slice(-3)
      .map((item) => `${item.title}：${item.summary}`);
    if (recent.length) {
      sections.push(`【最近章节摘要】\n${recent.join("\n")}`);
    }
  }

  if (include.has("rough_outline")) {
    sections.push(
      `【粗纲】\n${detail.roughOutline.stages
        .map((item) => `${item.label}：${item.content}`)
        .join("\n")}`,
    );
  }

  if (include.has("detail_outline")) {
    sections.push(
      `【细纲】\n${detail.detailOutline
        .map((item) => `${item.chapterTarget}｜${item.keyEvent}`)
        .join("\n")}`,
    );
  }

  if (include.has("characters")) {
    sections.push(
      `【角色卡】\n${detail.characters
        .map((item) => `${item.name}｜${item.identity}｜${item.currentState}`)
        .join("\n")}`,
    );
  }

  if (include.has("world_entries")) {
    sections.push(
      `【世界设定】\n${detail.worldEntries
        .filter((item) => item.autoReference)
        .map((item) => `${item.title}：${item.content}`)
        .join("\n")}`,
    );
  }

  if (include.has("memory_items")) {
    sections.push(
      `【记忆库】\n${detail.memory
        .map((item) => `${item.title}｜${item.statusLabel}｜${item.content}`)
        .join("\n")}`,
    );
  }

  if (payload.selectedText) {
    sections.push(`【选中文本】\n${payload.selectedText}`);
  }

  return sections.join("\n\n");
};

app.disable("x-powered-by");
app.use(compression());
app.use(express.json({ limit: "4mb" }));

app.use((req, _res, next) => {
  if (
    publicBasePath !== "/" &&
    (req.url === publicBasePath || req.url.startsWith(`${publicBasePath}/`))
  ) {
    req.url = req.url.slice(publicBasePath.length) || "/";
  }

  next();
});

app.use("/api", (request, response, next) => {
  const origin = String(request.headers.origin || "").trim();

  if (!origin) {
    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
    return;
  }

  if (!isAllowedOrigin(origin)) {
    response.status(403).json({ message: "当前来源未被允许访问创作 API。" });
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, x-device-id",
  );
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
});

app.get("/health", (_request, response) => {
  response.json(repository.getHealth());
});

app.get("/api/health", (_request, response) => {
  response.json(repository.getHealth());
});

app.use(async (request, response, next) => {
  if (!request.path.startsWith("/api")) {
    response.status(404).json({
      message: "当前 CloudRun 服务只提供 /novel/api/* 接口，不承载前端页面。",
    });
    return;
  }

  if (request.path === "/api/health") {
    next();
    return;
  }

  try {
    request.currentUser = await resolveCurrentUser(request);
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/session", async (request, response) => {
  const payload = await repository.getSession(request.currentUser);
  response.json(payload);
});

app.get("/api/bootstrap", async (request, response) => {
  response.json(await repository.getBootstrap(request.currentUser));
});

app.post("/api/works", async (request, response) => {
  response.json(await repository.createWork(request.currentUser, request.body || {}));
});

app.post("/api/works/:projectId/duplicate", async (request, response) => {
  response.json(
    await repository.duplicateWork(request.currentUser, request.params.projectId),
  );
});

app.put("/api/works/:projectId", async (request, response) => {
  response.json(
    await repository.updateWork(
      request.currentUser,
      request.params.projectId,
      request.body || {},
    ),
  );
});

app.get("/api/works/:projectId", async (request, response) => {
  response.json(
    await repository.getWorkDetail(request.currentUser, request.params.projectId),
  );
});

app.put("/api/works/:projectId/documents/:documentType", async (request, response) => {
  await repository.upsertSingletonDocument(
    request.currentUser,
    request.params.projectId,
    request.params.documentType,
    request.body || {},
  );
  response.json({ success: true });
});

app.post("/api/works/:projectId/documents/:documentType", async (request, response) => {
  await repository.upsertDocument(
    request.currentUser,
    request.params.projectId,
    request.params.documentType,
    request.body || {},
  );
  response.json({ success: true });
});

app.put(
  "/api/works/:projectId/documents/:documentType/:documentId",
  async (request, response) => {
    await repository.upsertDocument(
      request.currentUser,
      request.params.projectId,
      request.params.documentType,
      request.body || {},
      request.params.documentId,
    );
    response.json({ success: true });
  },
);

app.delete(
  "/api/works/:projectId/documents/:documentType/:documentId",
  async (request, response) => {
    await repository.deleteDocument(request.currentUser, request.params.documentId);
    response.json({ success: true });
  },
);

app.post("/api/works/:projectId/volumes", async (request, response) => {
  await repository.upsertVolume(
    request.currentUser,
    request.params.projectId,
    request.body || {},
  );
  response.json({ success: true });
});

app.put("/api/works/:projectId/volumes/:volumeId", async (request, response) => {
  await repository.upsertVolume(
    request.currentUser,
    request.params.projectId,
    request.body || {},
    request.params.volumeId,
  );
  response.json({ success: true });
});

app.post("/api/works/:projectId/chapters", async (request, response) => {
  response.json(
    await repository.upsertChapter(
      request.currentUser,
      request.params.projectId,
      request.body || {},
    ),
  );
});

app.put("/api/works/:projectId/chapters/:chapterId", async (request, response) => {
  response.json(
    await repository.upsertChapter(
      request.currentUser,
      request.params.projectId,
      request.body || {},
      request.params.chapterId,
    ),
  );
});

app.post(
  "/api/works/:projectId/chapters/:chapterId/generate",
  async (request, response) => {
    const detail = await repository.getWorkDetail(
      request.currentUser,
      request.params.projectId,
    );
    const chapter = detail.chapters.find(
      (item) => item.id === request.params.chapterId,
    );

    if (!chapter) {
      throw new HttpError(404, "章节不存在");
    }

    const contextText = serializeContextText(detail, chapter, request.body || {});
    const output = await generateNovelText({
      action: request.body?.action || "continue",
      instruction: request.body?.instruction || "",
      contextText,
    });

    const generation = await repository.createGenerationRecord(
      request.currentUser,
      request.params.projectId,
      {
        chapterId: request.params.chapterId,
        action: request.body?.action || "continue",
        instruction: request.body?.instruction || "",
        promptTemplateId: request.body?.promptTemplateId || null,
        contextScope: request.body?.contextScope || "current_chapter",
        contextLabels: request.body?.includeContexts || [],
        output,
      },
    );

    response.json(generation);
  },
);

app.post("/api/works/:projectId/assistant", async (request, response) => {
  const detail = await repository.getWorkDetail(
    request.currentUser,
    request.params.projectId,
  );
  const chapter = detail.chapters[0] || {
    id: "",
    title: "当前作品",
    summary: "",
    content: "",
  };
  const contextText = serializeContextText(detail, chapter, request.body || {});
  const answer = await generateNovelText({
    action: "assistant",
    instruction: request.body?.instruction || "",
    contextText,
  });
  await repository.createGenerationRecord(request.currentUser, request.params.projectId, {
    chapterId: null,
    action: "assistant",
    instruction: request.body?.instruction || "",
    promptTemplateId: null,
    contextScope: request.body?.contextScope || "current_work",
    contextLabels: request.body?.includeContexts || [],
    output: answer,
  });
  response.json({
    answer,
    model: appConfig.aiModel,
    contextLabels: request.body?.includeContexts || [],
    generatedAt: new Date().toISOString(),
  });
});

app.post("/api/works/:projectId/export", async (request, response) => {
  const detail = await repository.getWorkDetail(
    request.currentUser,
    request.params.projectId,
  );
  const scope = request.body?.scope || "full";
  const chapterIds = Array.isArray(request.body?.chapterIds)
    ? request.body.chapterIds.map(String)
    : [];
  const chapters =
    scope === "selection" && chapterIds.length
      ? detail.chapters.filter((item) => chapterIds.includes(item.id))
      : detail.chapters;

  let buffer;
  let mimeType = "text/plain;charset=utf-8";
  let downloadName = `${detail.project.title}.${request.body?.format || "txt"}`;

  if ((request.body?.format || "txt") === "markdown") {
    buffer = Buffer.from(
      buildMarkdownExport({ project: detail.project, chapters }),
      "utf8",
    );
    mimeType = "text/markdown;charset=utf-8";
    downloadName = `${detail.project.title}.md`;
  } else if ((request.body?.format || "txt") === "docx") {
    buffer = await buildDocxExport({ project: detail.project, chapters });
    mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    downloadName = `${detail.project.title}.docx`;
  } else {
    buffer = Buffer.from(buildTxtExport({ project: detail.project, chapters }), "utf8");
    downloadName = `${detail.project.title}.txt`;
  }

  const exportRecord = await repository.createExportRecord(
    request.currentUser,
    request.params.projectId,
    {
      format: request.body?.format || "txt",
      scopeLabel:
        scope === "selection" ? "选中章节" : scope === "volume" ? "单卷" : "整本书",
      chapterIds,
      downloadName,
    },
  );

  response.json({
    ...exportRecord,
    mimeType,
    contentBase64: buffer.toString("base64"),
  });
});

app.put("/api/profile", async (request, response) => {
  response.json(await repository.updateProfile(request.currentUser, request.body || {}));
});

app.use((error, _request, response, _next) => {
  console.error("[junli-ai-novel-api]", error);

  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message });
    return;
  }

  response.status(500).json({
    message: error instanceof Error ? error.message : "服务暂时不可用",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`[junli-ai-novel-api] listening on ${port}`);
});
