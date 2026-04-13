import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/workspace/WorkspaceContext";
import type { CreateWorkInput } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const createInitialForm = (): CreateWorkInput => ({
  title: "",
  premise: "",
  genre: "",
  style: "",
  targetWords: 800000,
  narrativePerspective: "第三人称限知",
  autoGenerateSetup: true,
});

const NewWorkDialog = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const { createWorkAndRefresh } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateWorkInput>(() => createInitialForm());

  const canSubmit = useMemo(
    () => Boolean(form.title.trim() && form.premise.trim() && form.genre.trim()),
    [form.genre, form.premise, form.title],
  );

  const updateField = (key: keyof CreateWorkInput, value: string | number | boolean) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    titleInputRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm md:items-center"
      onClick={onClose}
      role="presentation"
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-work-dialog-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-x-hidden overflow-y-auto border-border/70 bg-white/96"
        onClick={(event) => event.stopPropagation()}
      >
        <CardContent className="grid gap-6 p-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-5">
              <div className="space-y-2">
                <p className="section-label">Create Novel</p>
                <h2
                  id="new-work-dialog-title"
                  className="text-3xl font-semibold tracking-tight text-foreground"
                >
                  先定作品，再让 AI 按作品继续写
                </h2>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                  创建作品时就把题材、风格、目标篇幅和叙事视角固定下来。创建完成后，会自动生成可继续修改的基础设定和章节起步结构。
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onClose}
                aria-label="关闭新建作品窗口"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canSubmit || submitting) {
                  return;
                }

                setSubmitting(true);
                setError("");
                try {
                  const projectId = await createWorkAndRefresh(form);
                  navigate(`/works/${projectId}/overview`);
                } catch (submitError) {
                  setError(
                    submitError instanceof Error ? submitError.message : "创建作品失败",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">作品名</span>
                  <Input
                    ref={titleInputRef}
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="例如：寒铁王朝"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">题材</span>
                  <Input
                    value={form.genre}
                    onChange={(event) => updateField("genre", event.target.value)}
                    placeholder="玄幻 / 都市 / 科幻 / 古言"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">风格</span>
                  <Input
                    value={form.style}
                    onChange={(event) => updateField("style", event.target.value)}
                    placeholder="强情节、冷幽默、群像、升级流"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">叙事视角</span>
                  <Input
                    value={form.narrativePerspective}
                    onChange={(event) =>
                      updateField("narrativePerspective", event.target.value)
                    }
                    placeholder="第一人称 / 第三人称限知"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">一句话简介</span>
                <Textarea
                  value={form.premise}
                  onChange={(event) => updateField("premise", event.target.value)}
                  className="min-h-[140px]"
                  placeholder="例如：一个被驱逐出王城的铸剑师，为了查清父亲的死因，只能一步步卷进帝国最深的权力裂缝。"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">目标篇幅</span>
                <Input
                  type="number"
                  value={form.targetWords}
                  onChange={(event) =>
                    updateField("targetWords", Number(event.target.value || 0))
                  }
                  placeholder="800000"
                />
              </label>

              <label className="flex items-start gap-3 rounded-[1.5rem] border border-border/80 bg-secondary/35 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.autoGenerateSetup}
                  onChange={(event) =>
                    updateField("autoGenerateSetup", event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary"
                />
                <div>
                  <p className="font-semibold text-foreground">创建后自动生成基础设定</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    会自动补一版 premise、主角设定、基础世界观和粗纲，后续仍然能在作品页继续改。
                  </p>
                </div>
              </label>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" disabled={!canSubmit || submitting}>
                  {submitting ? "正在创建..." : "创建作品并进入工作区"}
                </Button>
              </div>
            </form>
          </div>

          <div className="border-t border-border/80 bg-secondary/35 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="space-y-4 rounded-[1.75rem] border border-border/80 bg-white/82 p-5">
              <p className="section-label">创建后自动得到</p>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>1. 一份可继续编辑的故事设定草稿</p>
                <p>2. 一个主角角色卡与基础世界观条目</p>
                <p>3. 一版粗纲和起始章节结构</p>
                <p>4. 立即可写的作品工作台入口</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewWorkDialog;
