import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { WorkProvider } from "@/workspace/WorkContext";
import ChapterEditorPage from "./work/ChapterEditorPage";
import ChaptersPage from "./work/ChaptersPage";
import DetailOutlinePage from "./work/DetailOutlinePage";
import ExportPage from "./work/ExportPage";
import MemoryPage from "./work/MemoryPage";
import PromptTemplatesPage from "./work/PromptTemplatesPage";
import RoughOutlinePage from "./work/RoughOutlinePage";
import StorySettingPage from "./work/StorySettingPage";
import TimelinePage from "./work/TimelinePage";
import VolumesPage from "./work/VolumesPage";
import WorkOverviewPage from "./work/WorkOverviewPage";
import WorldPage from "./work/WorldPage";
import CharactersPage from "./work/CharactersPage";

const WorkRoute = () => {
  const { workId } = useParams();

  if (!workId) {
    return <Navigate to="/works" replace />;
  }

  return (
    <WorkProvider workId={workId}>
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<WorkOverviewPage />} />
        <Route path="story" element={<StorySettingPage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="world" element={<WorldPage />} />
        <Route path="rough-outline" element={<RoughOutlinePage />} />
        <Route path="detail-outline" element={<DetailOutlinePage />} />
        <Route path="volumes" element={<VolumesPage />} />
        <Route path="chapters" element={<ChaptersPage />} />
        <Route path="chapter" element={<ChapterEditorPage />} />
        <Route path="chapter/:chapterId" element={<ChapterEditorPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="memory" element={<MemoryPage />} />
        <Route path="prompts" element={<PromptTemplatesPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </WorkProvider>
  );
};

export default WorkRoute;
