import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Award, Settings, CheckCircle, Clock } from "lucide-react";

const AdminResults = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await api.get("/admin/exams");
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleGenerate = async (examId) => {
    setGeneratingFor(examId);
    try {
      const res = await api.post(`/admin/exams/${examId}/generate-results`);
      alert(res.data.message);
      if (selectedExamId === examId) {
        fetchResults(examId);
      }
    } catch (err) {
      alert("Failed to generate results.");
    } finally {
      setGeneratingFor(null);
    }
  };

  const fetchResults = async (examId) => {
    setSelectedExamId(examId);
    setLoadingResults(true);
    try {
      const res = await api.get(`/admin/exams/${examId}/results`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  const togglePublishStatus = async (resultId, currentStatus) => {
    try {
      await api.put(`/admin/exams/result/${resultId}/publish`, { isPublished: !currentStatus });
      fetchResults(selectedExamId);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="text-blue-500" /> Exam Results Generation
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Select Exam</h2>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : exams.length === 0 ? (
              <div className="text-sm text-slate-500">No exams available.</div>
            ) : (
              <div className="space-y-3">
                {exams.map(exam => (
                  <div key={exam._id} 
                       className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedExamId === exam._id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}
                       onClick={() => fetchResults(exam._id)}>
                    <h3 className="font-bold text-slate-700">{exam.name}</h3>
                    <div className="flex items-center justify-end mt-3">
                      <button onClick={(e) => { e.stopPropagation(); handleGenerate(exam._id); }} disabled={generatingFor === exam._id}
                              className="px-3 py-1 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-1">
                        {generatingFor === exam._id ? <Loader2 size={12} className="animate-spin" /> : <Settings size={12} />} Generate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60 min-h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               Generated Results
            </h2>
            {!selectedExamId ? (
              <div className="flex items-center justify-center h-40 text-slate-500">Select an exam to view results</div>
            ) : loadingResults ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : results.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No results generated for this exam yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="py-3 px-4 font-bold text-slate-600">Student Name</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Total Marks</th>
                      <th className="py-3 px-4 font-bold text-slate-600">% / Grade</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Status</th>
                      <th className="py-3 px-4 font-bold text-slate-600 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(res => (
                      <tr key={res._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{res.student?.name}</td>
                        <td className="py-3 px-4">{res.totalMarksObtained} / {res.totalMaxMarks}</td>
                        <td className="py-3 px-4 font-bold text-blue-600">{res.percentage}% ({res.grade})</td>
                        <td className="py-3 px-4">
                          {res.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              <CheckCircle size={12} /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                              <Clock size={12} /> Draft
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => togglePublishStatus(res._id, res.isPublished)}
                                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
                            {res.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
