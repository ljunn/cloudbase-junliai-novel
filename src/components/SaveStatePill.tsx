import type { AutosaveState } from "@/hooks/useAutosave";
import { cn } from "@/lib/utils";

const toneMap: Record<AutosaveState, string> = {
  idle: "bg-secondary text-secondary-foreground",
  saving: "bg-sky-50 text-sky-700",
  saved: "bg-emerald-50 text-emerald-700",
  error: "bg-rose-50 text-rose-700",
};

const labelMap: Record<AutosaveState, string> = {
  idle: "等待编辑",
  saving: "自动保存中",
  saved: "已自动保存",
  error: "保存失败",
};

export const SaveStatePill = ({
  state,
  error,
}: {
  state: AutosaveState;
  error?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      toneMap[state],
    )}
    title={error || labelMap[state]}
  >
    {labelMap[state]}
  </span>
);
