// src/pages/QuestionEditorPage.jsx

import { useParams } from "react-router-dom";

import DetectedQuestionsEditor
from "../pages/DetectedQuestionsEditor";

function QuestionEditorPage() {

  const { paperId } =
    useParams();

  return (

    <div
      className="
      min-h-screen
      bg-[#020617]
      text-white
      p-8
      "
    >

      <DetectedQuestionsEditor
        paperId={paperId}
      />

    </div>
  );
}

export default QuestionEditorPage;