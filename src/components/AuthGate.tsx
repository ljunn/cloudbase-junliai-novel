import {
  BookOpenText,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const benefits = [
  {
    title: "作品资产不再散落",
    description: "同一本书里的设定、角色、世界观、粗纲、细纲、分卷和章节会放在同一条创作链路里。",
    icon: Sparkles,
  },
  {
    title: "章节创作能持续接上",
    description: "写到中途时，AI 可以带着最近章节、角色卡、世界设定和伏笔记录继续往下写。",
    icon: BrainCircuit,
  },
  {
    title: "导出时还是一本完整的书",
    description: "从工作台里可以按整本书、单卷或选中章节导出成 TXT、Markdown 和 DOCX。",
    icon: BookOpenText,
  },
];

const AuthGate = () => {
  const { goToLoginPage } = useAuth();

  return (
    <div className="layout-shell py-8 pb-16">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <Card className="overflow-hidden border-primary/10 bg-white/94">
          <CardContent className="space-y-8 p-8 md:p-10">
            <div className="space-y-4">
              <p className="section-label">Junli AI Novel</p>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-[3.1rem] md:leading-[1.05]">
                  登录后直接进入写作工作台，从作品到章节一路写到底。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                  这里不是运营后台，也不是单轮聊天框。你会先看到最近在写的作品、待续写章节、最近生成记录，以及继续开写所需的上下文资产。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-border/80 bg-secondary/45 p-5"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="button"
                size="lg"
                onClick={() => void goToLoginPage(window.location.href)}
              >
                进入创作工作台
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/90">
          <CardContent className="space-y-5 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                登录后主链路会直接打开
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                你会先从工作台继续当前作品，再逐步进入故事设定、角色库、分卷规划、章节编辑器和导出页，不需要在孤立页面之间来回跳。
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-secondary/50 p-5 text-sm leading-7 text-muted-foreground">
              使用前你可以关注：
              <br />
              1. 在工作台找到最近编辑作品和待续写章节
              <br />
              2. 在单本作品里维护设定、角色、时间线和记忆库
              <br />
              3. 在章节编辑器里用 AI 做续写、改写、润色和导出
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthGate;
