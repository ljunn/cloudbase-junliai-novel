import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { SaveStatePill } from "@/components/SaveStatePill";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/useAutosave";
import type { RoughOutline } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const RoughOutlinePage = () => {
  const { loading, error, work, refresh, updateSingletonDocument } = useWork();
  const [outline, setOutline] = useState<RoughOutline | null>(null);

  useEffect(() => {
    setOutline(work?.roughOutline || null);
  }, [work?.roughOutline]);

  const autosave = useAutosave({
    value: outline,
    enabled: Boolean(outline),
    onSave: async (nextValue) => {
      if (!nextValue) {
        return;
      }

      await updateSingletonDocument("rough_outline", nextValue);
    },
  });

  if (loading) {
    return <LoadingState label="正在载入粗纲..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  if (!outline) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Rough Outline"
        title="先把长篇的大方向钉住"
        description="粗纲负责明确开篇、发展、冲突、高潮和结局，后面的细纲和章节推进都应从这里向下展开。"
        actions={<SaveStatePill state={autosave.state} error={autosave.error} />}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {outline.stages.map((stage, index) => (
          <Card key={stage.key} className="border-border/70 bg-white/92">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-semibold text-muted-foreground">
                {String(index + 1).padStart(2, "0")} · {stage.label}
              </p>
              <Textarea
                value={stage.content}
                className="min-h-[220px]"
                onChange={(event) =>
                  setOutline((current) =>
                    current
                      ? {
                          ...current,
                          stages: current.stages.map((item) =>
                            item.key === stage.key
                              ? { ...item, content: event.target.value }
                              : item,
                          ),
                        }
                      : current,
                  )
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoughOutlinePage;
