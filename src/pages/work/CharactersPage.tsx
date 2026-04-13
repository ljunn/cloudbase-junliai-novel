import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CharacterCard } from "@/types";
import { useWork } from "@/workspace/WorkContext";

const createBlankCharacter = (): CharacterCard => ({
  id: "",
  name: "",
  identity: "",
  faction: "",
  appearance: "",
  personality: "",
  motivation: "",
  background: "",
  relationship: "",
  currentState: "",
  lastAppearanceChapter: "",
  arcSummary: "",
  updatedAt: "",
});

const CharactersPage = () => {
  const { loading, error, work, refresh, upsertDocument, deleteDocument } = useWork();
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<CharacterCard>(createBlankCharacter());

  const characters = work?.characters || [];
  const selectedCharacter = useMemo(
    () => characters.find((item) => item.id === selectedId) || null,
    [characters, selectedId],
  );

  useEffect(() => {
    setDraft(selectedCharacter || createBlankCharacter());
  }, [selectedCharacter]);

  if (loading) {
    return <LoadingState label="正在载入角色库..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Characters"
        title="角色不是一次性生成人设，而是持续维护状态"
        description="角色库会记录身份、阵营、性格、动机、关系和当前状态。后面 AI 在续写和润色章节时，会直接引用这里的角色卡。"
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setDraft(createBlankCharacter());
            }}
          >
            <Plus className="h-4 w-4" />
            新建角色
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-3 p-4">
            {characters.length ? (
              characters.map((item) => (
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
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs opacity-80">
                    {item.identity || "未填写身份"} · {item.currentState || "未填写当前状态"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                先补至少一位主角和一位关键配角，后面细纲和章节生成会更稳定。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="grid gap-5 p-8 md:grid-cols-2">
            {(
              [
                ["name", "姓名"],
                ["identity", "身份"],
                ["faction", "阵营"],
                ["relationship", "与主角关系"],
                ["lastAppearanceChapter", "最近出场章节"],
                ["currentState", "当前状态"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-2">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <Input
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
              </label>
            ))}
            {(
              [
                ["appearance", "外貌"],
                ["personality", "性格"],
                ["motivation", "动机"],
                ["background", "背景"],
                ["arcSummary", "角色成长与变化"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <Textarea
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
              </label>
            ))}
            <div className="flex gap-3 md:col-span-2">
              <Button
                type="button"
                onClick={() => void upsertDocument("character", draft, draft.id || undefined)}
              >
                保存角色卡
              </Button>
              {draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void deleteDocument("character", draft.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  删除角色
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharactersPage;
