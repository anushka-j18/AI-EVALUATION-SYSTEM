import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, FileBadge, Calendar, Settings } from "lucide-react";

const AdminAdmitCards = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [admitCards, setAdmitCards] = useState([]);
  const [registrations, setRegistrations] = useState([]);
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

  const fetchAdmitCardsAndRegistrations = async (examId) => {
    setSelectedExamId(examId);
    setLoadingCards(true);
    try {
      const [admitRes, regRes] = await Promise.all([
        api.get(`/admin/exams/${examId}/admit-cards`),
        api.get(`/admin/exams/${examId}/registrations`)
      ]);
      setAdmitCards(admitRes.data);
      // Only keep "Paid" registrations since only they are eligible
      setRegistrations(regRes.data.filter(r => r.feeStatus === "Paid"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleGenerate = async (examId) => {
    setGeneratingFor(examId);
    try {
      const res = await api.post(`/admin/exams/${examId}/generate-admit-cards`);
      alert(res.data.message);
      if (selectedExamId === examId) {
        fetchAdmitCardsAndRegistrations(examId);
      }
    } catch (err) {
      alert("Failed to generate admit cards.");
    } finally {
      setGeneratingFor(null);
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
                       onClick={() => fetchAdmitCardsAndRegistrations(exam._id)}>
                    <h3 className="font-bold text-slate-700">{exam.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12}/> {new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 Eligible Students & Admit Cards
              </h2>
              {selectedExamId && (
                <button onClick={() => handleGenerate(selectedExamId)} disabled={generatingFor === selectedExamId}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  {generatingFor === selectedExamId ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />} 
                  Release Admit Cards
                </button>
              )}
            </div>
            
            {!selectedExamId ? (
              <div className="flex items-center justify-center h-40 text-slate-500">Select an exam to view students eligible for admit cards</div>
            ) : loadingCards ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : registrations.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No students have paid fees for this exam yet. Cannot release admit cards.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="py-3 px-4 font-bold text-slate-600">Student Name</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Reg No</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Fee Status</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Admit Card Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => {
                      const card = admitCards.find(c => c.student?._id === reg.student?._id);
                      return (
                        <tr key={reg._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-medium">{reg.student?.name}</td>
                          <td className="py-3 px-4">{reg.student?.registrationNumber}</td>
                          <td className="py-3 px-4 text-green-600 font-bold">Paid</td>
                          <td className="py-3 px-4">
                            {card ? (
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">Generated</span>
                                <div className="font-mono text-xs text-slate-500">{card.uniqueId}</div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending Release</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
