const LoadingState = ({ label = "加载中..." }: { label?: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
    <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default LoadingState;
