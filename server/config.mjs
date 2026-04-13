export const TABLES = {
  profiles: "junli_novel_profiles",
  projects: "junli_novel_projects",
  documents: "junli_novel_documents",
  volumes: "junli_novel_volumes",
  chapters: "junli_novel_chapters",
  chapterVersions: "junli_novel_chapter_versions",
  generations: "junli_novel_ai_generations",
  exports: "junli_novel_exports",
};

export const appConfig = {
  envId: process.env.ENV_ID || "fanqie-xinshu-front-4cjw9c4ef031",
  region: process.env.REGION || "ap-shanghai",
  publicBasePath: process.env.APP_BASE_PATH || "/novel",
  frontendUrl: process.env.FRONTEND_URL || "https://junliai.com/novel/",
  aiProvider: process.env.AI_PROVIDER || "hunyuan-exp",
  aiModel:
    process.env.AI_MODEL || "hunyuan-2.0-instruct-20251111",
  corsAllowedOrigins: (
    process.env.CORS_ALLOWED_ORIGINS ||
    [
      "https://junliai.com",
      "https://fanqie-xinshu-front-4cjw9c4ef031-1257305037.tcloudbaseapp.com",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
    ].join(",")
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
};
