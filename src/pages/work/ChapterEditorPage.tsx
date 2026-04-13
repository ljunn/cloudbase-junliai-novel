import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DetailTabs } from "@/components/DetailTabs";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { SaveStatePill } from "@/components/SaveStatePill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/useAutosave";
import type {
  ChapterRecord,
  GenerationAction,
  GenerationRecord,
  GenerationRequest,
} from "@/types";
import { useWork } from "@/workspace/WorkContext";

const generationActions: { value: GenerationAction; label: string }[] = [
  { value: "continue", label: "续写" },
  { value: "rewrite", label: "改写" },
  { value: "polish", label: "润色" },
  { value: "expand", label: "扩写" },
  { value: "compress", label: "压缩" },
  { value: "shift_style", label: "改文风" },
  { value: "dialogue", label: "生成对白" },
  { value: "transition", label: "生成过渡段" },
  { value: "title", label: "生成章节标题" },
  { value: "summary", label: "总结本章" },
];

const contextOptions = [
  "current_chapter",
  "previous_chapter",
  "recent_chapters",
  "rough_outline",
  "detail_outline",
  "characters",
  "world_entries",
  "memory_items",
] as const;

const countWords = (content: string) =>
  content.replace(/\s+/g, "").trim().length;

const createDraftFromChapter = (chapter: ChapterRecord): ChapterRecord => ({
  ...chapter,
});

const applyAtSelection = (
  source: string,
  insertText: string,
  start: number,
  end: number,
) => `${source.slice(0, start)}${insertText}${source.slice(end)}`;

const ChapterEditorPage = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const { loading, error, work, refresh, upsertChapter, runGeneration } = useWork();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [draft, setDraft] = useState<ChapterRecord | null>(null);
  const [activeTab, setActiveTab] = useState("AI 助手");
  const [selectedText, setSelectedText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [contextScope, setContextScope] = useState<GenerationRequest["contextScope"]>(
    "current_chapter",
  );
  const [includeContexts, setIncludeContexts] = useState<string[]>([
    "current_chapter",
    "previous_chapter",
    "detail_outline",
    "characters",
    "memory_items",
  ]);
  const [action, setAction] = useState<GenerationAction>("continue");
  const [generationBusy, setGenerationBusy] = useState(false);
  const [generationPreview, setGenerationPreview] = useState<GenerationRecord | null>(
    null,
  );

  const chapters = work?.chapters || [];
  const currentChapter =
    chapters.find((item) => item.id === chapterId) || chapters[0] || null;
  const versions = useMemo(
    () =>
      (work?.chapterVersions || []).filter(
        (item) => item.chapterId === currentChapter?.id,
      ),
    [currentChapter?.id, work?.chapterVersions],
  );
  const latestGeneration = useMemo(
    () =>
      (work?.recentGenerations || []).find(
        (item) => item.chapterId === currentChapter?.id,
      ) || null,
    [currentChapter?.id, work?.recentGenerations],
  );

  useEffect(() => {
    if (!currentChapter) {
      setDraft(null);
      return;
    }

    setDraft((current) =>
      current?.id === currentChapter.id ? current : createDraftFromChapter(currentChapter),
    );
  }, [currentChapter]);

  const autosave = useAutosave({
    value: draft,
    enabled: Boolean(draft?.id),
    onSave: async (nextValue) => {
      if (!nextValue) {
        return;
      }

      await upsertChapter(
        {
          ...nextValue,
          wordCount: countWords(nextValue.content),
        },
        nextValue.id,
      );
    },
  });

  if (loading) {
    return <LoadingState label="正在打开章节编辑器..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  if (!work || !currentChapter || !draft) {
    return (
      <EmptyState
        title="还没有可编辑章节"
        description="先到章节列表里新建一章，章节编辑器才会有可继续写的正文画布。"
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Chapter Editor"
        title={draft.title || "当前章节创作"}
        description="左侧切章节，中间写正文，右侧直接带上下文发起续写、改写、润色和版本回看。这里是整个平台最重要的一页。"
        actions={<SaveStatePill state={autosave.state} error={autosave.error} />}
      />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">章节树</p>
            {chapters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  item.id === currentChapter.id
                    ? "w-full rounded-[1.25rem] bg-primary px-4 py-3 text-left text-sm text-primary-foreground"
                    : "w-full rounded-[1.25rem] border border-border bg-secondary/35 px-4 py-3 text-left text-sm text-foreground"
                }
                onClick={() => navigate(`/works/${work.project.id}/chapter/${item.id}`)}
              >
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-xs opacity-80">
                  {item.wordCount.toLocaleString("zh-CN")} 字 · {item.status}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-5 p-8">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">章节标题</span>
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">状态</span>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            status: event.target.value as ChapterRecord["status"],
                          }
                        : current,
                    )
                  }
                  className="flex h-11 w-full rounded-full border border-border bg-white/80 px-4 text-sm text-foreground shadow-sm"
                >
                  <option value="draft">草稿</option>
                  <option value="writing">创作中</option>
                  <option value="completed">已完成</option>
                </select>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">章节摘要</span>
              <Textarea
                value={draft.summary}
                className="min-h-[120px]"
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, summary: event.target.value } : current,
                  )
                }
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>正文（Markdown）</span>
                <span className="text-muted-foreground">
                  {countWords(draft.content).toLocaleString("zh-CN")} 字
                </span>
              </span>
              <Textarea
                ref={textareaRef}
                value={draft.content}
                className="min-h-[640px] font-mono text-[15px] leading-8"
                onSelect={(event) => {
                  const target = event.target as HTMLTextAreaElement;
                  setSelectedText(
                    target.value.slice(target.selectionStart, target.selectionEnd),
                  );
                }}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, content: event.target.value } : current,
                  )
                }
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-5 p-5">
            <DetailTabs
              tabs={["AI 助手", "引用面板", "历史版本"]}
              active={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === "AI 助手" ? (
              <div className="space-y-4">
                <select
                  value={action}
                  onChange={(event) => setAction(event.target.value as GenerationAction)}
                  className="flex h-11 w-full rounded-full border border-border bg-white/80 px-4 text-sm text-foreground shadow-sm"
                >
                  {generationActions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Textarea
                  value={instruction}
                  className="min-h-[140px]"
                  placeholder="补充这一轮生成的要求，例如：保留女主视角的克制语气，让冲突更早爆发。"
                  onChange={(event) => setInstruction(event.target.value)}
                />
                <Button
                  type="button"
                  disabled={generationBusy}
                  onClick={async () => {
                    setGenerationBusy(true);
                    try {
                      const result = await runGeneration(currentChapter.id, {
                        action,
                        instruction,
                        selectedText,
                        contextScope,
                        includeContexts,
                      });
                      setGenerationPreview(result);
                      if (action === "title") {
                        setDraft((current) =>
                          current ? { ...current, title: result.output.trim() } : current,
                        );
                      }
                      if (action === "summary") {
                        setDraft((current) =>
                          current
                            ? { ...current, summary: result.output.trim() }
                            : current,
                        );
                      }
                    } finally {
                      setGenerationBusy(false);
                    }
                  }}
                >
                  {generationBusy ? "生成中..." : `开始${generationActions.find((item) => item.value === action)?.label || "生成"}`}
                </Button>

                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/35 p-4">
                  <p className="text-sm font-semibold text-foreground">最新结果</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {generationPreview?.output || "这里会显示本次生成的内容。"}
                  </p>
                </div>

                {generationPreview ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                content: `${current.content}\n\n${generationPreview.output}`.trim(),
                              }
                            : current,
                        )
                      }
                    >
                      追加到正文
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = textareaRef.current;
                        if (!textarea) {
                          return;
                        }

                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                content: applyAtSelection(
                                  current.content,
                                  generationPreview.output,
                                  textarea.selectionStart,
                                  textarea.selectionEnd,
                                ),
                              }
                            : current,
                        );
                      }}
                    >
                      插入到光标
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const textarea = textareaRef.current;
                        if (!textarea || textarea.selectionStart === textarea.selectionEnd) {
                          return;
                        }

                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                content: applyAtSelection(
                                  current.content,
                                  generationPreview.output,
                                  textarea.selectionStart,
                                  textarea.selectionEnd,
                                ),
                              }
                            : current,
                        );
                      }}
                    >
                      替换选中
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeTab === "引用面板" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">上下文范围</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["current_chapter", "当前章节"],
                        ["current_work", "当前作品"],
                        ["current_volume", "当前分卷"],
                        ["full_book", "全书"],
                        ["selected_text", "选中文本"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          contextScope === value
                            ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            : "rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground"
                        }
                        onClick={() => setContextScope(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">引用内容</p>
                  <div className="space-y-2 rounded-[1.5rem] border border-border/80 bg-secondary/35 p-4">
                    {contextOptions.map((item) => (
                      <label key={item} className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={includeContexts.includes(item)}
                          onChange={(event) =>
                            setIncludeContexts((current) =>
                              event.target.checked
                                ? [...current, item]
                                : current.filter((value) => value !== item),
                            )
                          }
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/80 bg-secondary/35 p-4">
                  <p className="text-sm font-semibold text-foreground">最近一次生成使用的上下文</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {(generationPreview?.contextLabels || latestGeneration?.contextLabels || []).join(
                      " / ",
                    ) || "还没有最近一次生成记录。"}
                  </p>
                </div>
              </div>
            ) : null}

            {activeTab === "历史版本" ? (
              <div className="space-y-3">
                {versions.length ? (
                  versions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.25rem] border border-border/70 bg-secondary/35 p-4"
                    >
                      <p className="font-semibold text-foreground">{item.sourceLabel}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.createdAt} · {item.wordCount.toLocaleString("zh-CN")} 字
                      </p>
                      <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                        {item.summary || item.content}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  title: item.title,
                                  summary: item.summary,
                                  content: item.content,
                                }
                              : current,
                          )
                        }
                      >
                        恢复到当前编辑区
                      </Button>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="还没有历史版本"
                    description="章节保存后会自动沉淀一个版本，恢复时不会离开当前编辑页。"
                  />
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChapterEditorPage;
