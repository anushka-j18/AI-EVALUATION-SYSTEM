// src/pages/AIEvaluation.jsx

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Brain,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Loader2,
  Hash,
} from "lucide-react";

function AIEvaluation() {

  const [file, setFile] =
    useState(null);

  const [checkingMode,
    setCheckingMode] =
    useState("medium");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [papers, setPapers] =
    useState([]);

  const [selectedPaper,
    setSelectedPaper] =
    useState("");

  const [questions,
    setQuestions] =
    useState([]);

  // ============================
  // FETCH QUESTION PAPERS
  // ============================

const fetchQuestionPapers =
    async () => {

      try {

        const res =
          await axios.get(

            "http://localhost:5001/api/question-papers"
          );

        setPapers(
          res.data.papers || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    fetchQuestionPapers();

  }, []);

  

  // ============================
  // FETCH QUESTIONS
  // ============================

  const fetchQuestions =
    async (paperId) => {

      try {

        const res =
          await axios.get(

            `http://localhost:5001/api/questions/paper/${paperId}`
          );

        setQuestions(
          res.data.questions || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  // ============================
  // PAPER CHANGE
  // ============================

  const handlePaperChange =
    (e) => {

      const value =
        e.target.value;

      setSelectedPaper(
        value
      );

      fetchQuestions(value);
    };

  // ============================
  // EVALUATE PAPER
  // ============================

  const evaluatePaper =
    async () => {

      try {

        if (
          !selectedPaper ||
          !file
        ) {

          alert(
            "Select Question Paper and Upload Answer Sheet"
          );

          return;
        }

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "studentName",
          "Rahul Sharma"
        );

        formData.append(
          "rollNumber",
          "101"
        );

        formData.append(
          "checkingMode",
          checkingMode
        );

        formData.append(
          "questionPaperId",
          selectedPaper
        );

        formData.append(
          "answerSheet",
          file
        );

        const res =
          await axios.post(

            "http://localhost:5001/api/ai/auto-evaluate",

            formData
          );

        setResult(
          res.data.evaluation
        );

      } catch (error) {

        console.log(error);

        alert(
          "Evaluation Failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div
      className="
      min-h-screen
      bg-[#020617]
      text-white
      relative
      overflow-hidden
      "
    >

      {/* BACKGROUND */}

      <div
        className="
        absolute
        top-0
        left-0
        w-[500px]
        h-[500px]
        bg-cyan-500/10
        blur-3xl
        rounded-full
        "
      />

      <div
        className="
        absolute
        bottom-0
        right-0
        w-[500px]
        h-[500px]
        bg-purple-500/10
        blur-3xl
        rounded-full
        "
      />

      {/* MAIN */}

      <div
        className="
        relative
        z-10
        max-w-7xl
        mx-auto
        px-6
        py-12
        "
      >

        {/* HEADER */}

        <div className="mb-10">

          <div
            className="
            flex
            items-center
            gap-5
            "
          >

            <div
              className="
              w-20
              h-20
              rounded-3xl
              bg-gradient-to-br
              from-cyan-500
              to-blue-600
              flex
              items-center
              justify-center
              shadow-2xl
              shadow-cyan-500/20
              "
            >
              <Brain size={38} />
            </div>

            <div>

              <h1
                className="
                text-5xl
                font-black
                "
              >
                AI Evaluation
              </h1>

              <p
                className="
                text-gray-400
                mt-2
                text-lg
                "
              >
                Evaluate Answer Sheets using AI
              </p>

            </div>
          </div>
        </div>

        {/* CARD */}

        <div
          className="
          bg-white/5
          border
          border-white/10
          rounded-[32px]
          backdrop-blur-xl
          p-8
          shadow-2xl
          "
        >

          {/* SELECT PAPER */}

          <div className="mb-8">

            <label
              className="
              flex
              items-center
              gap-2
              mb-3
              text-gray-300
              "
            >
              <BookOpen size={18} />

              Select Question Paper
            </label>

            <select

              value={selectedPaper}

              onChange={
                handlePaperChange
              }

              className="
              w-full
              bg-slate-900/70
              border
              border-white/10
              rounded-2xl
              p-4
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-500
              "
            >

              <option value="">
                Select Question Paper
              </option>

              {papers.map(
                (paper) => (

                  <option
                    key={paper._id}

                    value={paper._id}
                  >

                    {paper.subject}
                    {" - "}
                    {paper.subjectCode}
                    {" - "}
                    {paper.examName}

                  </option>
                )
              )}
            </select>
          </div>

          {/* QUESTIONS */}

          {questions.length > 0 && (

            <div className="mb-10">

              <h2
                className="
                text-3xl
                font-bold
                mb-6
                "
              >
                Questions
              </h2>

              <div className="space-y-5">

                {questions.map(
                  (q, index) => (

                    <div
                      key={index}

                      className="
                      bg-slate-900/50
                      border
                      border-white/10
                      rounded-2xl
                      p-5
                      "
                    >

                      <div
                        className="
                        flex
                        justify-between
                        items-center
                        mb-4
                        "
                      >

                        <h3
                          className="
                          text-2xl
                          font-bold
                          text-cyan-400
                          "
                        >
                          Question {q.qNo}
                        </h3>

                        <div
                          className="
                          bg-cyan-500/10
                          px-4
                          py-2
                          rounded-xl
                          "
                        >

                          <span
                            className="
                            text-cyan-400
                            font-bold
                            "
                          >
                            {q.maxMarks} Marks
                          </span>

                        </div>
                      </div>

                      <p
                        className="
                        text-gray-300
                        leading-8
                        "
                      >
                        {q.question}
                      </p>

                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* FILE */}

          <div className="mb-8">

            <label
              className="
              block
              mb-4
              text-gray-300
              "
            >
              Upload Answer Sheet
            </label>

            <div
              className="
              border-2
              border-dashed
              border-cyan-500/30
              rounded-3xl
              p-12
              text-center
              bg-slate-900/40
              "
            >

              <UploadCloud
                size={70}
                className="
                mx-auto
                text-cyan-400
                mb-5
                "
              />

              <h2
                className="
                text-2xl
                font-bold
                "
              >
                Upload Answer Sheet
              </h2>

              <input
                type="file"

                accept="
                .pdf,
                .png,
                .jpg,
                .jpeg
                "

                onChange={(e) =>
                  setFile(
                    e.target.files[0]
                  )
                }

                className="
                mt-6
                "
              />

            </div>

            {file && (

              <div
                className="
                mt-5
                bg-cyan-500/10
                border
                border-cyan-500/20
                p-5
                rounded-2xl
                flex
                items-center
                gap-4
                "
              >

                <FileText
                  className="
                  text-cyan-400
                  "
                />

                <div>

                  <p className="font-bold">
                    {file.name}
                  </p>

                  <p
                    className="
                    text-sm
                    text-gray-400
                    "
                  >
                    {(
                      file.size /
                      1024
                    ).toFixed(2)}
                    {" "}
                    KB
                  </p>

                </div>
              </div>
            )}
          </div>

          {/* CHECKING MODE */}

          <div className="mb-10">

            <label
              className="
              block
              mb-3
              text-gray-300
              "
            >
              Checking Mode
            </label>

            <select

              value={checkingMode}

              onChange={(e) =>
                setCheckingMode(
                  e.target.value
                )
              }

              className="
              w-full
              bg-slate-900/70
              border
              border-white/10
              rounded-2xl
              p-4
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-500
              "
            >

              <option value="easy">
                Easy Checking
              </option>

              <option value="medium">
                Medium Checking
              </option>

              <option value="strict">
                Strict Checking
              </option>

            </select>
          </div>

          {/* BUTTON */}

          <button
            onClick={
              evaluatePaper
            }

            disabled={loading}

            className="
            w-full
            py-5
            rounded-3xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            text-xl
            font-bold
            hover:scale-[1.01]
            transition
            shadow-2xl
            shadow-cyan-500/20
            disabled:opacity-50
            "
          >

            {loading ? (

              <div
                className="
                flex
                items-center
                justify-center
                gap-3
                "
              >

                <Loader2
                  className="
                  animate-spin
                  "
                />

                Evaluating...

              </div>

            ) : (

              "Start AI Evaluation"
            )}
          </button>
        </div>

        {/* RESULT */}

        {result && (

          <div
            className="
            mt-10
            bg-white/5
            border
            border-white/10
            rounded-[32px]
            backdrop-blur-xl
            p-8
            shadow-2xl
            "
          >

            <div
              className="
              flex
              justify-between
              items-center
              mb-10
              "
            >

              <div>

                <h2
                  className="
                  text-4xl
                  font-black
                  "
                >
                  Evaluation Result
                </h2>

                <p
                  className="
                  text-gray-400
                  mt-2
                  "
                >
                  AI Generated Evaluation
                </p>

              </div>

              <div
                className="
                bg-cyan-500/10
                border
                border-cyan-500/20
                px-6
                py-4
                rounded-2xl
                "
              >

                <p className="text-gray-400">
                  Total Marks
                </p>

                <h3
                  className="
                  text-5xl
                  font-black
                  text-cyan-400
                  "
                >
                  {result.totalMarks} / {result.marks.reduce((sum, m) => sum + (Number(m.maxMarks) || 0), 0)}
                </h3>

              </div>
            </div>

            {/* QUESTION RESULTS */}

            <div className="space-y-6">

              {result.marks.map(
                (m, index) => (

                  <div
                    key={index}

                    className="
                    bg-slate-900/60
                    border
                    border-white/10
                    rounded-3xl
                    p-6
                    "
                  >

                    <div
                      className="
                      flex
                      justify-between
                      items-center
                      mb-5
                      "
                    >

                      <div
                        className="
                        flex
                        items-center
                        gap-3
                        "
                      >

                        <Hash
                          className="
                          text-cyan-400
                          "
                        />

                        <h3
                          className="
                          text-2xl
                          font-bold
                          "
                        >
                          Question {m.questionNo}
                        </h3>

                      </div>

                      <div
                        className="
                        bg-green-500/10
                        border
                        border-green-500/20
                        px-5
                        py-2
                        rounded-xl
                        "
                      >

                        <p
                          className="
                          text-green-400
                          font-bold
                          "
                        >
                          {m.obtainedMarks}
                          {" / "}
                          {m.maxMarks}
                        </p>

                      </div>
                    </div>

                    {/* QUESTION */}

                    <div className="mb-5">

                      <p
                        className="
                        text-cyan-400
                        font-semibold
                        mb-2
                        "
                      >
                        Question
                      </p>

                      <p
                        className="
                        text-gray-300
                        leading-7
                        "
                      >
                        {m.question}
                      </p>

                    </div>

                    {/* FEEDBACK */}

                    <div
                      className="
                      flex
                      items-start
                      gap-3
                      "
                    >

                      <CheckCircle2
                        className="
                        text-cyan-400
                        mt-1
                        "
                      />

                      <div>

                        <p
                          className="
                          text-cyan-400
                          font-semibold
                          mb-1
                          "
                        >
                          Feedback
                        </p>

                        <p
                          className="
                          text-gray-300
                          leading-7
                          "
                        >
                          {m.feedback}
                        </p>

                      </div>
                    </div>

                  </div>
                )
              )}
            </div>

            {/* FOOTER */}

            <div
              className="
              mt-8
              bg-purple-500/10
              border
              border-purple-500/20
              p-5
              rounded-2xl
              "
            >

              <div
                className="
                flex
                items-center
                gap-3
                "
              >

                <Sparkles
                  className="
                  text-purple-400
                  "
                />

                <p className="text-gray-300">

                  Evaluated using
                  {" "}

                  <span className="font-bold">
                    Groq AI
                  </span>

                  {" "}
                  in
                  {" "}

                  <span className="text-cyan-400">
                    {result.checkingMode}
                  </span>

                  {" "}
                  mode.

                </p>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AIEvaluation;