import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { VolumePlan } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankVolume = (sortIndex: number): VolumePlan => ({
  id: "",
  title: "",
  summary: "",
  targetWords: 120000,
  chapterRange: "",
  mainObjective: "",
  sortIndex,
  updatedAt: "",
});

const VolumesPage = () => {
  const { loading, error, work, refresh, upsertVolume } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<VolumePlan>(createBlankVolume(1));

  const volumes = work?.volumes || [];
  const selectedVolume = useMemo(
    () => volumes.find((item) => item.id === selectedId) || null,
    [selectedId, volumes],
  );

  useEffect(() => {
    if (selectedVolume) {
      setDraft(selectedVolume);
      return;
    }

    setDraft(createBlankVolume(volumes.length + 1));
  }, [selectedVolume, volumes.length]);

  if (loading) {
    return <LoadingState label="正在载入分卷规划..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Volumes"
        title="把长篇拆成卷，再把每卷的任务说清楚"
        description="卷级规划会定义每卷简介、目标字数、章节范围和主线任务。章节列表页会按这里的卷来聚合展示。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankVolume(volumes.length + 1));
            }}
          >
            <Plus className="h-4 w-4" />
            新建分卷
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {volumes.length ? (
              volumes.map((item) => (
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
                    {item.targetWords.toLocaleString("zh-CN")} 字 · {item.chapterRange || "待定章节范围"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                第一卷通常就是开篇、立势和角色进场，先从这里开始规划。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">分卷标题</span>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">分卷简介</span>
              <Textarea
                value={draft.summary}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, summary: event.target.value }))
                }
              />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">目标字数</span>
                <Input
                  type="number"
                  value={draft.targetWords}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      targetWords: Number(event.target.value || 0),
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">章节范围</span>
                <Input
                  value={draft.chapterRange}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      chapterRange: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">每卷主线任务</span>
              <Textarea
                value={draft.mainObjective}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    mainObjective: event.target.value,
                  }))
                }
              />
            </label>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => void upsertVolume(draft, draft.id || undefined)}
              >
                保存分卷
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDraft(createBlankVolume(volumes.length + 1))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  新建空白卷
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolumesPage;
