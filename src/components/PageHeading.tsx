import type { ReactNode } from "react";

const PageHeading = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 border-b border-border/80 pb-6 xl:flex-row xl:items-end xl:justify-between">
    <div className="space-y-2">
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[2.15rem]">
        {title}
      </h1>
      <p className="max-w-3xl text-base leading-8 text-muted-foreground">
        {description}
      </p>
    </div>
    {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
  </div>
);

export default PageHeading;
