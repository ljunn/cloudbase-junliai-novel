import { RotateCcw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { EmptyState } from "@/components/EmptyState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateWorkMeta } from "@/lib/api";
import { useWorkspace } from "@/workspace/WorkspaceContext";

const TrashPage = () => {
  const { accessToken, deviceId } = useAuth();
  const { bootstrap, refreshBootstrap } = useWorkspace();
  const trash = bootstrap?.trash || [];

  if (!trash.length) {
    return (
      <EmptyState
        title="回收站是空的"
        description="删除的作品会先放在这里，方便恢复；真正的数据清理可以放到后续的生命周期策略里。"
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Trash"
        title="先放回收站，再决定是否彻底清理"
        description="为了避免长篇项目误删，当前版本会先把作品移到回收站。恢复后，原有的大纲、角色和章节记录会一起回来。"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {trash.map((item) => (
          <Card key={item.id} className="border-border/70 bg-white/92">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.premise}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{item.genre}</span>
                <span>{item.chapterCount} 章</span>
                <span>{item.totalWords.toLocaleString("zh-CN")} 字</span>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!accessToken}
                onClick={async () => {
                  if (!accessToken) {
                    return;
                  }

                  await updateWorkMeta(accessToken, deviceId, item.id, {
                    status: "writing",
                  });
                  await refreshBootstrap();
                }}
              >
                <RotateCcw className="h-4 w-4" />
                恢复作品
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrashPage;
