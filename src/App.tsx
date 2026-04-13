import { useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import AuthGate from "@/components/AuthGate";
import LoadingState from "@/components/LoadingState";
import DashboardPage from "@/pages/DashboardPage";
import AssistantPage from "@/pages/AssistantPage";
import ProfilePage from "@/pages/ProfilePage";
import TemplatesPage from "@/pages/TemplatesPage";
import TrashPage from "@/pages/TrashPage";
import WorkRoute from "@/pages/WorkRoute";
import WorksPage from "@/pages/WorksPage";
import { WorkspaceProvider } from "@/workspace/WorkspaceContext";

const AuthenticatedWorkspace = () => {
  const { loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="layout-shell py-12">
        <LoadingState label="正在恢复创作会话..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return (
    <WorkspaceProvider>
      <div className="layout-shell lg:grid lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 py-6 lg:py-0">
          <AppHeader onOpenSidebar={() => setSidebarOpen(true)} />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/works/new" element={<WorksPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/works/:workId/*" element={<WorkRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </WorkspaceProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AuthenticatedWorkspace />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
