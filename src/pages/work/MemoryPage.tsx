import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MemoryItem } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankMemory = (): MemoryItem => ({
  id: "",
  title: "",
  memoryType: "",
  statusLabel: "",
  content: "",
  linkedChapterTitle: "",
  updatedAt: "",
});

const MemoryPage = () => {
  const { loading, error, work, refresh, upsertDocument, deleteDocument } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<MemoryItem>(createBlankMemory());

  const items = work?.memory || [];
  const selectedMemory = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  useEffect(() => {
    setDraft(selectedMemory || createBlankMemory());
  }, [selectedMemory]);

  if (loading) {
    return <LoadingState label="正在载入记忆库..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Memory"
        title="把伏笔、角色状态和重要事件记成长期记忆"
        description="这里是长篇创作的一致性缓存层。AI 在章节生成时会优先读取这些条目，尽量避免遗忘前文和角色状态打架。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankMemory());
            }}
          >
            <Plus className="h-4 w-4" />
            新增记忆条目
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {items.length ? (
              items.map((item) => (
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
                  <p className="mt-1 text-xs opacity-80">
                    {item.memoryType || "未分类"} · {item.statusLabel || "未标状态"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                伏笔、角色状态变更、世界观新增条目都可以归到这里。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8">
            <div className="grid gap-5 md:grid-cols-2">
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
                  value={draft.memoryType}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      memoryType: event.target.value,
                    }))
                  }
                  placeholder="伏笔 / 角色状态 / 重要事件 / 世界更新"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">状态</span>
                <Input
                  value={draft.statusLabel}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      statusLabel: event.target.value,
                    }))
                  }
                  placeholder="已埋 / 已回收 / 未回收"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">关联章节</span>
                <Input
                  value={draft.linkedChapterTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      linkedChapterTitle: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">内容</span>
              <Textarea
                value={draft.content}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, content: event.target.value }))
                }
              />
            </label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  void upsertDocument("memory_item", draft, draft.id || undefined)
                }
              >
                保存记忆条目
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void deleteDocument("memory_item", draft.id)}
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

export default MemoryPage;
