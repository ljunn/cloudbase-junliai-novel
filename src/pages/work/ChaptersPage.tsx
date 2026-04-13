import { useMemo, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWork } from "@/workspace/WorkContext";

const chapterStatusMap = {
  draft: "pending",
  writing: "processing",
  completed: "success",
} as const;

const ChaptersPage = () => {
  const navigate = useNavigate();
  const { loading, error, work, refresh, upsertChapter } = useWork();
  const [keyword, setKeyword] = useState("");

  const groupedChapters = useMemo(() => {
    const chapters = work?.chapters || [];
    const volumes = work?.volumes || [];
    const volumeMap = new Map(volumes.map((item) => [item.id, item.title]));
    const normalized = keyword.trim().toLowerCase();

    return chapters
      .filter((item) =>
        normalized
          ? [item.title, item.summary].join(" ").toLowerCase().includes(normalized)
          : true,
      )
      .reduce<Record<string, typeof chapters>>((bucket, item) => {
        const key = volumeMap.get(item.volumeId || "") || "未分卷章节";
        bucket[key] ||= [];
        bucket[key].push(item);
        return bucket;
      }, {});
  }, [keyword, work?.chapters, work?.volumes]);

  if (loading) {
    return <LoadingState label="正在载入章节列表..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Chapters"
        title="章节按分卷聚合，直接进入正文创作"
        description="章节列表以“分卷 -> 章节”的方式组织，当前版本优先保证创建、继续写、查看状态与 AI 生成记录这条主链路畅通。"
        actions={
          <Button
            type="button"
            onClick={async () => {
              await upsertChapter({
                title: `第${String((work?.chapters.length || 0) + 1).padStart(2, "0")}章`,
                summary: "",
                content: "",
                status: "draft",
                volumeId: work?.volumes[0]?.id || null,
              });
            }}
          >
            <Plus className="h-4 w-4" />
            新建章节
          </Button>
        }
      />

      <Card className="border-border/70 bg-white/92">
        <CardContent className="p-4">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索章节标题或摘要"
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(groupedChapters).map(([groupLabel, chapters]) => (
          <Card key={groupLabel} className="border-border/70 bg-white/92">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">{groupLabel}</h2>
                <span className="text-sm text-muted-foreground">
                  {chapters.length} 章
                </span>
              </div>
              {chapters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-secondary/35 px-4 py-3 text-left hover:bg-secondary/60"
                  onClick={() => navigate(`/works/${work?.project.id}/chapter/${item.id}`)}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{item.title}</p>
                      <StatusBadge status={chapterStatusMap[item.status]}>
                        {item.status}
                      </StatusBadge>
                      {item.aiGenerated ? (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          已 AI 生成
                        </span>
                      ) : null}
                      {item.consistencyWarning ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          一致性警告
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.summary || "还没有本章摘要"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.wordCount.toLocaleString("zh-CN")} 字 · {item.updatedAt}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChaptersPage;
