import { Button } from "./ui/button";

export const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50/80 px-6 py-8 shadow-sm">
    <p className="text-sm font-semibold text-rose-700">当前页面暂时不可用</p>
    <p className="mt-3 text-sm leading-7 text-rose-700/90">{message}</p>
    {onRetry ? (
      <div className="mt-5">
        <Button type="button" variant="outline" onClick={onRetry}>
          重试
        </Button>
      </div>
    ) : null}
  </div>
);
