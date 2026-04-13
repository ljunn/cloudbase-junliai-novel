import { Copy, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/workspace/WorkspaceContext";

const TemplatesPage = () => {
  const { bootstrap, loading, error, refreshBootstrap } = useWorkspace();

  if (loading) {
    return <LoadingState label="正在读取模板库..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refreshBootstrap()} />;
  }

  const templates = bootstrap?.templates || [];

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Template Library"
        title="把顺手的创作套路沉淀成模板"
        description="这里存放开书模板、角色模板、世界观模板、粗纲模板、细纲模板和章节续写模板。当前版本先支持浏览与复制，后端结构已预留个人模板写入能力。"
      />

      {templates.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {templates.map((item) => (
            <Card key={item.id} className="border-border/70 bg-white/92">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={item.isSystem ? "accent" : "secondary"}>
                    {item.isSystem ? "系统模板" : "我的模板"}
                  </Badge>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{item.content}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {item.toneLabel} · {item.updatedAt}
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                    复制成我的模板
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="模板库还没有内容"
          description="系统模板和个人模板会在后端初始化完成后出现在这里。当前代码已经保留了模板结构和作品内应用入口。"
          action={
            <Button type="button" variant="outline">
              <Sparkles className="h-4 w-4" />
              等待模板初始化
            </Button>
          }
        />
      )}
    </div>
  );
};

export default TemplatesPage;
