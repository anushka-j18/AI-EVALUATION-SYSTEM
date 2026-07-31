import { useState, useEffect } from "react";

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
      const res = await api.post(
        "/answer-sheets/upload-bulk",
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
    <div className="min-h-screen text-slate-800 overflow-hidden relative p-6 lg:p-12">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-[#f1f5f9] flex items-center justify-center shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] text-blue-600">
            <Sparkles size={38} />
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-800">Bulk Upload Answer Sheets</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Upload multiple student answer scripts simultaneously for evaluation.
            </p>
          </div>
        </div>

        <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-8 md:p-12 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
          {/* Question Paper Selection */}
          <div className="mb-10">
            <label className="flex items-center gap-2 text-slate-600 font-bold mb-4">
              <FileText size={18} /> Link all uploads to Question Paper:
            </label>
            <select
              value={questionPaperId}
              onChange={(e) => setQuestionPaperId(e.target.value)}
              className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] p-5 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
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
          <div className="mb-10">
            <label className="block text-slate-600 font-bold mb-4">Select Files (You can select multiple)</label>
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
              <h2 className="text-2xl font-black text-slate-800">Drag & Drop Files Here</h2>
              <p className="text-slate-500 font-medium mt-3">PDF, PNG, JPG Supported</p>
              <label className="mt-8 inline-block bg-[#f1f5f9] text-blue-600 font-bold px-8 py-3 rounded-full cursor-pointer transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
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
            <div className="mb-10">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center justify-between">
                <span>Selected Files ({filesData.length})</span>
                <button onClick={() => setFilesData([])} className="text-sm font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                  <Trash2 size={16} /> Clear All
                </button>
              </h3>
              <div className="bg-[#f1f5f9] rounded-[2rem] overflow-hidden border border-white/80 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
                <table className="w-full text-left">
                  <thead className="bg-white/40 text-slate-500 text-xs uppercase font-bold border-b border-white/60">
                    <tr>
                      <th className="p-5 w-1/3">Filename</th>
                      <th className="p-5 w-1/3">Student Name</th>
                      <th className="p-5 w-1/4">Roll Number</th>
                      <th className="p-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/60">
                    {filesData.map((f) => (
                      <tr key={f.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] flex flex-shrink-0 items-center justify-center">
                              <FileText size={18} className="text-blue-600" />
                            </div>
                            <span className="truncate text-sm font-bold text-slate-700" title={f.file.name}>{f.file.name}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <input 
                            type="text" 
                            placeholder="e.g. Jane Doe"
                            value={f.studentName}
                            onChange={(e) => updateFileData(f.id, 'studentName', e.target.value)}
                            className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
                          />
                        </td>
                        <td className="p-5">
                          <input 
                            type="text" 
                            placeholder="e.g. CS2026001"
                            value={f.rollNumber}
                            onChange={(e) => updateFileData(f.id, 'rollNumber', e.target.value)}
                            className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
                          />
                        </td>
                        <td className="p-5 text-center">
                          <button onClick={() => removeFile(f.id)} className="w-10 h-10 rounded-full bg-[#f1f5f9] shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center mx-auto text-red-500 hover:text-red-600 transition-all">
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
            className="w-full py-5 rounded-[1.5rem] bg-[#f1f5f9] text-blue-600 text-xl font-black transition-all shadow-[8px_8px_16px_#cbd5e1,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {loading ? <><Loader2 className="animate-spin" /> Uploading...</> : `Upload All ${filesData.length > 0 ? `(${filesData.length})` : ''} Scripts`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadAnswerSheet;
