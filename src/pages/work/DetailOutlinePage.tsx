import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DetailOutlineNode } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankNode = (sortIndex: number): DetailOutlineNode => ({
  id: "",
  volumeLabel: "",
  chapterTarget: "",
  conflictPoint: "",
  keyEvent: "",
  characterBeat: "",
  foreshadowing: "",
  draftPrompt: "",
  sortIndex,
  updatedAt: "",
});

const DetailOutlinePage = () => {
  const { loading, error, work, refresh, upsertDocument, deleteDocument } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<DetailOutlineNode>(createBlankNode(1));

  const nodes = work?.detailOutline || [];
  const selectedNode = useMemo(
    () => nodes.find((item) => item.id === selectedId) || null,
    [nodes, selectedId],
  );

  useEffect(() => {
    if (selectedNode) {
      setDraft(selectedNode);
      return;
    }

    setDraft(createBlankNode(nodes.length + 1));
  }, [nodes.length, selectedNode]);

  if (loading) {
    return <LoadingState label="正在载入细纲..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Detail Outline"
        title="把剧情推进细化到章节级"
        description="细纲会落到单章目标、冲突点、关键事件、角色推进和伏笔埋点。当前版本支持直接维护章节卡片，并在章节编辑器里继续写正文。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankNode(nodes.length + 1));
            }}
          >
            <Plus className="h-4 w-4" />
            新增细纲节点
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {nodes.length ? (
              nodes.map((item, index) => (
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
                  <p className="font-semibold">章节卡 {index + 1}</p>
                  <p className="mt-1 line-clamp-2 text-xs opacity-80">
                    {item.chapterTarget || "还没有章节目标"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                先新增一个章节级细纲节点，后面章节列表和章节编辑器都会引用它。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">所属分卷</span>
                <Input
                  value={draft.volumeLabel}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, volumeLabel: event.target.value }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">排序</span>
                <Input
                  type="number"
                  value={draft.sortIndex}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      sortIndex: Number(event.target.value || 0),
                    }))
                  }
                />
              </label>
            </div>

            {(
              [
                ["chapterTarget", "章节目标"],
                ["conflictPoint", "冲突点"],
                ["keyEvent", "关键事件"],
                ["characterBeat", "角色推进"],
                ["foreshadowing", "伏笔埋点"],
                ["draftPrompt", "生成章节草稿提示"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-2">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <Textarea
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
              </label>
            ))}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={async () => {
                  await upsertDocument("detail_outline", draft, draft.id || undefined);
                  setSelectedId("");
                }}
              >
                保存细纲节点
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await deleteDocument("detail_outline", draft.id);
                    setSelectedId("");
                  }}
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

export default DetailOutlinePage;
