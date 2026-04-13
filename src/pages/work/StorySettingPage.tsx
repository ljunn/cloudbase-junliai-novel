import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { SaveStatePill } from "@/components/SaveStatePill";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/useAutosave";
import type { StorySetting } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const StorySettingPage = () => {
  const { loading, error, work, refresh, updateSingletonDocument } = useWork();
  const [form, setForm] = useState<StorySetting | null>(null);

  useEffect(() => {
    setForm(work?.storySetting || null);
  }, [work?.storySetting]);

  const autosave = useAutosave({
    value: form,
    enabled: Boolean(form),
    onSave: async (nextValue) => {
      if (!nextValue) {
        return;
      }

      await updateSingletonDocument("story_setting", nextValue);
    },
  });

  if (loading) {
    return <LoadingState label="正在载入故事设定..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Story Setting"
        title="先把这本书的创作边界说清楚"
        description="这里定义 premise、logline、主题、文风、叙事规则和禁止事项。章节生成时，这些字段会作为全局创作上下文参与引用。"
        actions={<SaveStatePill state={autosave.state} error={autosave.error} />}
      />

      <Card className="border-border/70 bg-white/92">
        <CardContent className="grid gap-5 p-8 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-foreground">核心 premise</span>
            <Textarea
              value={form.premise}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, premise: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-foreground">Logline</span>
            <Textarea
              value={form.logline}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, logline: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">主题</span>
            <Input
              value={form.theme}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, theme: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">风格</span>
            <Input
              value={form.style}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, style: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">受众</span>
            <Input
              value={form.audience}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, audience: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">文风说明</span>
            <Input
              value={form.voiceGuide}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, voiceGuide: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-foreground">叙事规则</span>
            <Textarea
              value={form.narrativeRules}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, narrativeRules: event.target.value }
                    : current,
                )
              }
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-foreground">禁止事项</span>
            <Textarea
              value={form.forbiddenRules}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, forbiddenRules: event.target.value }
                    : current,
                )
              }
            />
          </label>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorySettingPage;
