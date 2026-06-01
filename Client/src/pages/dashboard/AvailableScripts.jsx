import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import ScriptCard from "../../components/dashboard/ScriptCard";
import { Loader2, Search, FileX } from "lucide-react";

const AvailableScripts = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [claimingId, setClaimingId] = useState(null);

  const fetchScripts = async (searchQuery = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/answer-sheets/available?search=${searchQuery}`);
      setScripts(res.data.scripts);
    } catch (error) {
      console.error("Failed to fetch available scripts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScripts(search);
  };

  const handleClaim = async (script) => {
    setClaimingId(script._id);
    try {
      await api.post(`/answer-sheets/${script._id}/claim`);
      // Remove from list
      setScripts(scripts.filter((s) => s._id !== script._id));
      alert("Script claimed successfully! You can find it in Assigned Evaluations.");
    } catch (error) {
      alert("Failed to claim script. It may have been claimed by someone else.");
      console.error("Claim error:", error);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Available Scripts</h1>
          <p className="text-gray-400 mt-1">
            Claim answer sheets to start evaluating
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or roll no..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <button type="submit" className="hidden" />
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      ) : scripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <ScriptCard
              key={script._id}
              script={script}
              actionLabel={
                claimingId === script._id ? "Claiming..." : "Claim Script"
              }
              onAction={handleClaim}
              showStatus={false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <FileX size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Scripts Found</h3>
          <p className="text-gray-400">
            {search
              ? "No available scripts match your search criteria."
              : "There are currently no scripts available for evaluation."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableScripts;
