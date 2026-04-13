import { useMemo, useState } from "react";
import { Copy, FolderArchive, Plus, Trash2 } from "lucide-react";
import { useMatch, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import NewWorkDialog from "@/components/NewWorkDialog";
import PageHeading from "@/components/PageHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from "@/components/ui/table";
import { updateWorkMeta } from "@/lib/api";
import { useWorkspace } from "@/workspace/WorkspaceContext";

const statusMap = {
  draft: "pending",
  writing: "processing",
  completed: "success",
  archived: "ignored",
  trashed: "failed",
} as const;

const WorksPage = () => {
  const navigate = useNavigate();
  const createWorkMatch = useMatch("/works/new");
  const { accessToken, deviceId } = useAuth();
  const {
    bootstrap,
    loading,
    error,
    refreshBootstrap,
    duplicateWorkAndRefresh,
  } = useWorkspace();
  const [keyword, setKeyword] = useState("");
  const [busyId, setBusyId] = useState("");
  const isCreateDialogOpen = Boolean(createWorkMatch);

  const filteredWorks = useMemo(() => {
    const source = bootstrap?.works || [];
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) {
      return source;
    }

    return source.filter((item) =>
      [item.title, item.genre, item.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [bootstrap?.works, keyword]);

  if (loading) {
    return <LoadingState label="正在载入作品列表..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refreshBootstrap()} />;
  }

  const handleStatusChange = async (workId: string, status: string) => {
    if (!accessToken) {
      return;
    }

    setBusyId(workId);
    try {
      await updateWorkMeta(accessToken, deviceId, workId, { status });
      await refreshBootstrap();
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="My Works"
        title="作品、设定和章节都按书管理"
        description="这里不是单轮对话列表，而是你所有长篇项目的入口。进入任意一本书之后，左侧导航会切换成该作品自己的创作结构。"
        actions={
          <Button type="button" onClick={() => navigate("/works/new")}>
            <Plus className="h-4 w-4" />
            新建作品
          </Button>
        }
      />

      <div className="rounded-[1.75rem] border border-border/80 bg-white/90 p-4 shadow-sm">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="按作品名、题材或标签搜索"
        />
      </div>

      {filteredWorks.length ? (
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>作品名称</TableHead>
                <TableHead>题材 / 标签</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>总字数</TableHead>
                <TableHead>章节数</TableHead>
                <TableHead>最近更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="max-w-[28rem] text-sm text-muted-foreground">
                        {item.premise}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.genre}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.tags.join(" / ") || "未设置标签"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMap[item.status]}>
                      {item.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{item.totalWords.toLocaleString("zh-CN")}</TableCell>
                  <TableCell>{item.chapterCount}</TableCell>
                  <TableCell>{item.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/works/${item.id}/overview`)}
                      >
                        进入
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={async () => {
                          setBusyId(item.id);
                          try {
                            const nextId = await duplicateWorkAndRefresh(item.id);
                            navigate(`/works/${nextId}/overview`);
                          } finally {
                            setBusyId("");
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        复制
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() =>
                          void handleStatusChange(
                            item.id,
                            item.status === "archived" ? "writing" : "archived",
                          )
                        }
                      >
                        <FolderArchive className="h-4 w-4" />
                        {item.status === "archived" ? "恢复" : "归档"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => void handleStatusChange(item.id, "trashed")}
                      >
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      ) : (
        <EmptyState
          title="当前没有匹配作品"
          description="试试换一个搜索词，或者先新建一本书。后面所有设定、角色和章节都会按作品聚合在这里。"
          action={
            <Button type="button" onClick={() => navigate("/works/new")}>
              新建作品
            </Button>
          }
        />
      )}

      {isCreateDialogOpen ? (
        <NewWorkDialog onClose={() => navigate("/works")} />
      ) : null}
    </div>
  );
};

export default WorksPage;
