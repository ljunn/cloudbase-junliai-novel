import { ArrowRight, BookPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/workspace/WorkspaceContext";

const DashboardPage = () => {
  const { bootstrap, loading, error, refreshBootstrap } = useWorkspace();

  if (loading) {
    return <LoadingState label="正在整理你的创作工作台..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refreshBootstrap()} />;
  }

  const dashboard = bootstrap?.dashboard;

  if (!dashboard) {
    return (
      <EmptyState
        title="工作台还没有内容"
        description="先新建一部作品，接着把故事设定、角色、大纲和章节串起来，后面就能一直在同一条创作链路里往前写。"
        action={
          <Button asChild>
            <Link to="/works/new">
              <BookPlus className="h-4 w-4" />
              新建作品
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Dashboard"
        title="继续写，而不是重新找上下文"
        description="最近编辑作品、待续写章节、最近生成记录和草稿都会聚在这里。打开工作台后，你应该能直接回到正在写的那一章。"
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/works">查看全部作品</Link>
            </Button>
            <Button asChild>
              <Link to="/works/new">
                <BookPlus className="h-4 w-4" />
                新建作品
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {dashboard.metrics.map((item) => (
          <Card key={item.label} className="border-border/70 bg-white/92">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    {item.value}
                  </p>
                </div>
                {item.status ? <StatusBadge status={item.status} /> : null}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card className="border-border/70 bg-white/92">
          <CardHeader>
            <CardTitle>最近编辑的作品</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentProjects.length ? (
              dashboard.recentProjects.map((item) => (
                <Link
                  key={item.id}
                  to={`/works/${item.id}/overview`}
                  className="block rounded-[1.4rem] border border-border/70 bg-secondary/40 p-5 transition-colors hover:bg-secondary/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {item.genre}
                        </span>
                      </div>
                      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                        {item.premise}
                      </p>
                    </div>
                    <div className="space-y-1 text-right text-sm text-muted-foreground">
                      <p>{item.progressLabel}</p>
                      <p>{item.updatedAt}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{item.chapterCount} 章</span>
                    <span>{item.totalWords.toLocaleString("zh-CN")} 字</span>
                    <span>下一步：{item.nextActionLabel}</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="还没有最近作品"
                description="新建一部书后，这里会出现你最近改过的大纲和章节。"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-white/92">
            <CardHeader>
              <CardTitle>待续写章节</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.pendingChapters.length ? (
                dashboard.pendingChapters.map((item) => (
                  <Link
                    key={item.id}
                    to={`/works/${item.projectId}/chapter/${item.chapterId}`}
                    className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-secondary/35 px-4 py-3 hover:bg-secondary/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {item.chapterTitle}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.projectTitle}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  当前没有待续写章节，去新建一章或继续完善大纲。
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/92">
            <CardHeader>
              <CardTitle>最近生成记录</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.recentGenerations.length ? (
                dashboard.recentGenerations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.25rem] border border-border/70 bg-secondary/35 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.chapterTitle}</p>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {item.action}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.excerpt}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.projectTitle} · {item.model} · {item.contextLabels.join(" / ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  第一条 AI 生成记录会在你完成一次续写或润色后出现在这里。
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-white/92">
            <CardHeader>
              <CardTitle>草稿箱</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.drafts.length ? (
                dashboard.drafts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.25rem] border border-border/70 bg-secondary/35 px-4 py-3"
                  >
                    <p className="font-semibold text-foreground">{item.chapterTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.projectTitle} · {item.wordCount.toLocaleString("zh-CN")} 字
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  还没有暂存草稿。你在章节页里新建一章后，这里会自动出现。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
