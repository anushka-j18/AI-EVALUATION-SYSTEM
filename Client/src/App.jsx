import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";

// Existing pages
import UploadQuestionPaper from "./pages/UploadQuestionPaper";
import UploadAnswerSheet from "./pages/UploadAnswerSheet";
import Dashboard from "./pages/Dashboard";
import AIEvaluation from "./pages/AIEvaluation";
import Results from "./pages/Results";
import ViewQuestionPapers from "./pages/ViewQuestionPapers";
import DetectedQuestionsEditor from "./pages/DetectedQuestionsEditor";
import QuestionEditorPage from "./pages/QuestionEditorPage";

// New Teacher Dashboard pages
import Login from "./pages/Login";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AvailableScripts from "./pages/dashboard/AvailableScripts";
import AssignedEvaluations from "./pages/dashboard/AssignedEvaluations";
import PendingScripts from "./pages/dashboard/PendingScripts";
import EvaluatedScripts from "./pages/dashboard/EvaluatedScripts";
import DigitalEvaluation from "./pages/dashboard/DigitalEvaluation";
import AIEvaluationDash from "./pages/dashboard/AIEvaluationDash";
import TeacherProfile from "./pages/dashboard/TeacherProfile";
import SubjectResultsList from "./pages/dashboard/SubjectResultsList";
import SubjectResultDetails from "./pages/dashboard/SubjectResultDetails";

// Admin Dashboard pages

import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AssignScripts from "./pages/admin/AssignScripts";
import TeacherManagement from "./pages/admin/TeacherManagement";
import AdminSubjectResultsList from "./pages/admin/AdminSubjectResultsList";
import AdminSubjectResultDetails from "./pages/admin/AdminSubjectResultDetails";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="assign" element={<AssignScripts />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="upload-answer-sheet" element={<UploadAnswerSheet />} />
            <Route path="results" element={<AdminSubjectResultsList />} />
            <Route path="results/:questionPaperId" element={<AdminSubjectResultDetails />} />
          </Route>

          {/* Teacher Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="ai-evaluation" element={<AIEvaluationDash />} />
            <Route path="digital-evaluation/:answerSheetId" element={<DigitalEvaluation />} />
            <Route path="assigned" element={<AssignedEvaluations />} />
            <Route path="available-scripts" element={<AvailableScripts />} />
            <Route path="pending" element={<PendingScripts />} />
            <Route path="evaluated" element={<EvaluatedScripts />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="results" element={<SubjectResultsList />} />
            <Route path="results/:questionPaperId" element={<SubjectResultDetails />} />
          </Route>

          {/* Existing Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/evaluate" element={<AIEvaluation />} />
          <Route path="/results" element={<Results />} />
          <Route path="/upload-question-paper" element={<UploadQuestionPaper />} />
          <Route path="/view-question-papers" element={<ViewQuestionPapers />} />
          <Route path="/detect-questions" element={<DetectedQuestionsEditor />} />
          <Route path="/question-editor/:paperId" element={<QuestionEditorPage />} />
        </Routes>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;