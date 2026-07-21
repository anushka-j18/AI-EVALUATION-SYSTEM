import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Plus, Users, Search } from "lucide-react";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    rollNumber: "",
    course: "",
    semester: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await api.get("/admin/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/students", formData);
      setSuccess("Student created successfully!");
      setFormData({ name: "", registrationNumber: "", rollNumber: "", course: "", semester: "", password: "" });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-blue-500" /> Manage Students
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="text-blue-500" /> Add New Student
            </h2>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            {success && <div className="text-green-500 text-sm mb-4">{success}</div>}
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Registration Number</label>
                <input required type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Roll Number</label>
                <input required type="text" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Course</label>
                  <input required type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}
                         className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Semester</label>
                  <input required type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}
                         className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <button disabled={isCreating} type="submit" 
                      className="w-full py-3 mt-4 bg-blue-500 text-white font-bold rounded-xl shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] hover:scale-[1.02] transition-transform flex justify-center items-center">
                {isCreating ? <Loader2 className="animate-spin" size={20} /> : "Create Student"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               Registered Students
            </h2>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="py-3 px-4 font-bold text-slate-600">Reg No</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Name</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Roll No</th>
                      <th className="py-3 px-4 font-bold text-slate-600">Course / Sem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-blue-600">{s.registrationNumber}</td>
                        <td className="py-3 px-4">{s.name}</td>
                        <td className="py-3 px-4">{s.rollNumber}</td>
                        <td className="py-3 px-4">{s.course} - {s.semester}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-slate-500">No students found.</td>
                      </tr>
                    )}
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

export default AdminStudents;
