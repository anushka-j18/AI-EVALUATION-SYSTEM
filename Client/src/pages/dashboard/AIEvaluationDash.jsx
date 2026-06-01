import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Brain, Check, X, AlertCircle } from "lucide-react";

const AIEvaluationDash = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

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
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Brain className="text-purple-500" size={32} />
          AI Evaluation Results
        </h1>
        <p className="text-gray-400 mt-1">
          Review AI-generated marks and feedback for your scripts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: List of scripts with AI evals */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-fit max-h-[80vh] overflow-y-auto">
          <h2 className="font-bold text-white mb-4">Scripts with AI Data</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : evaluations.length > 0 ? (
            <div className="space-y-3">
              {evaluations.map((ev) => (
                <button
                  key={ev._id}
                  onClick={() => handleSelect(ev._id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedEval === ev._id
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-slate-900/50 border-white/5 text-gray-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold truncate">{ev.studentName}</div>
                  <div className="text-xs opacity-70 mt-1">Roll: {ev.rollNumber}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm bg-slate-900/30 rounded-xl border border-dashed border-white/10">
              Run AI Evaluation from the Digital Evaluation panel first.
            </div>
          )}
        </div>

        {/* Right Col: Comparison details */}
        <div className="lg:col-span-2">
          {selectedEval && comparison ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
              
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{comparison.evaluation.studentName}</h2>
                  <p className="text-purple-400 text-sm mt-1">AI vs Teacher Comparison</p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-400">Teacher Total</div>
                    <div className="text-2xl font-bold text-cyan-400">{comparison.evaluation.totalMarks}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">AI Total</div>
                    <div className="text-2xl font-bold text-purple-400">{comparison.aiEvaluation.totalAiMarks}</div>
                  </div>
                </div>
              </div>

              {loadingCompare ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {comparison.aiEvaluation.questionWiseResults.map((aiResult, idx) => {
                    const teacherResult = comparison.evaluation.questionWiseMarks.find(
                      (t) => t.questionNo === aiResult.questionNo
                    );
                    
                    const diff = teacherResult ? teacherResult.obtainedMarks - aiResult.aiMarks : 0;
                    
                    return (
                      <div key={idx} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="font-bold text-white">Q{aiResult.questionNo}.</div>
                          <div className="flex gap-4">
                            <div className="px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded-lg text-sm border border-cyan-500/20">
                              Teacher: {teacherResult ? teacherResult.obtainedMarks : 0}
                            </div>
                            <div className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-lg text-sm border border-purple-500/20">
                              AI: {aiResult.aiMarks}
                            </div>
                            <div className="px-3 py-1 bg-slate-800 text-gray-300 rounded-lg text-sm border border-white/10">
                              Max: {aiResult.maxMarks}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                            <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                              Teacher Feedback
                            </div>
                            <p className="text-gray-300">{teacherResult?.comment || "No comment provided."}</p>
                          </div>
                          
                          <div className="bg-purple-950/20 p-4 rounded-xl border border-purple-500/10">
                            <div className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                              <Brain size={14} /> AI Analysis
                            </div>
                            <p className="text-purple-100/70">{aiResult.aiFeedback}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
              <Brain size={48} className="mb-4 opacity-50 text-purple-500" />
              <p>Select a script from the list to view the AI comparison.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEvaluationDash;
