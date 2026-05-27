import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadQuestionPaper
from "./pages/UploadQuestionPaper";
import Dashboard from "./pages/Dashboard";
import AIEvaluation from "./pages/AIEvaluation";
import Results from "./pages/Results";
import ViewQuestionPapers from "./pages/ViewQuestionPapers";
import DetectedQuestionsEditor from "./pages/DetectedQuestionsEditor";

import QuestionEditorPage
from "./pages/QuestionEditorPage";
function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route
          path="/evaluate"
          element={<AIEvaluation />}
        />

        <Route
          path="/results"
          element={<Results />}
        />
      

<Route
  path="/upload-question-paper"
  element={<UploadQuestionPaper />}
/>
<Route
          path="/view-question-papers"
          element={
            <ViewQuestionPapers />
          }
        />
<Route
          path="/detect-questions"
          element={
            <DetectedQuestionsEditor/>
          }
        />
<Route
  path="/question-editor/:paperId"
  element={
    <QuestionEditorPage />
  }
/>        
      </Routes>
    </BrowserRouter>
  );
}

export default App;