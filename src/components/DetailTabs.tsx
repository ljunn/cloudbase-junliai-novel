import { cn } from "../lib/utils";

export const DetailTabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
          tab === active
            ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(18,117,226,0.16)]"
            : "border border-border bg-white/80 text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground",
        )}
        onClick={() => onChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);
