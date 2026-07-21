import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, FileBadge, Calendar, Settings } from "lucide-react";

const AdminAdmitCards = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [admitCards, setAdmitCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

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
      const res = await api.post(`/admin/exams/${examId}/generate-admit-cards`);
      alert(res.data.message);
      if (selectedExamId === examId) {
        fetchAdmitCards(examId);
      }
    } catch (err) {
      alert("Failed to generate admit cards.");
    } finally {
      setGeneratingFor(null);
    }
  };

  const fetchAdmitCards = async (examId) => {
    setSelectedExamId(examId);
    setLoadingCards(true);
    try {
      const res = await api.get(`/admin/exams/${examId}/admit-cards`);
      setAdmitCards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCards(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileBadge className="text-blue-500" /> Admit Cards
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
                       onClick={() => fetchAdmitCards(exam._id)}>
                    <h3 className="font-bold text-slate-700">{exam.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12}/> {new Date(exam.date).toLocaleDateString()}</span>
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
               Generated Admit Cards
            </h2>
            {!selectedExamId ? (
              <div className="flex items-center justify-center h-40 text-slate-500">Select an exam to view admit cards</div>
            ) : loadingCards ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : admitCards.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No admit cards generated for this exam yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="py-3 px-4 font-bold text-slate-600">Student Name</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Reg No</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Unique ID (QR)</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Generated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admitCards.map(card => (
                      <tr key={card._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{card.student?.name}</td>
                        <td className="py-3 px-4">{card.student?.registrationNumber}</td>
                        <td className="py-3 px-4 font-mono text-sm text-blue-600">{card.uniqueId}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{new Date(card.generatedAt).toLocaleDateString()}</td>
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

export default AdminAdmitCards;
