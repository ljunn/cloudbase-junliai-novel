import cloudbase from "@cloudbase/node-sdk";
import { appConfig } from "./config.mjs";

const app = cloudbase.init({
  env: appConfig.envId,
  secretId: process.env.TENCENTCLOUD_SECRETID,
  secretKey: process.env.TENCENTCLOUD_SECRETKEY,
  sessionToken: process.env.TENCENTCLOUD_SESSIONTOKEN,
  accessKey: process.env.CLOUDBASE_APIKEY,
});

const ai = app.ai();
const modelClient = ai.createModel(appConfig.aiProvider);

const actionPromptMap = {
  continue: "你是长篇小说续写助理。接着当前章节往下写，保持角色状态、叙事视角和世界规则一致，不要跳出小说语境。",
  rewrite: "你是长篇小说改写助理。保留情节核心和信息点，重写表达，让节奏和镜头更顺。",
  polish: "你是长篇小说润色助理。保持剧情不变，只优化语言、节奏和细节。",
  expand: "你是长篇小说扩写助理。保留原意，把场景、动作、心理和对白写得更丰满。",
  compress: "你是长篇小说压缩助理。保留关键信息，删掉重复表达，让段落更紧。",
  shift_style: "你是长篇小说文风调整助理。保留剧情事实，把文风调到用户要求的质感。",
  dialogue: "你是长篇小说对白助理。补写符合角色身份、关系与情绪的对白。",
  transition: "你是长篇小说过渡段助理。衔接前后场景，让叙事自然推进。",
  title: "你是长篇小说章节命名助理。根据章节内容只输出一个章节标题，不要解释。",
  summary: "你是长篇小说章节摘要助理。根据章节内容输出一段简明摘要，不要解释。",
  assistant: "你是长篇网文创作顾问。围绕当前作品上下文给出具体、可执行的剧情建议和一致性检查结论。",
};

export const generateNovelText = async ({
  action,
  instruction,
  contextText,
}) => {
  const systemPrompt = actionPromptMap[action] || actionPromptMap.assistant;
  const userPrompt = [
    "以下是当前长篇小说的上下文资料，请严格基于这些资料完成任务。",
    "",
    contextText,
    "",
    "用户这次的具体要求：",
    instruction || "请基于上下文完成默认任务。",
  ].join("\n");

  if (
    !process.env.CLOUDBASE_APIKEY &&
    !process.env.TENCENTCLOUD_SECRETID &&
    process.env.NODE_ENV !== "production"
  ) {
    return `【本地模拟结果】\n${instruction || "已按默认规则生成"}\n\n${contextText.slice(0, 420)}`;
  }

  const result = await modelClient.generateText({
    model: appConfig.aiModel,
    temperature: action === "title" ? 0.5 : 0.75,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  return String(result.text || "").trim();
};
