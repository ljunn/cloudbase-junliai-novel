import crypto from "node:crypto";
import cloudbase from "@cloudbase/node-sdk";
import { appConfig, TABLES } from "./config.mjs";

const app = cloudbase.init({
  env: appConfig.envId,
  region: appConfig.region,
  accessKey: process.env.CLOUDBASE_APIKEY || undefined,
  secretId: process.env.TENCENTCLOUD_SECRETID,
  secretKey: process.env.TENCENTCLOUD_SECRETKEY,
  sessionToken: process.env.TENCENTCLOUD_SESSIONTOKEN,
});

const db = app.rdb();

const SYSTEM_TEMPLATES = [
  {
    title: "开书模板",
    category: "开书",
    toneLabel: "世界搭建",
    content: "请根据题材、主人公目标、核心冲突，输出一版 premise、logline、主角设定和第一卷方向。",
    isSystem: true,
  },
  {
    title: "章节续写模板",
    category: "续写",
    toneLabel: "强情节",
    content: "延续当前章节语气与叙事视角，优先推动主线冲突，结尾保留下一章钩子。",
    isSystem: true,
  },
  {
    title: "角色模板",
    category: "角色",
    toneLabel: "人物关系",
    content: "围绕身份、外貌、性格、动机、背景、与主角关系和当前状态输出角色卡。",
    isSystem: true,
  },
];

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const parseJson = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const stringifyJson = (value) => JSON.stringify(value ?? null);

const ensureRows = async (promise, fallbackMessage) => {
  const response = await promise;

  if (response.error) {
    throw new Error(response.error.message || fallbackMessage);
  }

  return Array.isArray(response.data) ? response.data : [];
};

const findOne = async (queryPromise, fallbackMessage) => {
  const rows = await ensureRows(queryPromise, fallbackMessage);
  return rows[0] || null;
};

const createId = (prefix) => `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;

const mapStatusToProgress = (status, chapterCount) => {
  if (status === "completed") {
    return "已完结";
  }

  if (chapterCount <= 3) {
    return "开书搭建中";
  }

  if (chapterCount <= 15) {
    return "主线铺垫阶段";
  }

  return "中段推进中";
};

const toProjectSummary = (row) => ({
  id: String(row.id),
  title: row.title,
  premise: row.premise,
  genre: row.genre,
  tags: parseJson(row.tags_json, []),
  status: row.status,
  targetWords: Number(row.target_words || 0),
  totalWords: Number(row.total_words || 0),
  chapterCount: Number(row.chapter_count || 0),
  volumeCount: Number(row.volume_count || 0),
  updatedAt: row.updated_at,
  lastEditedChapterTitle: row.last_edited_chapter_title || "",
  nextActionLabel: row.next_action_label || "继续写作",
  progressLabel: row.progress_label || "创作中",
  consistencyWarnings: Number(row.consistency_warnings || 0),
});

const toStorySetting = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    premise: String(payload.premise || ""),
    logline: String(payload.logline || ""),
    theme: String(payload.theme || ""),
    style: String(payload.style || ""),
    audience: String(payload.audience || ""),
    voiceGuide: String(payload.voiceGuide || ""),
    narrativeRules: String(payload.narrativeRules || ""),
    forbiddenRules: String(payload.forbiddenRules || ""),
    updatedAt: row.updated_at,
  };
};

const toCharacter = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    name: String(payload.name || row.title || ""),
    identity: String(payload.identity || ""),
    faction: String(payload.faction || ""),
    appearance: String(payload.appearance || ""),
    personality: String(payload.personality || ""),
    motivation: String(payload.motivation || ""),
    background: String(payload.background || ""),
    relationship: String(payload.relationship || ""),
    currentState: String(payload.currentState || ""),
    lastAppearanceChapter: String(payload.lastAppearanceChapter || ""),
    arcSummary: String(payload.arcSummary || ""),
    updatedAt: row.updated_at,
  };
};

const toWorldEntry = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    title: String(payload.title || row.title || ""),
    entryType: String(payload.entryType || row.category || ""),
    content: String(payload.content || ""),
    autoReference: row.auto_reference !== 0,
    updatedAt: row.updated_at,
  };
};

const toRoughOutline = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    stages: Array.isArray(payload.stages) ? payload.stages : [],
    updatedAt: row.updated_at,
  };
};

const toDetailOutlineNode = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    volumeLabel: String(payload.volumeLabel || ""),
    chapterTarget: String(payload.chapterTarget || ""),
    conflictPoint: String(payload.conflictPoint || ""),
    keyEvent: String(payload.keyEvent || ""),
    characterBeat: String(payload.characterBeat || ""),
    foreshadowing: String(payload.foreshadowing || ""),
    draftPrompt: String(payload.draftPrompt || ""),
    sortIndex: Number(row.sort_index || 0),
    updatedAt: row.updated_at,
  };
};

const toTimelineEvent = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    title: String(payload.title || row.title || ""),
    chapterTitle: String(payload.chapterTitle || ""),
    characterNames: Array.isArray(payload.characterNames)
      ? payload.characterNames
      : [],
    eventTime: String(payload.eventTime || ""),
    note: String(payload.note || ""),
    updatedAt: row.updated_at,
  };
};

const toMemoryItem = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    title: String(payload.title || row.title || ""),
    memoryType: String(payload.memoryType || row.category || ""),
    statusLabel: String(payload.statusLabel || row.status_label || ""),
    content: String(payload.content || ""),
    linkedChapterTitle: String(payload.linkedChapterTitle || ""),
    updatedAt: row.updated_at,
  };
};

const toPromptTemplate = (row) => {
  const payload = parseJson(row.payload_json, {});
  return {
    id: String(row.id),
    title: String(payload.title || row.title || ""),
    category: String(payload.category || row.category || ""),
    content: String(payload.content || ""),
    toneLabel: String(payload.toneLabel || row.tone_label || ""),
    isSystem: row.is_system === 1,
    updatedAt: row.updated_at,
  };
};

const toVolume = (row) => ({
  id: String(row.id),
  title: row.title,
  summary: row.summary,
  targetWords: Number(row.target_words || 0),
  chapterRange: row.chapter_range || "",
  mainObjective: row.main_objective || "",
  sortIndex: Number(row.sort_index || 0),
  updatedAt: row.updated_at,
});

const toChapter = (row) => ({
  id: String(row.id),
  projectId: String(row.project_id),
  volumeId: row.volume_id === null ? null : String(row.volume_id),
  outlineNodeId: row.outline_node_id === null ? null : String(row.outline_node_id),
  title: row.title,
  summary: row.summary || "",
  content: row.content || "",
  status: row.status,
  wordCount: Number(row.word_count || 0),
  updatedAt: row.updated_at,
  aiGenerated: row.ai_generated === 1,
  consistencyWarning: row.consistency_warning === 1,
});

const toChapterVersion = (row) => ({
  id: String(row.id),
  chapterId: String(row.chapter_id),
  title: row.title,
  summary: row.summary || "",
  content: row.content || "",
  wordCount: Number(row.word_count || 0),
  createdAt: row.created_at,
  sourceLabel: row.source_label || "手动保存",
});

const toGeneration = (row, chapterTitle = "", projectTitle = "") => ({
  id: String(row.id),
  projectId: String(row.project_id),
  projectTitle,
  chapterId: row.chapter_id === null ? null : String(row.chapter_id),
  chapterTitle,
  action: row.action_type,
  instruction: row.instruction_text || "",
  model: row.model_name,
  promptTemplateId:
    row.prompt_template_id === null ? null : String(row.prompt_template_id),
  contextScope: row.context_scope,
  contextLabels: parseJson(row.context_labels_json, []),
  output: row.output_text || "",
  excerpt: String(row.output_text || "").slice(0, 120),
  createdAt: row.created_at,
});

const toExportRecord = (row) => ({
  id: String(row.id),
  format: row.format,
  scopeLabel: row.scope_label,
  createdAt: row.created_at,
  downloadName: row.download_name,
});

const buildDefaultStorySetting = (project) => ({
  premise: project.premise,
  logline: `${project.title}讲述的是：${project.premise}`,
  theme: "成长与代价",
  style: project.style || "强情节长篇",
  audience: `${project.genre}读者`,
  voiceGuide: `${project.narrative_perspective || "第三人称限知"} + 网文可读性优先`,
  narrativeRules: "主线冲突必须持续推进；角色行为要与既有设定一致；每章结尾尽量留下钩子。",
  forbiddenRules: "不要让设定自相矛盾；不要突然切换叙事视角；不要跳过关键因果。",
});

const buildDefaultRoughOutline = (project) => ({
  stages: [
    { key: "opening", label: "开篇", content: `用一个能快速立住主角处境的事件打开《${project.title}》。` },
    { key: "development", label: "发展", content: "让主角逐步看清更大的利益链与敌我关系。" },
    { key: "conflict", label: "冲突", content: "把主角推到无法回避的正面冲突里，让代价落到身上。" },
    { key: "climax", label: "高潮", content: "让主角在既有设定与旧伏笔交汇处完成一次关键抉择。" },
    { key: "ending", label: "结局", content: "回收核心伏笔，给出阶段性胜负和下一阶段引子。" },
  ],
});

const buildDefaultDetailOutlineNode = (volumeLabel) => ({
  volumeLabel,
  chapterTarget: "让主角登场，并把核心困境抛出来。",
  conflictPoint: "主角想要的东西与现实限制正面碰撞。",
  keyEvent: "开场事件把故事真正推起来。",
  characterBeat: "让主角和一位关键角色建立关系张力。",
  foreshadowing: "埋下后续会回收的一条线索。",
  draftPrompt: "按当前设定写出一章能直接开场的正文。",
});

const buildDefaultPromptTemplate = () => ({
  title: "本书续写模板",
  category: "续写",
  toneLabel: "强情节",
  content:
    "请带着当前章节、最近章节摘要、角色卡、世界设定和记忆库继续往下写，优先推进主线冲突，结尾留下追读钩子。",
  isSystem: false,
});

const countWords = (content) => String(content || "").replace(/\s+/g, "").trim().length;

const upsertProjectStats = async (authUid, projectId) => {
  const [chapters, volumes] = await Promise.all([
    ensureRows(
      db
        .from(TABLES.chapters)
        .select("id,title,word_count,consistency_warning,updated_at")
        .eq("auth_uid", authUid)
        .eq("project_id", Number(projectId))
        .is("deleted_at", null),
      "统计章节失败",
    ),
    ensureRows(
      db
        .from(TABLES.volumes)
        .select("id")
        .eq("auth_uid", authUid)
        .eq("project_id", Number(projectId))
        .is("deleted_at", null),
      "统计分卷失败",
    ),
  ]);

  const latestChapter = [...chapters].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )[0];
  const chapterCount = chapters.length;
  const totalWords = chapters.reduce(
    (sum, item) => sum + Number(item.word_count || 0),
    0,
  );

  await ensureRows(
    db
      .from(TABLES.projects)
      .update({
        chapter_count: chapterCount,
        volume_count: volumes.length,
        total_words: totalWords,
        last_edited_chapter_title: latestChapter?.title || "",
        next_action_label:
          chapterCount <= 1 ? "继续补设定与细纲" : "继续推进当前章节",
        progress_label: mapStatusToProgress("writing", chapterCount),
        consistency_warnings: chapters.filter(
          (item) => Number(item.consistency_warning || 0) === 1,
        ).length,
        updated_at: now(),
      })
      .eq("id", Number(projectId))
      .eq("auth_uid", authUid),
    "更新作品统计失败",
  );
};

const saveChapterVersionSnapshot = async (authUid, chapter, sourceLabel) => {
  const latestVersion = await findOne(
    db
      .from(TABLES.chapterVersions)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("chapter_id", Number(chapter.id))
      .order("created_at", { ascending: false })
      .limit(1),
    "读取最新章节版本失败",
  );

  if (
    latestVersion &&
    latestVersion.title === chapter.title &&
    latestVersion.summary === chapter.summary &&
    latestVersion.content === chapter.content
  ) {
    return;
  }

  await ensureRows(
    db.from(TABLES.chapterVersions).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(chapter.project_id),
      chapter_id: Number(chapter.id),
      title: chapter.title,
      summary: chapter.summary || "",
      content: chapter.content || "",
      word_count: Number(chapter.word_count || 0),
      source_label: sourceLabel,
      created_at: now(),
    }),
    "写入章节版本失败",
  );
};

const ensureUserProfile = async (actor) => {
  const existing = await findOne(
    db
      .from(TABLES.profiles)
      .select("*")
      .eq("auth_uid", actor.uid)
      .limit(1),
    "读取作者资料失败",
  );

  const payload = {
    _openid: "",
    auth_uid: actor.uid,
    display_name: actor.displayName,
    email: String(actor.profile.email || ""),
    phone: String(actor.profile.phone_number || ""),
    avatar_url: String(actor.profile.avatar_url || ""),
    plan_name: existing?.plan_name || "创作体验版",
    coin_balance: existing?.coin_balance ?? 1200,
    preferred_model:
      existing?.preferred_model || appConfig.aiModel,
    default_voice: existing?.default_voice || "强情节、稳叙事、网文可读性优先",
    preferences_json:
      existing?.preferences_json ||
      stringifyJson({
        autoSummary: true,
        autoVersioning: true,
        compactEditor: false,
      }),
    usage_summary:
      existing?.usage_summary || "本月已完成 0 次 AI 生成，导出 0 次。",
    is_admin: actor.isAdmin ? 1 : 0,
    updated_at: now(),
  };

  if (!existing) {
    await ensureRows(
      db.from(TABLES.profiles).insert({
        ...payload,
        created_at: now(),
      }),
      "创建作者资料失败",
    );
  } else {
    await ensureRows(
      db.from(TABLES.profiles).update(payload).eq("id", Number(existing.id)),
      "更新作者资料失败",
    );
  }

  return findOne(
    db.from(TABLES.profiles).select("*").eq("auth_uid", actor.uid).limit(1),
    "读取最新作者资料失败",
  );
};

const ensureSystemTemplates = async () => {
  const rows = await ensureRows(
    db
      .from(TABLES.documents)
      .select("id")
      .eq("document_type", "template")
      .eq("is_system", 1)
      .is("deleted_at", null),
    "读取系统模板失败",
  );

  if (rows.length) {
    return;
  }

  for (const template of SYSTEM_TEMPLATES) {
    await ensureRows(
      db.from(TABLES.documents).insert({
        _openid: "",
        auth_uid: "system",
        project_id: null,
        document_type: "template",
        title: template.title,
        category: template.category,
        tone_label: template.toneLabel,
        is_system: 1,
        auto_reference: 1,
        status_label: "",
        sort_index: 0,
        payload_json: stringifyJson(template),
        created_at: now(),
        updated_at: now(),
        deleted_at: null,
      }),
      "初始化系统模板失败",
    );
  }
};

const listUserProjects = async (authUid, includeTrash = false) => {
  const rows = await ensureRows(
    db
      .from(TABLES.projects)
      .select("*")
      .eq("auth_uid", authUid)
      .order("updated_at", { ascending: false }),
    "读取作品列表失败",
  );

  return rows
    .filter((row) =>
      includeTrash
        ? row.status === "trashed"
        : row.deleted_at === null && row.status !== "trashed",
    )
    .map(toProjectSummary);
};

const listTemplates = async (authUid) => {
  const rows = await ensureRows(
    db
      .from(TABLES.documents)
      .select("*")
      .eq("document_type", "template")
      .is("deleted_at", null)
      .order("is_system", { ascending: false })
      .order("updated_at", { ascending: false }),
    "读取模板失败",
  );

  return rows
    .filter((row) => row.is_system === 1 || row.auth_uid === authUid)
    .map(toPromptTemplate);
};

const listUserChapters = async (authUid) => {
  const rows = await ensureRows(
    db
      .from(TABLES.chapters)
      .select("*")
      .eq("auth_uid", authUid)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    "读取章节失败",
  );

  return rows.map(toChapter);
};

const listUserGenerations = async (authUid) => {
  const rows = await ensureRows(
    db
      .from(TABLES.generations)
      .select("*")
      .eq("auth_uid", authUid)
      .order("created_at", { ascending: false })
      .limit(12),
    "读取生成记录失败",
  );

  return rows;
};

const getProjectById = (authUid, projectId) =>
  findOne(
    db
      .from(TABLES.projects)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("id", Number(projectId))
      .limit(1),
    "读取作品失败",
  );

const listProjectDocuments = (authUid, projectId) =>
  ensureRows(
    db
      .from(TABLES.documents)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectId))
      .is("deleted_at", null)
      .order("sort_index", { ascending: true })
      .order("updated_at", { ascending: false }),
    "读取文档失败",
  );

const listProjectVolumes = (authUid, projectId) =>
  ensureRows(
    db
      .from(TABLES.volumes)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectId))
      .is("deleted_at", null)
      .order("sort_index", { ascending: true })
      .order("updated_at", { ascending: false }),
    "读取分卷失败",
  );

const listProjectChapters = (authUid, projectId) =>
  ensureRows(
    db
      .from(TABLES.chapters)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectId))
      .is("deleted_at", null)
      .order("sort_index", { ascending: true })
      .order("updated_at", { ascending: false }),
    "读取章节失败",
  );

const listProjectChapterVersions = (authUid, projectId) =>
  ensureRows(
    db
      .from(TABLES.chapterVersions)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectId))
      .order("created_at", { ascending: false })
      .limit(30),
    "读取章节版本失败",
  );

const listProjectGenerations = (authUid, projectId) =>
  ensureRows(
    db
      .from(TABLES.generations)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectId))
      .order("created_at", { ascending: false })
      .limit(20),
    "读取项目生成记录失败",
  );

const listProjectExports = (authUid, projectId) =>
  ensureRows(
    db
      .from(TABLES.exports)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectId))
      .order("created_at", { ascending: false })
      .limit(10),
    "读取导出记录失败",
  );

const summarizeDocuments = (documents, type, mapper) =>
  documents
    .filter((item) => item.document_type === type)
    .map(mapper);

const getSingletonDocument = (documents, type, fallback) => {
  const row = documents.find((item) => item.document_type === type);
  return row ? fallback(row) : fallback({ id: "", payload_json: stringifyJson({}), updated_at: now() });
};

const createDefaultProjectAssets = async (authUid, projectRow, input) => {
  const volumeLabel = "第一卷 起笔";
  const storySetting = buildDefaultStorySetting(projectRow);
  const roughOutline = buildDefaultRoughOutline(projectRow);
  const detailNode = buildDefaultDetailOutlineNode(volumeLabel);
  const promptTemplate = buildDefaultPromptTemplate();

  await ensureRows(
    db.from(TABLES.documents).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(projectRow.id),
      document_type: "story_setting",
      title: "故事设定",
      category: "story",
      tone_label: "",
      is_system: 0,
      auto_reference: 1,
      status_label: "",
      sort_index: 0,
      payload_json: stringifyJson(storySetting),
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
    }),
    "创建故事设定失败",
  );

  await ensureRows(
    db.from(TABLES.documents).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(projectRow.id),
      document_type: "rough_outline",
      title: "粗纲",
      category: "outline",
      tone_label: "",
      is_system: 0,
      auto_reference: 1,
      status_label: "",
      sort_index: 0,
      payload_json: stringifyJson(roughOutline),
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
    }),
    "创建粗纲失败",
  );

  await ensureRows(
    db.from(TABLES.documents).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(projectRow.id),
      document_type: "detail_outline",
      title: "章节卡 1",
      category: "outline",
      tone_label: "",
      is_system: 0,
      auto_reference: 1,
      status_label: "",
      sort_index: 1,
      payload_json: stringifyJson(detailNode),
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
    }),
    "创建细纲失败",
  );

  await ensureRows(
    db.from(TABLES.documents).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(projectRow.id),
      document_type: "prompt_template",
      title: promptTemplate.title,
      category: promptTemplate.category,
      tone_label: promptTemplate.toneLabel,
      is_system: 0,
      auto_reference: 1,
      status_label: "",
      sort_index: 1,
      payload_json: stringifyJson(promptTemplate),
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
    }),
    "创建作品提示词模板失败",
  );

  await ensureRows(
    db.from(TABLES.volumes).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(projectRow.id),
      title: volumeLabel,
      summary: `围绕《${projectRow.title}》的开篇冲突与主角处境铺开。`,
      target_words: Math.round(Number(input.targetWords || 800000) / 6),
      chapter_range: "第1章 - 第20章",
      main_objective: "立住主角处境、提出主要矛盾、埋第一批钩子。",
      sort_index: 1,
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
    }),
    "创建分卷失败",
  );

  const volume = await findOne(
    db
      .from(TABLES.volumes)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectRow.id))
      .order("created_at", { ascending: false })
      .limit(1),
    "读取默认分卷失败",
  );

  await ensureRows(
    db.from(TABLES.chapters).insert({
      _openid: "",
      auth_uid: authUid,
      project_id: Number(projectRow.id),
      volume_id: volume ? Number(volume.id) : null,
      outline_node_id: null,
      title: "第一章 开场",
      summary: `围绕 ${projectRow.premise} 打开故事起点。`,
      content: `# 第一章 开场\n\n${projectRow.premise}\n\n在这里开始写第一章正文。`,
      status: "draft",
      sort_index: 1,
      word_count: countWords(`# 第一章 开场\n\n${projectRow.premise}\n\n在这里开始写第一章正文。`),
      ai_generated: input.autoGenerateSetup ? 1 : 0,
      consistency_warning: 0,
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
    }),
    "创建默认章节失败",
  );

  const chapter = await findOne(
    db
      .from(TABLES.chapters)
      .select("*")
      .eq("auth_uid", authUid)
      .eq("project_id", Number(projectRow.id))
      .order("created_at", { ascending: false })
      .limit(1),
    "读取默认章节失败",
  );

  if (chapter) {
    await saveChapterVersionSnapshot(authUid, chapter, "初始章节");
  }

  await upsertProjectStats(authUid, projectRow.id);
};

const resolveDocumentMutation = (documentType, payload) => ({
  title:
    payload.title ||
    payload.name ||
    payload.chapterTarget ||
    payload.memoryType ||
    payload.entryType ||
    documentType,
  category:
    payload.category ||
    payload.entryType ||
    payload.memoryType ||
    documentType,
  status_label: payload.statusLabel || "",
  tone_label: payload.toneLabel || "",
  auto_reference: payload.autoReference === false ? 0 : 1,
  sort_index: Number(payload.sortIndex || 0),
  payload_json: stringifyJson(payload),
  updated_at: now(),
});

export const repository = {
  getHealth() {
    return {
      ok: true,
      envId: appConfig.envId,
      service: "junli-ai-novel-api",
      timestamp: new Date().toISOString(),
    };
  },

  async getSession(actor) {
    const profileRow = await ensureUserProfile(actor);
    const preferences = parseJson(profileRow.preferences_json, {});

    return {
      user: {
        id: actor.uid,
        name: profileRow.display_name,
        email: profileRow.email,
        phone: profileRow.phone,
        avatarUrl: profileRow.avatar_url,
        groups: actor.groups,
      },
      isAdmin: profileRow.is_admin === 1,
      profile: {
        displayName: profileRow.display_name,
        email: profileRow.email,
        phone: profileRow.phone,
        avatarUrl: profileRow.avatar_url,
        planName: profileRow.plan_name,
        coinBalance: Number(profileRow.coin_balance || 0),
        usageSummary: profileRow.usage_summary,
        preferredModel: profileRow.preferred_model,
        defaultVoice: profileRow.default_voice,
        preferences,
      },
    };
  },

  async getBootstrap(actor) {
    await ensureSystemTemplates();
    const profileRow = await ensureUserProfile(actor);
    const [works, trash, templates, chapters, generationRows] = await Promise.all([
      listUserProjects(actor.uid, false),
      listUserProjects(actor.uid, true),
      listTemplates(actor.uid),
      listUserChapters(actor.uid),
      listUserGenerations(actor.uid),
    ]);

    const worksMap = new Map(works.map((item) => [item.id, item]));
    const recentGenerations = generationRows.map((row) => {
      const chapter = chapters.find((item) => item.id === String(row.chapter_id));
      const project = worksMap.get(String(row.project_id));
      return toGeneration(row, chapter?.title || "作品级建议", project?.title || "作品");
    });

    return {
      dashboard: {
        metrics: [
          {
            label: "创作中作品",
            value: String(works.filter((item) => item.status === "writing").length),
            hint: "当前还在持续推进中的长篇项目数量。",
            status: "processing",
          },
          {
            label: "累计章节",
            value: String(chapters.length),
            hint: "已经写出来并保存在平台内的章节总数。",
            status: "success",
          },
          {
            label: "累计字数",
            value: `${chapters
              .reduce((sum, item) => sum + item.wordCount, 0)
              .toLocaleString("zh-CN")} 字`,
            hint: "按所有未删除章节汇总的总字数。",
            status: "success",
          },
          {
            label: "最近 AI 生成",
            value: String(recentGenerations.length),
            hint: "最近生成记录越完整，后续追溯上下文会越方便。",
            status: recentGenerations.length ? "processing" : "pending",
          },
        ],
        recentProjects: works.slice(0, 4),
        pendingChapters: chapters
          .filter((item) => item.status !== "completed")
          .slice(0, 6)
          .map((item) => ({
            id: item.id,
            projectId: works.find((work) => work.id === String(item.projectId))?.id || "",
            projectTitle:
              works.find((work) => work.id === String(item.projectId))?.title || "",
            chapterId: item.id,
            chapterTitle: item.title,
            summary: item.summary,
            updatedAt: item.updatedAt,
            wordCount: item.wordCount,
            status: item.status,
          })),
        drafts: chapters
          .filter((item) => item.status === "draft")
          .slice(0, 6)
          .map((item) => ({
            id: item.id,
            projectId: String(item.projectId || ""),
            projectTitle:
              works.find((work) => work.id === String(item.projectId))?.title || "",
            chapterId: item.id,
            chapterTitle: item.title,
            summary: item.summary,
            updatedAt: item.updatedAt,
            wordCount: item.wordCount,
            status: item.status,
          })),
        recentGenerations: recentGenerations.slice(0, 6),
      },
      works,
      templates,
      trash,
      profile: {
        displayName: profileRow.display_name,
        email: profileRow.email,
        phone: profileRow.phone,
        avatarUrl: profileRow.avatar_url,
        planName: profileRow.plan_name,
        coinBalance: Number(profileRow.coin_balance || 0),
        usageSummary: profileRow.usage_summary,
        preferredModel: profileRow.preferred_model,
        defaultVoice: profileRow.default_voice,
        preferences: parseJson(profileRow.preferences_json, {
          autoSummary: true,
          autoVersioning: true,
          compactEditor: false,
        }),
      },
    };
  },

  async createWork(actor, input) {
    const projectRow = {
      _openid: "",
      auth_uid: actor.uid,
      external_id: createId("novel"),
      title: input.title,
      premise: input.premise,
      genre: input.genre,
      tags_json: stringifyJson([input.genre, input.style].filter(Boolean)),
      style: input.style || "",
      target_words: Number(input.targetWords || 800000),
      narrative_perspective: input.narrativePerspective || "第三人称限知",
      status: "writing",
      total_words: 0,
      chapter_count: 0,
      volume_count: 0,
      last_edited_chapter_title: "",
      next_action_label: "完善故事设定",
      progress_label: "开书搭建中",
      consistency_warnings: 0,
      created_at: now(),
      updated_at: now(),
      archived_at: null,
      deleted_at: null,
    };

    await ensureRows(
      db.from(TABLES.projects).insert(projectRow),
      "创建作品失败",
    );

    const created = await findOne(
      db
        .from(TABLES.projects)
        .select("*")
        .eq("auth_uid", actor.uid)
        .eq("title", input.title)
        .order("created_at", { ascending: false })
        .limit(1),
      "读取新建作品失败",
    );

    await createDefaultProjectAssets(actor.uid, created, input);

    return {
      projectId: String(created.id),
    };
  },

  async duplicateWork(actor, projectId) {
    const detail = await this.getWorkDetail(actor, projectId);
    const duplicated = await this.createWork(actor, {
      title: `${detail.project.title}（副本）`,
      premise: detail.project.premise,
      genre: detail.project.genre,
      style: detail.storySetting.style,
      targetWords: detail.project.targetWords,
      narrativePerspective: "第三人称限知",
      autoGenerateSetup: false,
    });

    const newProjectId = duplicated.projectId;

    for (const character of detail.characters) {
      await this.upsertDocument(actor, newProjectId, "character", character);
    }
    for (const worldEntry of detail.worldEntries) {
      await this.upsertDocument(actor, newProjectId, "world_entry", worldEntry);
    }
    for (const node of detail.detailOutline) {
      await this.upsertDocument(actor, newProjectId, "detail_outline", node);
    }
    for (const volume of detail.volumes) {
      await this.upsertVolume(actor, newProjectId, volume);
    }
    for (const chapter of detail.chapters) {
      await this.upsertChapter(actor, newProjectId, chapter);
    }

    return { projectId: newProjectId };
  },

  async updateWork(actor, projectId, payload) {
    await ensureRows(
      db
        .from(TABLES.projects)
        .update({
          title: payload.title,
          premise: payload.premise,
          genre: payload.genre,
          style: payload.style,
          target_words: payload.targetWords,
          status: payload.status,
          narrative_perspective: payload.narrativePerspective,
          updated_at: now(),
          archived_at: payload.status === "archived" ? now() : null,
          deleted_at: payload.status === "trashed" ? now() : null,
        })
        .eq("auth_uid", actor.uid)
        .eq("id", Number(projectId)),
      "更新作品失败",
    );
    await upsertProjectStats(actor.uid, projectId);
    return this.getWorkDetail(actor, projectId);
  },

  async upsertSingletonDocument(actor, projectId, documentType, payload) {
    const existing = await findOne(
      db
        .from(TABLES.documents)
        .select("*")
        .eq("auth_uid", actor.uid)
        .eq("project_id", Number(projectId))
        .eq("document_type", documentType)
        .is("deleted_at", null)
        .limit(1),
      "读取单例文档失败",
    );

    if (existing) {
      await ensureRows(
        db
          .from(TABLES.documents)
          .update(resolveDocumentMutation(documentType, payload))
          .eq("id", Number(existing.id)),
        "更新文档失败",
      );
    } else {
      await ensureRows(
        db.from(TABLES.documents).insert({
          _openid: "",
          auth_uid: actor.uid,
          project_id: Number(projectId),
          document_type: documentType,
          is_system: 0,
          deleted_at: null,
          created_at: now(),
          ...resolveDocumentMutation(documentType, payload),
        }),
        "创建文档失败",
      );
    }
  },

  async upsertDocument(actor, projectId, documentType, payload, documentId) {
    if (documentId) {
      await ensureRows(
        db
          .from(TABLES.documents)
          .update(resolveDocumentMutation(documentType, payload))
          .eq("id", Number(documentId))
          .eq("auth_uid", actor.uid),
        "更新文档失败",
      );
      return;
    }

    await ensureRows(
      db.from(TABLES.documents).insert({
        _openid: "",
        auth_uid: actor.uid,
        project_id: Number(projectId),
        document_type: documentType,
        is_system: 0,
        deleted_at: null,
        created_at: now(),
        ...resolveDocumentMutation(documentType, payload),
      }),
      "创建文档失败",
    );
  },

  async deleteDocument(actor, documentId) {
    await ensureRows(
      db
        .from(TABLES.documents)
        .update({ deleted_at: now(), updated_at: now() })
        .eq("id", Number(documentId))
        .eq("auth_uid", actor.uid),
      "删除文档失败",
    );
  },

  async upsertVolume(actor, projectId, payload, volumeId) {
    const mutation = {
      title: payload.title,
      summary: payload.summary || "",
      target_words: Number(payload.targetWords || 0),
      chapter_range: payload.chapterRange || "",
      main_objective: payload.mainObjective || "",
      sort_index: Number(payload.sortIndex || 0),
      updated_at: now(),
    };

    if (volumeId) {
      await ensureRows(
        db
          .from(TABLES.volumes)
          .update(mutation)
          .eq("id", Number(volumeId))
          .eq("auth_uid", actor.uid),
        "更新分卷失败",
      );
    } else {
      await ensureRows(
        db.from(TABLES.volumes).insert({
          _openid: "",
          auth_uid: actor.uid,
          project_id: Number(projectId),
          created_at: now(),
          deleted_at: null,
          ...mutation,
        }),
        "创建分卷失败",
      );
    }

    await upsertProjectStats(actor.uid, projectId);
  },

  async upsertChapter(actor, projectId, payload, chapterId) {
    const mutation = {
      volume_id: payload.volumeId ? Number(payload.volumeId) : null,
      outline_node_id: payload.outlineNodeId ? Number(payload.outlineNodeId) : null,
      title: payload.title,
      summary: payload.summary || "",
      content: payload.content || "",
      status: payload.status || "draft",
      sort_index: Number(payload.sortIndex || 0),
      word_count: countWords(payload.content || ""),
      ai_generated: payload.aiGenerated ? 1 : 0,
      consistency_warning: payload.consistencyWarning ? 1 : 0,
      updated_at: now(),
    };

    if (chapterId) {
      await ensureRows(
        db
          .from(TABLES.chapters)
          .update(mutation)
          .eq("id", Number(chapterId))
          .eq("auth_uid", actor.uid),
        "更新章节失败",
      );
    } else {
      await ensureRows(
        db.from(TABLES.chapters).insert({
          _openid: "",
          auth_uid: actor.uid,
          project_id: Number(projectId),
          created_at: now(),
          deleted_at: null,
          ...mutation,
        }),
        "创建章节失败",
      );
    }

    const chapter = await findOne(
      db
        .from(TABLES.chapters)
        .select("*")
        .eq("auth_uid", actor.uid)
        .eq("project_id", Number(projectId))
        .eq("title", payload.title)
        .order("updated_at", { ascending: false })
        .limit(1),
      "读取章节失败",
    );

    if (chapter) {
      await saveChapterVersionSnapshot(actor.uid, chapter, "自动保存");
    }

    await upsertProjectStats(actor.uid, projectId);
    return toChapter(chapter);
  },

  async createGenerationRecord(actor, projectId, payload) {
    await ensureRows(
      db.from(TABLES.generations).insert({
        _openid: "",
        auth_uid: actor.uid,
        project_id: Number(projectId),
        chapter_id: payload.chapterId ? Number(payload.chapterId) : null,
        action_type: payload.action,
        instruction_text: payload.instruction || "",
        model_name: appConfig.aiModel,
        prompt_template_id: payload.promptTemplateId
          ? Number(payload.promptTemplateId)
          : null,
        context_scope: payload.contextScope,
        context_labels_json: stringifyJson(payload.contextLabels),
        output_text: payload.output,
        created_at: now(),
      }),
      "记录生成历史失败",
    );

    const row = await findOne(
      db
        .from(TABLES.generations)
        .select("*")
        .eq("auth_uid", actor.uid)
        .eq("project_id", Number(projectId))
        .order("created_at", { ascending: false })
        .limit(1),
      "读取生成历史失败",
    );

    return toGeneration(row);
  },

  async createExportRecord(actor, projectId, payload) {
    await ensureRows(
      db.from(TABLES.exports).insert({
        _openid: "",
        auth_uid: actor.uid,
        project_id: Number(projectId),
        format: payload.format,
        scope_label: payload.scopeLabel,
        chapter_ids_json: stringifyJson(payload.chapterIds || []),
        download_name: payload.downloadName,
        created_at: now(),
      }),
      "记录导出失败",
    );

    const row = await findOne(
      db
        .from(TABLES.exports)
        .select("*")
        .eq("auth_uid", actor.uid)
        .eq("project_id", Number(projectId))
        .order("created_at", { ascending: false })
        .limit(1),
      "读取导出记录失败",
    );

    return toExportRecord(row);
  },

  async updateProfile(actor, payload) {
    const existing = await ensureUserProfile(actor);
    const nextPreferences = {
      ...parseJson(existing.preferences_json, {
        autoSummary: true,
        autoVersioning: true,
        compactEditor: false,
      }),
      ...(payload.preferences || {}),
    };

    await ensureRows(
      db
        .from(TABLES.profiles)
        .update({
          display_name: payload.displayName || existing.display_name,
          preferred_model: payload.preferredModel || existing.preferred_model,
          default_voice: payload.defaultVoice || existing.default_voice,
          preferences_json: stringifyJson(nextPreferences),
          updated_at: now(),
        })
        .eq("id", Number(existing.id)),
      "更新作者偏好失败",
    );

    const latest = await findOne(
      db.from(TABLES.profiles).select("*").eq("id", Number(existing.id)).limit(1),
      "读取最新作者偏好失败",
    );

    return {
      displayName: latest.display_name,
      email: latest.email,
      phone: latest.phone,
      avatarUrl: latest.avatar_url,
      planName: latest.plan_name,
      coinBalance: Number(latest.coin_balance || 0),
      usageSummary: latest.usage_summary,
      preferredModel: latest.preferred_model,
      defaultVoice: latest.default_voice,
      preferences: parseJson(latest.preferences_json, nextPreferences),
    };
  },

  async getWorkDetail(actor, projectId) {
    const [projectRow, documents, volumeRows, chapterRows, versionRows, generationRows, exportRows] =
      await Promise.all([
        getProjectById(actor.uid, projectId),
        listProjectDocuments(actor.uid, projectId),
        listProjectVolumes(actor.uid, projectId),
        listProjectChapters(actor.uid, projectId),
        listProjectChapterVersions(actor.uid, projectId),
        listProjectGenerations(actor.uid, projectId),
        listProjectExports(actor.uid, projectId),
      ]);

    if (!projectRow) {
      throw new Error("作品不存在");
    }

    const project = toProjectSummary(projectRow);
    const chapters = chapterRows.map(toChapter);
    const characters = summarizeDocuments(documents, "character", toCharacter);
    const worldEntries = summarizeDocuments(documents, "world_entry", toWorldEntry);
    const detailOutline = summarizeDocuments(
      documents,
      "detail_outline",
      toDetailOutlineNode,
    );
    const timeline = summarizeDocuments(documents, "timeline_event", toTimelineEvent);
    const memory = summarizeDocuments(documents, "memory_item", toMemoryItem);
    const promptTemplates = summarizeDocuments(
      documents,
      "prompt_template",
      toPromptTemplate,
    );
    const storySetting = getSingletonDocument(documents, "story_setting", toStorySetting);
    const roughOutline = getSingletonDocument(documents, "rough_outline", toRoughOutline);
    const volumes = volumeRows.map(toVolume);
    const versions = versionRows.map(toChapterVersion);
    const generations = generationRows.map((row) => {
      const chapter = chapters.find((item) => item.id === String(row.chapter_id));
      return toGeneration(row, chapter?.title || "作品级建议", project.title);
    });
    const exports = exportRows.map(toExportRecord);

    return {
      project,
      overview: {
        description: project.premise,
        totalWords: project.totalWords,
        volumeCount: project.volumeCount,
        chapterCount: project.chapterCount,
        updatedAt: project.updatedAt,
        progressLabel: project.progressLabel,
        recentGenerations: generations.slice(0, 5),
        leadCharacters: characters.slice(0, 4),
        worldHighlights: worldEntries.slice(0, 4),
      },
      storySetting,
      characters,
      worldEntries,
      roughOutline,
      detailOutline,
      volumes,
      chapters,
      chapterVersions: versions,
      timeline,
      memory,
      promptTemplates,
      recentGenerations: generations,
      recentExports: exports,
    };
  },
};
