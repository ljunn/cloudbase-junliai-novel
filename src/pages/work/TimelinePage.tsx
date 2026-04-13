import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TimelineEvent } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankEvent = (): TimelineEvent => ({
  id: "",
  title: "",
  chapterTitle: "",
  characterNames: [],
  eventTime: "",
  note: "",
  updatedAt: "",
});

const TimelinePage = () => {
  const { loading, error, work, refresh, upsertDocument, deleteDocument } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<TimelineEvent>(createBlankEvent());

  const events = work?.timeline || [];
  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedId) || null,
    [events, selectedId],
  );

  useEffect(() => {
    setDraft(selectedEvent || createBlankEvent());
  }, [selectedEvent]);

  if (loading) {
    return <LoadingState label="正在载入时间线..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Timeline"
        title="按事件顺序校准整本书的前后逻辑"
        description="时间线记录会把事件、章节、涉及角色和事件时间串起来。它既服务作者自己，也服务后面的 AI 一致性检查。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankEvent());
            }}
          >
            <Plus className="h-4 w-4" />
            新增事件
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {events.length ? (
              events.map((item) => (
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
                  <p className="mt-1 text-xs opacity-80">{item.eventTime || "未设时间"}</p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                先把重要剧情事件按顺序记下来，后面更容易查前后冲突。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">事件名称</span>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">对应章节</span>
                <Input
                  value={draft.chapterTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      chapterTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">事件时间</span>
                <Input
                  value={draft.eventTime}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      eventTime: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">涉及角色</span>
              <Input
                value={draft.characterNames.join(" / ")}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    characterNames: event.target.value
                      .split("/")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">备注</span>
              <Textarea
                value={draft.note}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, note: event.target.value }))
                }
              />
            </label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  void upsertDocument("timeline_event", draft, draft.id || undefined)
                }
              >
                保存事件
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void deleteDocument("timeline_event", draft.id)}
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

export default TimelinePage;
