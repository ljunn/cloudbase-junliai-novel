import { ArrowLeft, LogIn, LogOut, Menu, ShieldCheck } from "lucide-react";
import { Link, useLocation, useMatch } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useWorkspace } from "@/workspace/WorkspaceContext";
import { Button } from "./ui/button";

const AppHeader = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { loading, session, isAuthenticated, signOut, goToLoginPage } = useAuth();
  const { bootstrap } = useWorkspace();
  const location = useLocation();
  const workMatch = useMatch("/works/:workId/*");
  const currentWork = bootstrap?.works.find((item) => item.id === workMatch?.params.workId);

  const sectionTitle = (() => {
    if (currentWork) {
      return currentWork.title;
    }

    if (location.pathname === "/works" || location.pathname === "/works/new") {
      return "我的作品";
    }

    if (location.pathname === "/templates") {
      return "模板库";
    }

    if (location.pathname === "/assistant") {
      return "AI 助手";
    }

    if (location.pathname === "/trash") {
      return "回收站";
    }

    if (location.pathname === "/profile") {
      return "个人中心";
    }

    return "创作工作台";
  })();

  return (
    <header className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-border/80 bg-white/88 px-5 py-4 shadow-[0_12px_32px_rgba(31,50,81,0.05)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <p className="section-label">
            {currentWork ? "Novel Workspace" : "Writing Workbench"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {currentWork ? (
              <Link
                to="/works"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                返回作品列表
              </Link>
            ) : null}
            <h1 className="text-xl font-semibold text-foreground">{sectionTitle}</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              /novel/#/...
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          {loading
            ? "正在恢复 CloudBase 会话..."
            : isAuthenticated
              ? session?.user.email || session?.user.phone || session?.user.name
              : "未登录，当前仅展示入口说明"}
        </div>
        {isAuthenticated ? (
          <Button type="button" variant="outline" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        ) : (
          <Button type="button" onClick={() => void goToLoginPage(window.location.href)}>
            <LogIn className="h-4 w-4" />
            CloudBase 登录
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
