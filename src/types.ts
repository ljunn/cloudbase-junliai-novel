export type WorkflowStatus =
  | "success"
  | "processing"
  | "pending"
  | "failed"
  | "ignored";

export type ProjectStatus =
  | "draft"
  | "writing"
  | "completed"
  | "archived"
  | "trashed";

export type ChapterStatus = "draft" | "writing" | "completed";

export type DocumentType =
  | "story_setting"
  | "character"
  | "world_entry"
  | "rough_outline"
  | "detail_outline"
  | "timeline_event"
  | "memory_item"
  | "prompt_template"
  | "template";

export type GenerationAction =
  | "continue"
  | "rewrite"
  | "polish"
  | "expand"
  | "compress"
  | "shift_style"
  | "dialogue"
  | "transition"
  | "title"
  | "summary"
  | "assistant";

export type ContextScope =
  | "full_book"
  | "current_work"
  | "current_volume"
  | "current_chapter"
  | "selected_text";

export interface SessionPayload {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    groups: string[];
    isAnonymous?: boolean;
  };
  isAdmin: boolean;
}

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
  status?: WorkflowStatus;
  actionPath?: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  premise: string;
  genre: string;
  tags: string[];
  status: ProjectStatus;
  targetWords: number;
  totalWords: number;
  chapterCount: number;
  volumeCount: number;
  updatedAt: string;
  lastEditedChapterTitle: string;
  nextActionLabel: string;
  progressLabel: string;
  consistencyWarnings: number;
}

export interface DraftCard {
  id: string;
  projectId: string;
  projectTitle: string;
  chapterId: string;
  chapterTitle: string;
  summary: string;
  updatedAt: string;
  wordCount: number;
  status: ChapterStatus;
}

export interface GenerationPreview {
  id: string;
  projectId: string;
  projectTitle: string;
  chapterId: string | null;
  chapterTitle: string;
  action: GenerationAction;
  model: string;
  contextLabels: string[];
  createdAt: string;
  excerpt: string;
}

export interface DashboardPayload {
  metrics: DashboardMetric[];
  recentProjects: ProjectSummary[];
  pendingChapters: DraftCard[];
  drafts: DraftCard[];
  recentGenerations: GenerationPreview[];
}

export interface StorySetting {
  id: string;
  premise: string;
  logline: string;
  theme: string;
  style: string;
  audience: string;
  voiceGuide: string;
  narrativeRules: string;
  forbiddenRules: string;
  updatedAt: string;
}

export interface CharacterCard {
  id: string;
  name: string;
  identity: string;
  faction: string;
  appearance: string;
  personality: string;
  motivation: string;
  background: string;
  relationship: string;
  currentState: string;
  lastAppearanceChapter: string;
  arcSummary: string;
  updatedAt: string;
}

export interface WorldEntry {
  id: string;
  title: string;
  entryType: string;
  content: string;
  autoReference: boolean;
  updatedAt: string;
}

export interface RoughOutlineStage {
  key: string;
  label: string;
  content: string;
}

export interface RoughOutline {
  id: string;
  stages: RoughOutlineStage[];
  updatedAt: string;
}

export interface DetailOutlineNode {
  id: string;
  volumeLabel: string;
  chapterTarget: string;
  conflictPoint: string;
  keyEvent: string;
  characterBeat: string;
  foreshadowing: string;
  draftPrompt: string;
  sortIndex: number;
  updatedAt: string;
}

export interface VolumePlan {
  id: string;
  title: string;
  summary: string;
  targetWords: number;
  chapterRange: string;
  mainObjective: string;
  sortIndex: number;
  updatedAt: string;
}

export interface ChapterRecord {
  id: string;
  projectId: string;
  volumeId: string | null;
  outlineNodeId: string | null;
  title: string;
  summary: string;
  content: string;
  status: ChapterStatus;
  wordCount: number;
  updatedAt: string;
  aiGenerated: boolean;
  consistencyWarning: boolean;
}

export interface ChapterVersion {
  id: string;
  chapterId: string;
  title: string;
  summary: string;
  content: string;
  wordCount: number;
  createdAt: string;
  sourceLabel: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  chapterTitle: string;
  characterNames: string[];
  eventTime: string;
  note: string;
  updatedAt: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  memoryType: string;
  statusLabel: string;
  content: string;
  linkedChapterTitle: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  toneLabel: string;
  isSystem: boolean;
  updatedAt: string;
}

export interface ProjectOverview {
  description: string;
  totalWords: number;
  volumeCount: number;
  chapterCount: number;
  updatedAt: string;
  progressLabel: string;
  recentGenerations: GenerationPreview[];
  leadCharacters: CharacterCard[];
  worldHighlights: WorldEntry[];
}

export interface GenerationRecord {
  id: string;
  projectId: string;
  chapterId: string | null;
  action: GenerationAction;
  instruction: string;
  model: string;
  promptTemplateId: string | null;
  contextScope: ContextScope;
  contextLabels: string[];
  output: string;
  createdAt: string;
}

export interface AssistantReply {
  answer: string;
  model: string;
  contextLabels: string[];
  generatedAt: string;
}

export interface ExportRecord {
  id: string;
  format: "txt" | "markdown" | "docx";
  scopeLabel: string;
  createdAt: string;
  downloadName: string;
}

export interface ProfilePayload {
  displayName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  planName: string;
  coinBalance: number;
  usageSummary: string;
  preferredModel: string;
  defaultVoice: string;
  preferences: {
    autoSummary: boolean;
    autoVersioning: boolean;
    compactEditor: boolean;
  };
}

export interface WorkDetail {
  project: ProjectSummary;
  overview: ProjectOverview;
  storySetting: StorySetting;
  characters: CharacterCard[];
  worldEntries: WorldEntry[];
  roughOutline: RoughOutline;
  detailOutline: DetailOutlineNode[];
  volumes: VolumePlan[];
  chapters: ChapterRecord[];
  chapterVersions: ChapterVersion[];
  timeline: TimelineEvent[];
  memory: MemoryItem[];
  promptTemplates: PromptTemplate[];
  recentGenerations: GenerationRecord[];
  recentExports: ExportRecord[];
}

export interface BootstrapPayload {
  dashboard: DashboardPayload;
  works: ProjectSummary[];
  templates: PromptTemplate[];
  trash: ProjectSummary[];
  profile: ProfilePayload;
}

export interface CreateWorkInput {
  title: string;
  premise: string;
  genre: string;
  style: string;
  targetWords: number;
  narrativePerspective: string;
  autoGenerateSetup: boolean;
}

export interface GenerationRequest {
  action: GenerationAction;
  instruction: string;
  selectedText: string;
  contextScope: ContextScope;
  includeContexts: string[];
  promptTemplateId?: string;
}
