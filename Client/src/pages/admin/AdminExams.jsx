import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Plus, Calendar, FileText, MapPin, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    center: "",
    subjects: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...formData,
        subjects: formData.subjects.split(",").map(s => s.trim()).filter(s => s)
      };
      await api.post("/admin/exams", payload);
      setSuccess("Exam created successfully!");
      setFormData({ name: "", date: "", center: "", subjects: "" });
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create exam");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this exam?")) return;
    try {
      await api.delete(`/admin/exams/${id}`);
      fetchExams();
    } catch (err) {
      alert("Failed to delete exam");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="text-blue-500" /> Manage Exams
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="text-blue-500" /> Create Exam
            </h2>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            {success && <div className="text-green-500 text-sm mb-4">{success}</div>}
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Exam Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                       placeholder="e.g. Mid Term 2026"
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Center</label>
                <input required type="text" value={formData.center} onChange={e => setFormData({...formData, center: e.target.value})}
                       placeholder="e.g. Main Hall"
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Subjects (comma separated)</label>
                <input required type="text" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})}
                       placeholder="Math, Physics, Chem"
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              
              <button disabled={isCreating} type="submit" 
                      className="w-full py-3 mt-4 bg-blue-500 text-white font-bold rounded-xl shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] hover:scale-[1.02] transition-transform flex justify-center items-center">
                {isCreating ? <Loader2 className="animate-spin" size={20} /> : "Create Exam"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : exams.length === 0 ? (
            <div className="text-center p-8 text-slate-500">No exams created yet.</div>
          ) : (
            exams.map(exam => (
              <div key={exam._id} className="bg-[#f1f5f9] rounded-2xl p-5 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{exam.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(exam.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {exam.center}</span>
                    <span className="flex items-center gap-1"><FileText size={14} /> {exam.subjects.length} Subjects</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/admin/exams/${exam._id}/registrations`} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition-colors">
                    Registrations
                  </Link>
                  <button onClick={() => handleDelete(exam._id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-200">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminExams;
