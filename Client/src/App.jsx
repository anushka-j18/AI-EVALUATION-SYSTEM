import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { StudentProvider } from "./context/StudentContext";

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

import AdminStudents from "./pages/admin/AdminStudents";
import AdminExams from "./pages/admin/AdminExams";
import AdminExamRegistrations from "./pages/admin/AdminExamRegistrations";
import AdminAdmitCards from "./pages/admin/AdminAdmitCards";
import AdminResults from "./pages/admin/AdminResults";

// Student Dashboard pages
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentExamRegistration from "./pages/student/StudentExamRegistration";
import MyAdmitCard from "./pages/student/MyAdmitCard";
import MyResults from "./pages/student/MyResults";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <StudentProvider>
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
            <Route path="students" element={<AdminStudents />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="exams/:id/registrations" element={<AdminExamRegistrations />} />
            <Route path="admit-cards" element={<AdminAdmitCards />} />
            <Route path="exam-results" element={<AdminResults />} />
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

          {/* Student Dashboard Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="exam-registration" element={<StudentExamRegistration />} />
            <Route path="admit-card" element={<MyAdmitCard />} />
            <Route path="results" element={<MyResults />} />
          </Route>
            </Routes>
          </StudentProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;