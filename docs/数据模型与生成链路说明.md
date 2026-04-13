# 数据模型与生成链路说明

| 模块 | 输入数据 | 输出数据 | 关联表 | 是否参与 AI 上下文 |
| --- | --- | --- | --- | --- |
| 新建作品 | 作品名、简介、题材、风格、目标篇幅、叙事视角、是否自动生成基础设定 | 新作品记录、默认故事设定、默认粗纲、默认分卷、默认章节 | `junli_novel_projects`、`junli_novel_documents`、`junli_novel_volumes`、`junli_novel_chapters` | 是 |
| 角色库 | 姓名、身份、阵营、性格、动机、关系、当前状态 | 角色卡 | `junli_novel_documents` (`character`) | 是 |
| 世界观 | 标题、类型、内容、是否允许 AI 引用 | 世界观条目 | `junli_novel_documents` (`world_entry`) | 是 |
| 粗纲 | 开篇、发展、冲突、高潮、结局五段内容 | 粗纲结构 | `junli_novel_documents` (`rough_outline`) | 是 |
| 细纲 | 分卷标签、章节目标、冲突点、关键事件、角色推进、伏笔埋点 | 章节级细纲节点 | `junli_novel_documents` (`detail_outline`) | 是 |
| 分卷 | 分卷标题、简介、目标字数、章节范围、主线任务 | 分卷规划 | `junli_novel_volumes` | 是 |
| 章节创作 | 标题、摘要、正文、状态、所属分卷 | 章节正文、章节版本快照、项目统计更新 | `junli_novel_chapters`、`junli_novel_chapter_versions`、`junli_novel_projects` | 是 |
| AI 生成任务 | 动作类型、指令、上下文范围、选中文本、引用上下文集合 | 生成文本、生成历史、上下文标签、模型记录 | `junli_novel_ai_generations`、`junli_novel_documents`、`junli_novel_chapters` | 是 |
| 时间线 | 事件名称、章节、涉及角色、事件时间、备注 | 时间线事件 | `junli_novel_documents` (`timeline_event`) | 是 |
| 记忆库 | 伏笔标题、类型、状态、内容、关联章节 | 长期记忆条目 | `junli_novel_documents` (`memory_item`) | 是 |
| 提示词模板 | 模板名、分类、语气标签、模板内容 | 作品内模板或系统模板 | `junli_novel_documents` (`prompt_template` / `template`) | 是 |
| 个人中心 | 显示名称、偏好模型、默认文风、自动保存偏好 | 作者资料与偏好 | `junli_novel_profiles` | 否 |
| 导出 | 导出格式、导出范围、章节集合 | TXT / Markdown / DOCX 文件与导出记录 | `junli_novel_exports`、`junli_novel_chapters` | 否 |

## 生成链路

1. 作者创建作品，系统写入 `junli_novel_projects`。
2. 系统同步生成初始 `story_setting`、`rough_outline`、`detail_outline`、默认分卷和默认章节。
3. 作者逐步补全角色库、世界观、时间线、记忆库与提示词模板。
4. 章节编辑器发起 AI 请求时，后端按勾选项汇总：
   - 当前章节
   - 最近章节摘要
   - 粗纲 / 细纲
   - 角色卡
   - 世界设定
   - 记忆库
5. 后端调用 `@cloudbase/node-sdk` `app.ai()` 生成文本，并将结果写入 `junli_novel_ai_generations`。
6. 作者把结果插入或替换正文，章节自动保存到 `junli_novel_chapters`，并沉淀版本到 `junli_novel_chapter_versions`。
7. 导出时从章节表聚合正文内容，生成 TXT / Markdown / DOCX，同时写入 `junli_novel_exports`。
