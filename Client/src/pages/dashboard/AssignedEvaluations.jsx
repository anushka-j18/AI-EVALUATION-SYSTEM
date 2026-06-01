import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import ScriptCard from "../../components/dashboard/ScriptCard";
import { Loader2, Search, ClipboardX, PenTool } from "lucide-react";

const AssignedEvaluations = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startingId, setStartingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await api.get("/answer-sheets/assigned");
      setScripts(res.data.scripts);
    } catch (error) {
      console.error("Failed to fetch assigned scripts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async (script) => {
    setStartingId(script._id);
    try {
      // First try to start an evaluation (will return existing if already drafted)
      await api.post(`/teacher-evaluations/start/${script._id}`);
      
      // Navigate to digital evaluation interface
      navigate(`/dashboard/digital-evaluation/${script._id}`);
    } catch (error) {
      console.error("Start evaluation error:", error);
      alert("Failed to start evaluation.");
      setStartingId(null);
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
          <h1 className="text-3xl font-black text-white">Assigned Evaluations</h1>
          <p className="text-gray-400 mt-1">
            Scripts assigned to you for evaluation
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <ScriptCard
              key={script._id}
              script={script}
              actionLabel={
                startingId === script._id
                  ? "Loading..."
                  : script.status === "pending"
                  ? "Resume Evaluation"
                  : "Start Evaluation"
              }
              onAction={handleStartEvaluation}
              showStatus={true}
              actionIcon={<PenTool size={18} />}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <ClipboardX size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No Assigned Scripts
          </h3>
          <p className="text-gray-400">
            {search
              ? "No assigned scripts match your filter."
              : "You don't have any scripts assigned to you right now. Go to Available Scripts to claim some."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignedEvaluations;
