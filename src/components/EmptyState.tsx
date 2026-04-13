import type { ReactNode } from "react";

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="rounded-[1.75rem] border border-dashed border-border bg-white/72 px-6 py-10 text-center shadow-sm">
    <h3 className="text-xl font-semibold tracking-tight text-foreground">
      {title}
    </h3>
    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
      {description}
    </p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
);
