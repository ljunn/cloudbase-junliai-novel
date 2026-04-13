import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PromptTemplate } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankTemplate = (): PromptTemplate => ({
  id: "",
  title: "",
  category: "",
  content: "",
  toneLabel: "",
  isSystem: false,
  updatedAt: "",
});

const PromptTemplatesPage = () => {
  const { loading, error, work, refresh, upsertDocument, deleteDocument } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<PromptTemplate>(createBlankTemplate());

  const templates = work?.promptTemplates || [];
  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedId) || null,
    [selectedId, templates],
  );

  useEffect(() => {
    setDraft(selectedTemplate || createBlankTemplate());
  }, [selectedTemplate]);

  if (loading) {
    return <LoadingState label="正在载入提示词模板..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Prompt Templates"
        title="把常用的续写、改写和文风提示沉淀成模板"
        description="作品内提示词模板优先服务当前这本书，和全局模板库分开管理。章节编辑器右侧会直接引用这里的模板。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankTemplate());
            }}
          >
            <Plus className="h-4 w-4" />
            新建模板
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {templates.length ? (
              templates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    item.id === selectedId
                      ? "w-full rounded-[1.25rem] bg-primary px-4 py-3 text-left text-sm text-primary-foreground"
                      : "w-full rounded-[1.25rem] border border-border bg-secondary/35 px-4 py-3 text-left text-sm text-foreground"
                  }
                  onClick={() => setSelectedId(item.id)}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs opacity-80">{item.category || "未分类"}</p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                先沉淀一套常用的续写和润色模板，后面就不用每次手写指令。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={draft.isSystem ? "accent" : "secondary"}>
                {draft.isSystem ? "系统模板" : "作品模板"}
              </Badge>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">模板名</span>
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">分类</span>
                <Input
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="开书 / 角色 / 世界观 / 续写 / 文风"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-foreground">语气标签</span>
                <Input
                  value={draft.toneLabel}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, toneLabel: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">模板内容</span>
              <Textarea
                value={draft.content}
                className="min-h-[220px]"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, content: event.target.value }))
                }
              />
            </label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  void upsertDocument("prompt_template", draft, draft.id || undefined)
                }
              >
                保存模板
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void deleteDocument("prompt_template", draft.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptTemplatesPage;
