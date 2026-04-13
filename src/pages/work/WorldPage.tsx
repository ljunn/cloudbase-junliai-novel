import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorldEntry } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankEntry = (): WorldEntry => ({
  id: "",
  title: "",
  entryType: "",
  content: "",
  autoReference: true,
  updatedAt: "",
});

const WorldPage = () => {
  const { loading, error, work, refresh, upsertDocument, deleteDocument } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<WorldEntry>(createBlankEntry());

  const entries = work?.worldEntries || [];
  const selectedEntry = useMemo(
    () => entries.find((item) => item.id === selectedId) || null,
    [entries, selectedId],
  );

  useEffect(() => {
    setDraft(selectedEntry || createBlankEntry());
  }, [selectedEntry]);

  if (loading) {
    return <LoadingState label="正在载入世界观..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Worldbuilding"
        title="背景、势力、地点和规则都在这里归档"
        description="每条世界观设定都能指定类型和是否允许 AI 自动引用。这样章节生成就不会脱离你自己定义的世界规则。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankEntry());
            }}
          >
            <Plus className="h-4 w-4" />
            新增设定
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {entries.length ? (
              entries.map((item) => (
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
                  <p className="mt-1 text-xs opacity-80">{item.entryType || "未分类"}</p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                地点、势力、道具、规则和专有名词都可以先放在这里。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">标题</span>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">类型</span>
              <Input
                value={draft.entryType}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    entryType: event.target.value,
                  }))
                }
                placeholder="背景设定 / 势力 / 地点 / 道具 / 规则 / 专有名词"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">内容</span>
              <Textarea
                value={draft.content}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, content: event.target.value }))
                }
              />
            </label>
            <label className="flex items-start gap-3 rounded-[1.5rem] border border-border/80 bg-secondary/35 px-4 py-4">
              <input
                type="checkbox"
                checked={draft.autoReference}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    autoReference: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-border text-primary"
              />
              <div>
                <p className="font-semibold text-foreground">允许 AI 自动引用</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  打开后，章节生成和 AI 助手会把这条设定纳入优先上下文。
                </p>
              </div>
            </label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => void upsertDocument("world_entry", draft, draft.id || undefined)}
              >
                保存设定
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void deleteDocument("world_entry", draft.id)}
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

export default WorldPage;
