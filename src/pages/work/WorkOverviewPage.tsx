import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWork } from "@/workspace/WorkContext";

const WorkOverviewPage = () => {
  const { loading, error, work, refresh } = useWork();

  if (loading) {
    return <LoadingState label="正在读取作品总览..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  if (!work) {
    return null;
  }

  const metrics = [
    ["总字数", work.overview.totalWords.toLocaleString("zh-CN")],
    ["分卷数", String(work.overview.volumeCount)],
    ["章节数", String(work.overview.chapterCount)],
    ["最近创作", work.overview.updatedAt],
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow={work.project.genre}
        title={work.project.title}
        description={work.overview.description}
        actions={
          <Button asChild>
            <Link to={`/works/${work.project.id}/chapter`}>继续当前章节</Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label} className="border-border/70 bg-white/92">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardHeader>
            <CardTitle>主线进度与最近生成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/35 p-5">
              <p className="text-sm text-muted-foreground">当前主线进度</p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {work.overview.progressLabel}
              </p>
            </div>
            {work.overview.recentGenerations.length ? (
              work.overview.recentGenerations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.25rem] border border-border/70 bg-secondary/35 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{item.chapterTitle}</p>
                    <Badge variant="outline">{item.action}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.excerpt}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="还没有生成记录"
                description="第一次在章节页发起续写或润色之后，这里会开始显示最新的生成历史。"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-white/92">
            <CardHeader>
              <CardTitle>主要角色摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {work.overview.leadCharacters.length ? (
                work.overview.leadCharacters.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.25rem] border border-border/70 bg-secondary/35 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <Badge variant="outline">{item.identity}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.arcSummary || item.currentState}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  先去角色库补角色卡，这里就会自动出现主角和关键角色摘要。
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/92">
            <CardHeader>
              <CardTitle>当前世界设定摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {work.overview.worldHighlights.length ? (
                work.overview.worldHighlights.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.25rem] border border-border/70 bg-secondary/35 p-4"
                  >
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  世界观条目会在你补完地点、势力、规则和道具后自动聚合到这里。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkOverviewPage;
