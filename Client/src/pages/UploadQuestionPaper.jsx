// src/pages/UploadQuestionPaper.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

import DetectedQuestionsEditor from "./DetectedQuestionsEditor";
import {
  UploadCloud,
  BookOpen,
  FileBadge,
  Hash,
  Sparkles,
  FileText,
  Code2,
  CalendarDays,
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
          await api.post(

            "/question-papers/upload",

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
    <div className="min-h-screen text-slate-800 overflow-hidden relative p-6 lg:p-12">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-[#f1f5f9] flex items-center justify-center shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] text-blue-600">
            <Sparkles size={38} />
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-800">Upload Question Paper</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              AI Based Digital Evaluation System
            </p>
          </div>
        </div>

        <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-8 md:p-12 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center gap-2 text-slate-600 font-bold mb-3">
                <BookOpen size={18} /> Subject Name
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Java Programming"
                className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] p-5 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-600 font-bold mb-3">
                <Code2 size={18} /> Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="KCS301"
                className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] p-5 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-600 font-bold mb-3">
                <FileBadge size={18} /> Exam Name
              </label>
              <select
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] p-5 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
              >
                <option>EVEN SEMESTER</option>
                <option>ODD SEMESTER</option>
                <option>ST-1</option>
                <option>ST-2</option>
                <option>ST-3</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-slate-600 font-bold mb-3">
                <CalendarDays size={18} /> Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] p-5 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
              >
                <option>2025-26</option>
                <option>2026-27</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-2 text-slate-600 font-bold mb-3">
              <Hash size={18} /> Total Marks
            </label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="100"
              className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] p-5 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
            />
          </div>

          <div className="mb-10">
            <label className="block text-slate-600 font-bold mb-4">Upload Question Paper</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-[3px] border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer ${
                dragging ? "border-blue-400 bg-blue-500/5 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" : "border-slate-300 bg-[#f1f5f9] hover:border-blue-400/50 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
              }`}
            >
              <div className="w-24 h-24 rounded-full bg-[#f1f5f9] shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] flex items-center justify-center mx-auto mb-6 text-blue-600">
                <UploadCloud size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Drag & Drop File Here</h2>
              <p className="text-slate-500 font-medium mt-3">PDF, PNG, JPG Supported</p>
              <label className="mt-8 inline-block bg-[#f1f5f9] text-blue-600 font-bold px-8 py-3 rounded-full cursor-pointer transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                Browse File
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {file && (
              <div className="mt-6 bg-[#f1f5f9] border border-white/60 p-5 rounded-2xl flex items-center gap-4 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                  <FileText className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-800">{file.name}</p>
                  <p className="text-slate-500 font-medium text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={uploadQuestionPaper}
            disabled={loading}
            className="w-full py-5 rounded-[1.5rem] bg-[#f1f5f9] text-blue-600 text-xl font-black transition-all shadow-[8px_8px_16px_#cbd5e1,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {loading ? "Uploading..." : "Upload Question Paper"}
          </button>
        </div>

        {paperId && (
          <DetectedQuestionsEditor 
            paperId={paperId} 
            initialQuestions={detectedQuestions} 
            expectedTotalMarks={totalMarks} 
          />
        )}
      </div>
    </div>
  );
}

export default UploadQuestionPaper;