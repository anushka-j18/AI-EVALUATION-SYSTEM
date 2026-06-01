import { useState, useEffect } from "react";
import axios from "axios";
import api from "../api/axiosConfig";
import { UploadCloud, User, Hash, FileText, Loader2, Sparkles } from "lucide-react";

function UploadAnswerSheet() {
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [questionPaperId, setQuestionPaperId] = useState("");
  const [file, setFile] = useState(null);
  
  const [questionPapers, setQuestionPapers] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available question papers to link the answer sheet to
    const fetchPapers = async () => {
      try {
        const res = await api.get("/question-papers");
        setQuestionPapers(res.data.papers);
        if (res.data.papers.length > 0) {
          setQuestionPaperId(res.data.papers[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch question papers", error);
      }
    };
    fetchPapers();
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    setFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const uploadAnswerSheet = async () => {
    if (!studentName || !rollNumber || !questionPaperId || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("studentName", studentName);
    formData.append("rollNumber", rollNumber);
    formData.append("questionPaperId", questionPaperId);
    formData.append("answerSheet", file);

    try {
      // Must use the token if the route is protected
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      
      const res = await axios.post(
        "http://localhost:5001/api/answer-sheets/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );

      alert("Answer Sheet Uploaded Successfully! It is now available for assignment.");
      
      // Reset form
      setStudentName("");
      setRollNumber("");
      setFile(null);
      
    } catch (error) {
      console.log(error);
      alert("Upload Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative p-6 lg:p-12">
      {/* BACKGROUND */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/20">
            <Sparkles size={38} />
          </div>
          <div>
            <h1 className="text-5xl font-black">Upload Answer Sheet</h1>
            <p className="text-gray-400 mt-2 text-lg">
              Submit a student's answer script into the system for evaluation.
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl p-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Student Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 mb-3">
                <User size={18} /> Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="flex items-center gap-2 text-gray-300 mb-3">
                <Hash size={18} /> Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="CS2026001"
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Question Paper Link */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-gray-300 mb-3">
                <FileText size={18} /> Link to Question Paper
              </label>
              <select
                value={questionPaperId}
                onChange={(e) => setQuestionPaperId(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {questionPapers.length === 0 ? (
                  <option value="">No Question Papers Found (Upload one first!)</option>
                ) : (
                  questionPapers.map(paper => (
                    <option key={paper._id} value={paper._id}>
                      {paper.subject} ({paper.subjectCode}) - {paper.examName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* FILE UPLOAD */}
          <div className="mb-8">
            <label className="block text-gray-300 mb-4">Upload Answer Script File</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                dragging ? "border-green-400 bg-green-500/10" : "border-white/10 bg-slate-900/40"
              }`}
            >
              <UploadCloud size={70} className="mx-auto text-green-400 mb-5" />
              <h2 className="text-2xl font-bold">Drag & Drop File</h2>
              <p className="text-gray-400 mt-3">PDF, PNG, JPG Supported</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handleFile(e.target.files[0])}
                className="mt-6"
              />
            </div>

            {/* FILE PREVIEW */}
            {file && (
              <div className="mt-5 bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <FileText className="text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-lg">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={uploadAnswerSheet}
            disabled={loading || questionPapers.length === 0}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 text-xl font-bold hover:scale-[1.01] transition shadow-2xl shadow-green-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Upload Answer Sheet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadAnswerSheet;
