# 页面结构清单

| 页面 | 路由 | 作用 | 是否核心链路 | 依赖数据 |
| --- | --- | --- | --- | --- |
| 工作台 | `/novel/#/` | 汇总最近作品、待续写章节、草稿与最近生成记录，作为登录后第一屏 | 是 | `dashboard`、`works`、`ai_generations`、`chapters` |
| 我的作品 | `/novel/#/works` | 按作品管理创作项目，支持搜索、进入、复制、归档、删除 | 是 | `projects` |
| 新建作品 | `/novel/#/works/new` | 录入作品基础信息并建立创作起点 | 是 | `projects`、`documents`、`volumes`、`chapters` |
| 模板库 | `/novel/#/templates` | 查看系统模板与个人模板，后续承接模板复制与沉淀 | 否 | `documents(template)` |
| AI 助手 | `/novel/#/assistant` | 围绕当前作品发起上下文感知提问 | 否 | `projects`、`documents`、`chapters`、`ai_generations` |
| 回收站 | `/novel/#/trash` | 恢复被删除的作品 | 否 | `projects(status=trashed)` |
| 个人中心 | `/novel/#/profile` | 查看账户信息、套餐、金币余额与创作偏好 | 否 | `profiles` |
| 作品总览 | `/novel/#/works/:workId/overview` | 进入单本书后的首页，查看作品进度、角色摘要和最近生成 | 是 | `projects`、`documents`、`volumes`、`chapters`、`ai_generations` |
| 故事设定 | `/novel/#/works/:workId/story` | 维护 premise、logline、主题、文风、叙事规则与禁止事项 | 是 | `documents(story_setting)` |
| 角色库 | `/novel/#/works/:workId/characters` | 管理角色卡与状态变化 | 是 | `documents(character)` |
| 世界观 | `/novel/#/works/:workId/world` | 管理背景、势力、地点、规则和专有名词 | 是 | `documents(world_entry)` |
| 粗纲 | `/novel/#/works/:workId/rough-outline` | 维护开篇、发展、冲突、高潮、结局五段粗纲 | 是 | `documents(rough_outline)` |
| 细纲 | `/novel/#/works/:workId/detail-outline` | 维护章节级目标、冲突、事件与伏笔卡片 | 是 | `documents(detail_outline)` |
| 分卷规划 | `/novel/#/works/:workId/volumes` | 管理卷级目标、字数和章节范围 | 是 | `volumes` |
| 章节列表 | `/novel/#/works/:workId/chapters` | 按分卷展示章节树，进入正文写作 | 是 | `chapters`、`volumes` |
| 当前章节创作 | `/novel/#/works/:workId/chapter/:chapterId` | 正文编辑、自动保存、AI 生成、上下文引用、历史版本恢复 | 是 | `chapters`、`chapter_versions`、`documents`、`ai_generations` |
| 时间线 | `/novel/#/works/:workId/timeline` | 管理事件顺序与章节对应关系 | 否 | `documents(timeline_event)` |
| 伏笔 / 记忆库 | `/novel/#/works/:workId/memory` | 维护伏笔、角色状态与重要事件记忆 | 是 | `documents(memory_item)` |
| 提示词模板 | `/novel/#/works/:workId/prompts` | 维护作品内提示词模板 | 否 | `documents(prompt_template)` |
| 导出 | `/novel/#/works/:workId/export` | 导出 TXT、Markdown、DOCX，查看最近导出 | 是 | `chapters`、`exports` |
