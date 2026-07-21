/* eslint-disable react-hooks/set-state-in-effect */
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
          <h1 className="text-3xl font-black text-slate-800">Available Scripts</h1>
          <p className="text-slate-500 font-medium mt-1">
            Claim answer sheets to start evaluating
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or roll no..."
            className="w-full bg-[#f1f5f9] border-none rounded-2xl py-4 pl-14 pr-4 text-slate-800 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff] transition-shadow font-medium"
          />
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <button type="submit" className="hidden" />
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : scripts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-12 text-center shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
          <div className="w-24 h-24 bg-[#f1f5f9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
            <FileX size={40} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">No Scripts Found</h3>
          <p className="text-slate-500 font-medium">
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
