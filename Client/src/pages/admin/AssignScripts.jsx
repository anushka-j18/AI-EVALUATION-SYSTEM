import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Search, FileX, Check, Users } from "lucide-react";

const AssignScripts = () => {
  const [scripts, setScripts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scriptsRes, teachersRes] = await Promise.all([
        api.get("/admin/answer-sheets"),
        api.get("/admin/teachers")
      ]);
      // Filter out scripts that are already evaluated/pending if you only want to assign 'available' ones.
      // But for flexibility, let admin re-assign 'assigned' ones too.
      const assignable = scriptsRes.data.scripts.filter(s => s.status === 'available');
      setScripts(assignable);
      setTeachers(teachersRes.data.teachers);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (scriptId, teacherId) => {
    setSelectedTeachers(prev => ({
      ...prev,
      [scriptId]: teacherId
    }));
  };

  const handleAssign = async (scriptId) => {
    const teacherId = selectedTeachers[scriptId];
    if (!teacherId) return alert("Please select a teacher first.");

    setAssigningId(scriptId);
    try {
      await api.post("/admin/assign-script", { scriptId, teacherId });
      alert("Script assigned successfully!");
      fetchData(); // Refresh list to update status
    } catch (error) {
      console.error("Assign error:", error);
      alert("Failed to assign script.");
    } finally {
      setAssigningId(null);
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
          <h1 className="text-3xl font-black text-white">Assign Scripts</h1>
          <p className="text-gray-400 mt-1">Manually distribute answer sheets to teachers</p>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search script..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="grid gap-4">
          {filteredScripts.map((script) => (
            <div key={script._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{script.studentName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${script.status === 'available' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                    {script.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-x-4">
                  <span>Roll: <strong className="text-gray-200">{script.rollNumber}</strong></span>
                  <span>Subject: <strong className="text-gray-200">{script.questionPaper?.subject || "N/A"}</strong></span>
                  {script.teacherId && (
                     <span className="text-orange-300">Current Assigned: {script.teacherId.name}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <select 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-red-500 focus:outline-none appearance-none"
                    value={selectedTeachers[script._id] || ""}
                    onChange={(e) => handleTeacherSelect(script._id, e.target.value)}
                  >
                    <option value="" disabled>Select Teacher...</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleAssign(script._id)}
                  disabled={assigningId === script._id || !selectedTeachers[script._id]}
                  className="shrink-0 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {assigningId === script._id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  Assign
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <FileX size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Assignable Scripts</h3>
          <p className="text-gray-400">All available scripts have already been assigned or evaluated.</p>
        </div>
      )}
    </div>
  );
};

export default AssignScripts;
