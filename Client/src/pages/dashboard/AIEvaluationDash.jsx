import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Brain, Check, X, AlertCircle } from "lucide-react";

const AIEvaluationDash = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

const fetchEvaluations = async () => {
    try {
      // Get all evaluations that have an aiEvaluationId
      const res = await api.get("/dashboard/recent-activities");
      const evalsWithAi = res.data.activities.filter(a => a.aiEvaluationId);
      setEvaluations(evalsWithAi);
    } catch (error) {
      console.error("Failed to fetch evals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  

  const handleSelect = async (evalId) => {
    setSelectedEval(evalId);
    setLoadingCompare(true);
    try {
      const res = await api.get(`/teacher-evaluations/${evalId}/ai-comparison`);
      setComparison(res.data);
    } catch (error) {
      console.error("Comparison error:", error);
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shrink-0 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
            <Brain className="text-purple-500" size={28} />
          </div>
          AI Evaluation Results
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Review AI-generated marks and feedback for your scripts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: List of scripts with AI evals */}
        <div className="lg:col-span-1 bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] h-fit max-h-[80vh] overflow-y-auto">
          <h2 className="font-black text-slate-800 mb-6 text-xl">Scripts with AI Data</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
          ) : evaluations.length > 0 ? (
            <div className="space-y-4">
              {evaluations.map((ev) => (
                <button
                  key={ev._id}
                  onClick={() => handleSelect(ev._id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all font-medium ${
                    selectedEval === ev._id
                      ? "bg-[#f1f5f9] text-purple-600 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
                      : "bg-[#f1f5f9] text-slate-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="font-bold truncate text-slate-800">{ev.studentName}</div>
                  <div className={`text-xs mt-1 ${selectedEval === ev._id ? "text-purple-400" : "text-slate-400"}`}>Roll: {ev.rollNumber}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm font-medium bg-[#f1f5f9] rounded-2xl shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
              Run AI Evaluation from the Digital Evaluation panel first.
            </div>
          )}
        </div>

        {/* Right Col: Comparison details */}
        <div className="lg:col-span-2">
          {selectedEval && comparison ? (
            <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-8 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/60 pb-6 gap-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{comparison.evaluation.studentName}</h2>
                  <p className="text-purple-500 font-bold text-sm mt-1">AI vs Teacher Comparison</p>
                </div>
                <div className="flex gap-8 text-center bg-[#f1f5f9] p-4 rounded-2xl shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Teacher Total</div>
                    <div className="text-2xl font-black text-blue-600">{comparison.evaluation.totalMarks}</div>
                  </div>
                  <div className="w-px bg-slate-300"></div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">AI Total</div>
                    <div className="text-2xl font-black text-purple-600">{comparison.aiEvaluation.totalAiMarks}</div>
                  </div>
                </div>
              </div>

              {loadingCompare ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {comparison.aiEvaluation.questionWiseResults.map((aiResult, idx) => {
                    const teacherResult = comparison.evaluation.questionWiseMarks.find(
                      (t) => t.questionNo === aiResult.questionNo
                    );
                    
                    const diff = teacherResult ? teacherResult.obtainedMarks - aiResult.aiMarks : 0;
                    
                    return (
                      <div key={idx} className="bg-[#f1f5f9] rounded-3xl p-6 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div className="font-black text-slate-800 text-lg">Q{aiResult.questionNo}.</div>
                          <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-[#f1f5f9] text-blue-600 font-bold rounded-xl text-sm shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
                              Teacher: {teacherResult ? teacherResult.obtainedMarks : 0}
                            </div>
                            <div className="px-4 py-2 bg-[#f1f5f9] text-purple-600 font-bold rounded-xl text-sm shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
                              AI: {aiResult.aiMarks}
                            </div>
                            <div className="px-4 py-2 bg-[#f1f5f9] text-slate-500 font-bold rounded-xl text-sm shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
                              Max: {aiResult.maxMarks}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                          <div className="bg-[#f1f5f9] p-5 rounded-2xl shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                            <div className="text-blue-600 font-black mb-3 flex items-center gap-2 text-base">
                              Teacher Feedback
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed">{teacherResult?.comment || "No comment provided."}</p>
                          </div>
                          
                          <div className="bg-[#f1f5f9] p-5 rounded-2xl shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                            <div className="text-purple-600 font-black mb-3 flex items-center gap-2 text-base">
                              <Brain size={16} /> AI Analysis
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed">{aiResult.aiFeedback}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-[#f1f5f9] border border-white/80 rounded-[3rem] shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
              <div className="w-24 h-24 bg-[#f1f5f9] rounded-3xl flex items-center justify-center mb-6 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                <Brain size={48} className="text-purple-400" />
              </div>
              <p className="font-medium text-lg">Select a script from the list to view the AI comparison.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEvaluationDash;
