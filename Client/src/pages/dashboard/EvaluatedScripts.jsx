import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Search, CheckCircle, ChevronDown, ChevronUp, Star } from "lucide-react";

const EvaluatedScripts = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

const fetchScripts = async () => {
    try {
      const res = await api.get("/answer-sheets/evaluated");
      setScripts(res.data.scripts);
    } catch (error) {
      console.error("Failed to fetch evaluated scripts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  

  const toggleExpand = async (scriptId) => {
    if (expandedId === scriptId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(scriptId);

    if (!evaluationDetails[scriptId]) {
      setLoadingDetails(true);
      try {
        const res = await api.get(`/teacher-evaluations/by-sheet/${scriptId}`);
        setEvaluationDetails((prev) => ({
          ...prev,
          [scriptId]: res.data.evaluation,
        }));
      } catch (error) {
        console.error("Failed to fetch evaluation details:", error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const filteredScripts = scripts.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Evaluated Scripts</h1>
          <p className="text-slate-500 font-medium mt-1">
            Review your completed evaluations
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by student name or roll no..."
            className="w-full bg-[#f1f5f9] border-none rounded-2xl py-4 pl-14 pr-4 text-slate-800 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff] transition-shadow font-medium"
          />
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="space-y-6">
          {filteredScripts.map((script) => {
            const isExpanded = expandedId === script._id;
            const details = evaluationDetails[script._id];

            return (
              <div
                key={script._id}
                className="bg-[#f1f5f9] border border-white/80 rounded-3xl overflow-hidden shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]"
              >
                {/* Header / Summary */}
                <div
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer transition-colors gap-4"
                  onClick={() => toggleExpand(script._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] text-emerald-500 flex items-center justify-center shrink-0 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">
                        {script.studentName}
                      </h3>
                      <p className="text-slate-500 font-medium text-sm mt-1">
                        Roll No: {script.rollNumber} | Subject:{" "}
                        {script.questionPaper?.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    {details && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-600">
                          {details.totalMarks} / {details.questionWiseMarks?.reduce((sum, qm) => sum + (Number(qm.maxMarks) || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">
                          Total Marks
                        </div>
                      </div>
                    )}
                    <button className="p-3 bg-[#f1f5f9] rounded-2xl text-slate-500 hover:text-blue-600 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/60 p-6 bg-[#f1f5f9] shadow-[inset_10px_10px_20px_#cbd5e1,inset_-10px_-10px_20px_#ffffff]">
                    {loadingDetails && !details ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    ) : details ? (
                      <div className="space-y-6">
                        {/* Question Wise Breakdown */}
                        <div>
                          <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Star size={20} className="text-amber-400" />
                            Question Breakdown
                          </h4>
                          <div className="grid gap-4">
                            {details.questionWiseMarks.map((qm, idx) => (
                              <div
                                key={idx}
                                className="bg-[#f1f5f9] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]"
                              >
                                <div>
                                  <span className="text-blue-600 font-black mr-2">
                                    Q{qm.questionNo}.
                                  </span>
                                  {qm.comment && (
                                    <span className="text-slate-500 font-medium text-sm">
                                      "{qm.comment}"
                                    </span>
                                  )}
                                </div>
                                <div className="shrink-0 bg-[#f1f5f9] px-4 py-2 rounded-xl font-mono text-sm shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] text-center">
                                  <span className="text-slate-800 font-black">
                                    {qm.obtainedMarks}
                                  </span>
                                  <span className="text-slate-400 mx-1">/</span>
                                  <span className="text-slate-500 font-bold">
                                    {qm.maxMarks}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Overall Comments */}
                        {details.overallComments && (
                          <div>
                            <h4 className="text-lg font-black text-slate-800 mb-3">
                              Overall Feedback
                            </h4>
                            <div className="bg-[#f1f5f9] shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] p-5 rounded-2xl text-slate-600 font-medium">
                              {details.overallComments}
                            </div>
                          </div>
                        )}

                        {/* Evaluator Details */}
                        <div className="pt-6 mt-6 border-t border-white/60 flex flex-col md:flex-row md:items-center justify-between text-sm text-slate-500 font-medium">
                          <div>
                            <span className="font-bold text-slate-800">Evaluator:</span> {details.teacherId?.name || "Unknown"} 
                            <span className="mx-2">|</span> 
                            <span className="font-bold text-slate-800">Faculty ID:</span> {details.teacherId?.employeeId || "N/A"}
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className="font-bold text-slate-800">Evaluated On:</span> {details.submittedAt ? new Date(details.submittedAt).toLocaleDateString() : "N/A"} 
                            <span className="mx-2">at</span> 
                            {details.submittedAt ? new Date(details.submittedAt).toLocaleTimeString() : "N/A"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 font-medium py-4">
                        Failed to load details.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-12 text-center shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
          <div className="w-24 h-24 bg-[#f1f5f9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
            <CheckCircle size={40} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            No Evaluated Scripts
          </h3>
          <p className="text-slate-500 font-medium">
            {search
              ? "No evaluated scripts match your filter."
              : "You haven't completed any evaluations yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluatedScripts;
