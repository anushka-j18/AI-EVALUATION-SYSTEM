import { useState, useEffect } from "react";
import axios from "axios";
import api from "../api/axiosConfig";
import { UploadCloud, FileText, Loader2, Sparkles, Trash2 } from "lucide-react";

function UploadAnswerSheet() {
  const [questionPaperId, setQuestionPaperId] = useState("");
  const [filesData, setFilesData] = useState([]); 
  const [questionPapers, setQuestionPapers] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available question papers to link the answer sheets to
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

  const handleFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    
    const newFilesData = Array.from(newFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      studentName: "",
      rollNumber: ""
    }));

    setFilesData(prev => [...prev, ...newFilesData]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const updateFileData = (id, field, value) => {
    setFilesData(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFile = (id) => {
    setFilesData(prev => prev.filter(f => f.id !== id));
  };

  const uploadAnswerSheets = async () => {
    if (!questionPaperId) {
      alert("Please select a Question Paper first.");
      return;
    }
    if (filesData.length === 0) {
      alert("Please add at least one answer sheet.");
      return;
    }

    // Validation
    for (let i = 0; i < filesData.length; i++) {
      if (!filesData[i].studentName || !filesData[i].rollNumber) {
        alert(`Please fill in the Student Name and Roll Number for file: ${filesData[i].file.name}`);
        return;
      }
    }

    setLoading(true);
    const formData = new FormData();
    const metadata = [];

    filesData.forEach((f) => {
      formData.append("answerSheets", f.file);
      metadata.push({
        studentName: f.studentName,
        rollNumber: f.rollNumber,
        questionPaperId: questionPaperId
      });
    });

    formData.append("metadata", JSON.stringify(metadata));

    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.post(
        "http://localhost:5001/api/answer-sheets/upload-bulk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${adminToken}`
          },
        }
      );

      alert(`Success! ${res.data.message}`);
      setFilesData([]); // Reset
    } catch (error) {
      console.log(error);
      alert("Upload Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative p-6 lg:p-12">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/20">
            <Sparkles size={38} />
          </div>
          <div>
            <h1 className="text-5xl font-black">Bulk Upload Answer Sheets</h1>
            <p className="text-gray-400 mt-2 text-lg">
              Upload multiple student answer scripts simultaneously for evaluation.
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl p-8 shadow-2xl">
          {/* Question Paper Selection */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-gray-300 mb-3">
              <FileText size={18} /> Link all uploads to Question Paper:
            </label>
            <select
              value={questionPaperId}
              onChange={(e) => setQuestionPaperId(e.target.value)}
              className="w-full bg-slate-900/70 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
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

          {/* FILE UPLOAD ZONE */}
          <div className="mb-8">
            <label className="block text-gray-300 mb-4">Select Files (You can select multiple)</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                dragging ? "border-green-400 bg-green-500/10" : "border-white/10 bg-slate-900/40 hover:bg-slate-900/60"
              }`}
            >
              <UploadCloud size={70} className="mx-auto text-green-400 mb-5" />
              <h2 className="text-2xl font-bold">Drag & Drop Files Here</h2>
              <p className="text-gray-400 mt-3">PDF, PNG, JPG Supported</p>
              <label className="mt-6 inline-block bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* FILES LIST TABLE */}
          {filesData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                <span>Selected Files ({filesData.length})</span>
                <button onClick={() => setFilesData([])} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 size={16} /> Clear All
                </button>
              </h3>
              <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-700">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="p-4 w-1/3">Filename</th>
                      <th className="p-4 w-1/3">Student Name</th>
                      <th className="p-4 w-1/4">Roll Number</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filesData.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex flex-shrink-0 items-center justify-center">
                              <FileText size={14} className="text-green-400" />
                            </div>
                            <span className="truncate text-sm" title={f.file.name}>{f.file.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <input 
                            type="text" 
                            placeholder="e.g. Jane Doe"
                            value={f.studentName}
                            onChange={(e) => updateFileData(f.id, 'studentName', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm focus:border-green-500 outline-none"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="text" 
                            placeholder="e.g. CS2026001"
                            value={f.rollNumber}
                            onChange={(e) => updateFileData(f.id, 'rollNumber', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm focus:border-green-500 outline-none"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => removeFile(f.id)} className="text-gray-500 hover:text-red-400">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={uploadAnswerSheets}
            disabled={loading || questionPapers.length === 0 || filesData.length === 0}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 text-xl font-bold hover:scale-[1.01] transition shadow-2xl shadow-green-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" /> Uploading...</> : `Upload All ${filesData.length > 0 ? `(${filesData.length})` : ''} Scripts`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadAnswerSheet;
