// src/pages/UploadQuestionPaper.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  UploadCloud,
  BookOpen,
  FileBadge,
  Hash,
  Sparkles,
  FileText,
  Code2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

function UploadQuestionPaper() {

  const [subject, setSubject] =
    useState("");

  const [subjectCode, setSubjectCode] =
    useState("");

  const [examName, setExamName] =
    useState("EVEN SEMESTER");

  const [session, setSession] =
    useState("2025-26");

  const [totalMarks, setTotalMarks] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [dragging, setDragging] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [detectedQuestions,
    setDetectedQuestions] =
    useState([]);

  const [paperId, setPaperId] = useState(null);

  const navigate = useNavigate();

  // HANDLE FILE

  const handleFile = (file) => {

    if (!file) return;

    setFile(file);
  };

  // DRAG DROP

  const handleDrop = (e) => {

    e.preventDefault();

    setDragging(false);

    const droppedFile =
      e.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  // UPLOAD QUESTION PAPER

  const uploadQuestionPaper =
    async () => {
      try {
        if (
          !subject ||
          !subjectCode ||
          !examName ||
          !session ||
          !totalMarks ||
          !file
        ) {

          alert("Please fill all fields");

          return;
        }

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "subject",
          subject
        );

        formData.append(
          "subjectCode",
          subjectCode
        );

        formData.append(
          "examName",
          examName
        );

        formData.append(
          "session",
          session
        );

        formData.append(
          "totalMarks",
          totalMarks
        );

        formData.append(
          "questionPaper",
          file
        );

        const res =
          await axios.post(

            "http://localhost:5001/api/question-papers/upload",

            formData,

            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        console.log(res.data.questions);

        setDetectedQuestions(
          res.data.questions|| []
        );
        
        if (res.data.paper && res.data.paper._id) {
          setPaperId(res.data.paper._id);
        }

        alert(
          "Question Paper Uploaded Successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Upload Failed: " + (error.response?.data?.message || error.message)
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
      overflow-hidden
      relative
      "
    >

      {/* BACKGROUND */}

      <div
        className="
        absolute
        top-0
        left-0
        w-[400px]
        h-[400px]
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
        w-[400px]
        h-[400px]
        bg-blue-500/10
        blur-3xl
        rounded-full
        "
      />

      {/* MAIN */}

      <div
        className="
        relative
        z-10
        max-w-6xl
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
              <Sparkles size={38} />
            </div>

            <div>

              <h1
                className="
                text-5xl
                font-black
                "
              >
                Upload Question Paper
              </h1>

              <p
                className="
                text-gray-400
                mt-2
                text-lg
                "
              >
                AI Based Digital Evaluation System
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

          {/* GRID */}

          <div
            className="
            grid
            md:grid-cols-2
            gap-6
            mb-8
            "
          >

            {/* SUBJECT */}

            <div>

              <label
                className="
                flex
                items-center
                gap-2
                text-gray-300
                mb-3
                "
              >
                <BookOpen size={18} />

                Subject Name
              </label>

              <input
                type="text"

                value={subject}

                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }

                placeholder="Java Programming"

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
              />
            </div>

            {/* SUBJECT CODE */}

            <div>

              <label
                className="
                flex
                items-center
                gap-2
                text-gray-300
                mb-3
                "
              >
                <Code2 size={18} />

                Subject Code
              </label>

              <input
                type="text"

                value={subjectCode}

                onChange={(e) =>
                  setSubjectCode(
                    e.target.value
                  )
                }

                placeholder="KCS301"

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
              />
            </div>

            {/* EXAM NAME */}

            <div>

              <label
                className="
                flex
                items-center
                gap-2
                text-gray-300
                mb-3
                "
              >
                <FileBadge size={18} />

                Exam Name
              </label>

              <select

                value={examName}

                onChange={(e) =>
                  setExamName(
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

                <option>
                  EVEN SEMESTER
                </option>

                <option>
                  ODD SEMESTER
                </option>

                <option>
                  ST-1
                </option>

                <option>
                  ST-2
                </option>

                <option>
                  ST-3
                </option>

              </select>
            </div>

            {/* SESSION */}

            <div>

              <label
                className="
                flex
                items-center
                gap-2
                text-gray-300
                mb-3
                "
              >
                <CalendarDays size={18} />

                Session
              </label>

              <select

                value={session}

                onChange={(e) =>
                  setSession(
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

                <option>
                  2025-26
                </option>

                <option>
                  2026-27
                </option>

              </select>
            </div>
          </div>

          {/* TOTAL MARKS */}

          <div className="mb-8">

            <label
              className="
              flex
              items-center
              gap-2
              text-gray-300
              mb-3
              "
            >
              <Hash size={18} />

              Total Marks
            </label>

            <input
              type="number"

              value={totalMarks}

              onChange={(e) =>
                setTotalMarks(
                  e.target.value
                )
              }

              placeholder="100"

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
            />
          </div>

          {/* FILE UPLOAD */}

          <div className="mb-8">

            <label
              className="
              block
              text-gray-300
              mb-4
              "
            >
              Upload Question Paper
            </label>

            <div

              onDragOver={(e) => {

                e.preventDefault();

                setDragging(true);
              }}

              onDragLeave={() =>
                setDragging(false)
              }

              onDrop={handleDrop}

              className={`
              border-2
              border-dashed
              rounded-3xl
              p-12
              text-center
              transition-all
              cursor-pointer

              ${dragging
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-white/10 bg-slate-900/40"
                }
              `}
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
                Drag & Drop File
              </h2>

              <p
                className="
                text-gray-400
                mt-3
                "
              >
                PDF, PNG, JPG Supported
              </p>

              <input
                type="file"

                accept="
                .pdf,
                .png,
                .jpg,
                .jpeg
                "

                onChange={(e) =>
                  handleFile(
                    e.target.files[0]
                  )
                }

                className="
                mt-6
                "
              />

            </div>

            {/* FILE PREVIEW */}

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

                <div
                  className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-cyan-500/20
                  flex
                  items-center
                  justify-center
                  "
                >

                  <FileText
                    className="
                    text-cyan-400
                    "
                  />

                </div>

                <div>

                  <p
                    className="
                    font-bold
                    text-lg
                    "
                  >
                    {file.name}
                  </p>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    {(
                      file.size / 1024
                    ).toFixed(2)}
                    {" "}
                    KB
                  </p>

                </div>
              </div>
            )}
          </div>

          {/* BUTTON */}

          <button
            onClick={
              uploadQuestionPaper
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

            {loading
              ? "Uploading..."
              : "Upload Question Paper"}
          </button>

        </div>

        {/* DETECTED QUESTIONS */}

        {detectedQuestions.length > 0 && (

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
              items-center
              gap-4
              mb-8
              "
            >

              <div
                className="
                w-16
                h-16
                rounded-2xl
                bg-green-500/20
                flex
                items-center
                justify-center
                "
              >
                <ClipboardList
                  className="
                  text-green-400
                  "
                  size={30}
                />
              </div>

              <div>

                <h2
                  className="
                  text-4xl
                  font-black
                  "
                >
                  Detected Questions
                </h2>

                <p className="text-gray-400 mt-2">
                  Questions extracted using OCR
                </p>

              </div>
              
              <div className="ml-auto">
                <button
                  onClick={() => navigate(`/question-editor/${paperId}`)}
                  className="
                  px-6
                  py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  text-white
                  font-bold
                  hover:scale-105
                  transition-transform
                  shadow-lg
                  shadow-cyan-500/20
                  "
                >
                  Edit Questions & Marks
                </button>
              </div>
            </div>

            <div className="space-y-6">

              {detectedQuestions.map(
                (q, index) => (

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

                        <CheckCircle2
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
                          Question {q.qNo}
                        </h3>

                      </div>

                      <div
                        className="
                        bg-cyan-500/10
                        border
                        border-cyan-500/20
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
                      text-lg
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
      </div>
    </div>
  );
}

export default UploadQuestionPaper;