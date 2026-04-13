import type { ReactNode } from "react";
import type { WorkflowStatus } from "../types";
import { cn } from "../lib/utils";

const statusClassNameMap: Record<WorkflowStatus, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  processing: "border-sky-200 bg-sky-50 text-sky-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  ignored: "border-slate-200 bg-slate-100 text-slate-600",
};

const statusLabelMap: Record<WorkflowStatus, string> = {
  success: "成功",
  processing: "处理中",
  pending: "待处理",
  failed: "失败",
  ignored: "已忽略",
};

export const StatusBadge = ({
  status,
  children,
  className,
}: {
  status: WorkflowStatus;
  children?: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
      statusClassNameMap[status],
      className,
    )}
  >
    {children || statusLabelMap[status]}
  </span>
);
