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

  useEffect(() => {
    fetchScripts();
  }, []);

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
          <h1 className="text-3xl font-black text-white">Evaluated Scripts</h1>
          <p className="text-gray-400 mt-1">
            Review your completed evaluations
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by student name or roll no..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="space-y-4">
          {filteredScripts.map((script) => {
            const isExpanded = expandedId === script._id;
            const details = evaluationDetails[script._id];

            return (
              <div
                key={script._id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl"
              >
                {/* Header / Summary */}
                <div
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-white/5 transition-colors gap-4"
                  onClick={() => toggleExpand(script._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {script.studentName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Roll No: {script.rollNumber} | Subject:{" "}
                        {script.questionPaper?.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    {details && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-cyan-400">
                          {details.totalMarks} / {details.questionWiseMarks?.reduce((sum, qm) => sum + (Number(qm.maxMarks) || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                          Total Marks
                        </div>
                      </div>
                    )}
                    <button className="p-2 bg-slate-800 rounded-lg text-gray-400 hover:text-white">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-6 bg-slate-900/50">
                    {loadingDetails && !details ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                      </div>
                    ) : details ? (
                      <div className="space-y-6">
                        {/* Question Wise Breakdown */}
                        <div>
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Star size={18} className="text-yellow-400" />
                            Question Breakdown
                          </h4>
                          <div className="grid gap-3">
                            {details.questionWiseMarks.map((qm, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-800/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5"
                              >
                                <div>
                                  <span className="text-cyan-400 font-bold mr-2">
                                    Q{qm.questionNo}.
                                  </span>
                                  {qm.comment && (
                                    <span className="text-gray-300 text-sm">
                                      "{qm.comment}"
                                    </span>
                                  )}
                                </div>
                                <div className="shrink-0 bg-slate-900 px-4 py-2 rounded-lg font-mono text-sm border border-white/5 text-center">
                                  <span className="text-white font-bold">
                                    {qm.obtainedMarks}
                                  </span>
                                  <span className="text-gray-500 mx-1">/</span>
                                  <span className="text-gray-400">
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
                            <h4 className="text-lg font-bold text-white mb-2">
                              Overall Feedback
                            </h4>
                            <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl text-cyan-100">
                              {details.overallComments}
                            </div>
                          </div>
                        )}

                        {/* Evaluator Details */}
                        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-400">
                          <div>
                            <span className="font-bold text-white">Evaluator:</span> {details.teacher?.name || "Unknown"} 
                            <span className="mx-2">|</span> 
                            <span className="font-bold text-white">Faculty ID:</span> {details.teacher?.employeeId || "N/A"}
                          </div>
                          <div>
                            <span className="font-bold text-white">Evaluated On:</span> {details.submittedAt ? new Date(details.submittedAt).toLocaleDateString() : "N/A"} 
                            <span className="mx-2">at</span> 
                            {details.submittedAt ? new Date(details.submittedAt).toLocaleTimeString() : "N/A"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
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
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <CheckCircle size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No Evaluated Scripts
          </h3>
          <p className="text-gray-400">
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
