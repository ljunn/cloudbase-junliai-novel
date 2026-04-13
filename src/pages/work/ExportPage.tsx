import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import PageHeading from "@/components/PageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWork } from "@/workspace/WorkContext";

const decodeBase64ToBlob = (base64: string, mimeType: string) => {
  const binary = window.atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
};

const ExportPage = () => {
  const { loading, error, work, refresh, triggerExport } = useWork();
  const [format, setFormat] = useState<"txt" | "markdown" | "docx">("markdown");
  const [scope, setScope] = useState<"full" | "volume" | "selection">("full");
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedVolumeId, setSelectedVolumeId] = useState("");
  const [busy, setBusy] = useState(false);

  const selectableChapters = work?.chapters || [];
  const volumes = work?.volumes || [];
  const latestExports = useMemo(() => work?.recentExports || [], [work?.recentExports]);

  if (loading) {
    return <LoadingState label="正在准备导出能力..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  }

  if (!work) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Export"
        title="把当前成果导出成真正可交付的稿件"
        description="当前支持 TXT、Markdown 和 DOCX。你可以导出整本书、单卷或选中章节，最近导出记录会保留在下方。"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-5 p-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">导出格式</p>
              <div className="flex flex-wrap gap-2">
                {(["txt", "markdown", "docx"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      format === item
                        ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        : "rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground"
                    }
                    onClick={() => setFormat(item)}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">导出范围</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["full", "整本书"],
                    ["volume", "单卷"],
                    ["selection", "选中章节"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      scope === value
                        ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        : "rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground"
                    }
                    onClick={() => setScope(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {scope === "selection" ? (
              <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-secondary/35 p-4">
                {selectableChapters.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedChapterIds.includes(item.id)}
                      onChange={(event) =>
                        setSelectedChapterIds((current) =>
                          event.target.checked
                            ? [...current, item.id]
                            : current.filter((chapterId) => chapterId !== item.id),
                        )
                      }
                    />
                    <span>{item.title}</span>
                  </label>
                ))}
              </div>
            ) : null}

            {scope === "volume" ? (
              <select
                value={selectedVolumeId}
                onChange={(event) => setSelectedVolumeId(event.target.value)}
                className="flex h-11 w-full rounded-full border border-border bg-white/80 px-4 text-sm text-foreground shadow-sm"
              >
                <option value="">请选择一卷</option>
                {volumes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            ) : null}

            <Button
              type="button"
              disabled={
                busy ||
                (scope === "selection" && !selectedChapterIds.length) ||
                (scope === "volume" && !selectedVolumeId)
              }
              onClick={async () => {
                setBusy(true);
                try {
                  const chapterIds =
                    scope === "selection"
                      ? selectedChapterIds
                      : scope === "volume"
                        ? selectableChapters
                            .filter((item) => item.volumeId === selectedVolumeId)
                            .map((item) => item.id)
                        : undefined;
                  const result = await triggerExport(
                    format,
                    scope,
                    chapterIds,
                  );
                  const blob = decodeBase64ToBlob(result.contentBase64, result.mimeType);
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = result.downloadName;
                  anchor.click();
                  URL.revokeObjectURL(url);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "正在打包..." : "开始导出"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/92">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-semibold text-foreground">最近导出</p>
            {latestExports.length ? (
              latestExports.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.25rem] border border-border/70 bg-secondary/35 p-4"
                >
                  <p className="font-semibold text-foreground">{item.downloadName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.scopeLabel} · {item.format.toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.createdAt}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="还没有导出记录"
                description="导出一次之后，这里会开始保留最近产出。"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportPage;
