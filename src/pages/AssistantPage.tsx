import { useEffect, useMemo, useState } from "react";
import { Bot } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { EmptyState } from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { runAssistant } from "@/lib/api";
import { useWorkspace } from "@/workspace/WorkspaceContext";

const scopes = [
  { value: "full_book", label: "全书" },
  { value: "current_work", label: "当前作品" },
  { value: "current_volume", label: "当前分卷" },
  { value: "current_chapter", label: "当前章节" },
  { value: "selected_text", label: "选中文本" },
] as const;

const AssistantPage = () => {
  const { accessToken, deviceId } = useAuth();
  const { bootstrap } = useWorkspace();
  const works = bootstrap?.works || [];
  const [workId, setWorkId] = useState(works[0]?.id || "");
  const [question, setQuestion] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [scope, setScope] =
    useState<(typeof scopes)[number]["value"]>("current_work");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const selectedWork = useMemo(
    () => works.find((item) => item.id === workId) || null,
    [workId, works],
  );

  useEffect(() => {
    if (!workId && works[0]?.id) {
      setWorkId(works[0].id);
    }
  }, [workId, works]);

  if (!works.length) {
    return (
      <EmptyState
        title="先创建一部作品再向 AI 提问"
        description="AI 助手不是脱离作品上下文的聊天窗口。你先新建一本书，后面才能按当前作品、分卷、章节和选中文本提问。"
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Assistant"
        title="针对当前作品提问，而不是从零开始聊天"
        description="你可以让 AI 检查剧情推进、角色行为合理性、下一章续写方向或备选方案。每次提问都能明确指定上下文范围。"
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardHeader>
            <CardTitle>提问范围</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">当前作品</span>
              <select
                value={workId}
                onChange={(event) => setWorkId(event.target.value)}
                className="flex h-11 w-full rounded-full border border-border bg-white/80 px-4 text-sm text-foreground shadow-sm"
              >
                {works.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">上下文范围</span>
              <div className="flex flex-wrap gap-2">
                {scopes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={
                      scope === item.value
                        ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        : "rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground"
                    }
                    onClick={() => setScope(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">选中文本（可选）</span>
              <Textarea
                value={selectedText}
                onChange={(event) => setSelectedText(event.target.value)}
                className="min-h-[160px]"
                placeholder="如果你想只围绕某个片段提问，可以把片段粘贴在这里。"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardHeader>
            <CardTitle>提问与回复</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="例如：这一卷的主线冲突是不是还不够紧？"
            />
            <Button
              type="button"
              disabled={!question.trim() || !selectedWork || busy || !accessToken}
              onClick={async () => {
                if (!accessToken || !selectedWork) {
                  return;
                }

                setBusy(true);
                try {
                  const result = await runAssistant(
                    accessToken,
                    deviceId,
                    selectedWork.id,
                    {
                      instruction: question,
                      contextScope: scope,
                      includeContexts: ["story_setting", "rough_outline", "recent_chapters"],
                      selectedText,
                    },
                  );
                  setAnswer(result.answer);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Bot className="h-4 w-4" />
              {busy ? "AI 思考中..." : "开始提问"}
            </Button>
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/35 p-5">
              <p className="text-sm font-semibold text-foreground">
                {selectedWork ? `当前作品：${selectedWork.title}` : "尚未选择作品"}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {answer || "这里会显示 AI 对当前作品的建议、检视或续写方向。"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssistantPage;
