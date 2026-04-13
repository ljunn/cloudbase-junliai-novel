import { useEffect, useState } from "react";
import { SaveStatePill } from "@/components/SaveStatePill";
import PageHeading from "@/components/PageHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAutosave } from "@/hooks/useAutosave";
import { useWorkspace } from "@/workspace/WorkspaceContext";

const ProfilePage = () => {
  const { bootstrap, updateProfileAndRefresh } = useWorkspace();
  const profile = bootstrap?.profile;
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const autosave = useAutosave({
    value: form,
    enabled: Boolean(form),
    onSave: async (nextValue) => {
      if (!nextValue) {
        return;
      }

      await updateProfileAndRefresh(nextValue);
    },
  });

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Profile"
        title="只保留作者自己的账号与偏好"
        description="当前页面只负责你的 CloudBase 会话、套餐与金币余额、使用量和个性化偏好，不引入运营后台才会有的管理项。"
        actions={<SaveStatePill state={autosave.state} error={autosave.error} />}
      />

      <div className="max-w-5xl">
        <Card className="border-border/70 bg-white/92">
          <CardHeader>
            <CardTitle>账号与创作偏好</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">显示名称</span>
              <Input value={form.displayName} readOnly />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">偏好模型</span>
              <Input
                value={form.preferredModel}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, preferredModel: event.target.value }
                      : current,
                  )
                }
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-foreground">默认文风提示</span>
              <Input
                value={form.defaultVoice}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, defaultVoice: event.target.value } : current,
                  )
                }
              />
            </label>
            {(
              [
                ["autoSummary", "章节保存后自动补摘要"],
                ["autoVersioning", "章节变更时自动留存版本"],
                ["compactEditor", "章节编辑器使用紧凑布局"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-start gap-3 rounded-[1.5rem] border border-border/80 bg-secondary/35 px-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={form.preferences[key]}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            preferences: {
                              ...current.preferences,
                              [key]: event.target.checked,
                            },
                          }
                        : current,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
