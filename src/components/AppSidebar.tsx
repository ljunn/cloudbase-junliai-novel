import { NavLink, useMatch } from "react-router-dom";
import {
  BookOpenText,
  Bot,
  BookPlus,
  BrainCircuit,
  Download,
  FileArchive,
  Files,
  FlaskConical,
  Globe2,
  LayoutDashboard,
  Library,
  ScrollText,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/workspace/WorkspaceContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { StatusBadge } from "./StatusBadge";

const globalNavItems = [
  { to: "/", label: "概览", icon: LayoutDashboard },
  { to: "/works", label: "我的作品", icon: Library },
  { to: "/works/new", label: "新建作品", icon: BookPlus },
  { to: "/templates", label: "模板库", icon: Files },
  { to: "/assistant", label: "AI 助手", icon: Bot },
  { to: "/trash", label: "回收站", icon: FileArchive },
  { to: "/profile", label: "个人中心", icon: UserRound },
];

const workNavItems = (workId: string) => [
  { to: `/works/${workId}/overview`, label: "作品总览", icon: LayoutDashboard },
  { to: `/works/${workId}/story`, label: "故事设定", icon: ScrollText },
  { to: `/works/${workId}/characters`, label: "角色库", icon: UsersRound },
  { to: `/works/${workId}/world`, label: "世界观", icon: Globe2 },
  { to: `/works/${workId}/rough-outline`, label: "粗纲", icon: Sparkles },
  { to: `/works/${workId}/detail-outline`, label: "细纲", icon: FlaskConical },
  { to: `/works/${workId}/volumes`, label: "分卷规划", icon: BookOpenText },
  { to: `/works/${workId}/chapters`, label: "章节列表", icon: Files },
  { to: `/works/${workId}/chapter`, label: "当前章节创作", icon: BrainCircuit },
  { to: `/works/${workId}/timeline`, label: "时间线", icon: ScrollText },
  { to: `/works/${workId}/memory`, label: "伏笔 / 记忆库", icon: Sparkles },
  { to: `/works/${workId}/prompts`, label: "提示词模板", icon: Bot },
  { to: `/works/${workId}/export`, label: "导出", icon: Download },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
    isActive && "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(18,117,226,0.08)]",
  );

const AppSidebar = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { isAuthenticated, session } = useAuth();
  const { bootstrap } = useWorkspace();
  const workMatch = useMatch("/works/:workId/*");
  const currentWork = bootstrap?.works.find((item) => item.id === workMatch?.params.workId);
  const navItems = currentWork ? workNavItems(currentWork.id) : globalNavItems;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[296px] -translate-x-full overflow-y-auto border-r border-border/70 bg-background/94 px-4 py-5 transition-transform lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0 lg:border-r-0 lg:bg-transparent lg:px-0 lg:py-8",
          open && "translate-x-0",
        )}
      >
        <Card className="h-full border-border/80 bg-white/90">
          <CardContent className="flex h-full flex-col gap-6 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-label">
                  {currentWork ? "Current Novel" : "Junli AI Novel"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {currentWork ? currentWork.title : "长篇创作工作台"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {currentWork
                    ? "把角色、世界观、大纲、章节、记忆和生成记录收在同一本书里。"
                    : "从最近作品继续写，或新建一本长篇，把主链路一次打通。"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={linkClassName}
                    onClick={onClose}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="space-y-3 rounded-[1.4rem] border border-border/80 bg-secondary/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">当前会话</p>
                <StatusBadge status={isAuthenticated ? "success" : "pending"}>
                  {isAuthenticated ? "已登录" : "待登录"}
                </StatusBadge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {isAuthenticated
                  ? session?.user.name || session?.user.email || "CloudBase 会话"
                  : "点击顶部按钮跳转 CloudBase /__auth，后续会自动回到当前工作台。"}
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </>
  );
};

export default AppSidebar;
