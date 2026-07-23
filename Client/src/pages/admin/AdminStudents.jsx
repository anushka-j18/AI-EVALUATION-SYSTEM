import { useState, useEffect, useRef } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Plus, Users, Upload, Edit, X } from "lucide-react";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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
  
  const fileInputRef = useRef(null);

  // Edit State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    registrationNumber: "",
    rollNumber: "",
    course: "",
    semester: "",
    password: "", // Optional during edit
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

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

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    setSuccess("");

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await api.post("/admin/students/bulk-upload", uploadData);
      setSuccess(res.data.message);
      if (res.data.errors && res.data.errors.length > 0) {
        setError(`Some rows failed: ${res.data.errors.join(", ")}`);
      }
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload students");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      registrationNumber: student.registrationNumber,
      rollNumber: student.rollNumber,
      course: student.course,
      semester: student.semester,
      password: "", // Don't pre-fill password
    });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingStudent(null);
    setEditFormData({ name: "", registrationNumber: "", rollNumber: "", course: "", semester: "", password: "" });
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    setEditError("");
    try {
      await api.put(`/admin/students/${editingStudent._id}`, editFormData);
      setSuccess("Student updated successfully!");
      closeEditModal();
      fetchStudents();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update student");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-blue-500" /> Manage Students
        </h1>
        <div className="flex gap-4 items-center">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleBulkUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] hover:scale-105 transition-transform disabled:opacity-50 font-medium"
          >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Upload CSV
          </button>
        </div>
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
                      <th className="py-3 px-4 font-bold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-blue-600">{s.registrationNumber}</td>
                        <td className="py-3 px-4">{s.name}</td>
                        <td className="py-3 px-4">{s.rollNumber}</td>
                        <td className="py-3 px-4">{s.course} - {s.semester}</td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => openEditModal(s)}
                            className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-500">No students found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-2xl w-full max-w-md border border-white/60 relative">
            <button 
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Edit className="text-blue-500" /> Edit Student
            </h2>
            
            {editError && <div className="text-red-500 text-sm mb-4">{editError}</div>}
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
                <input required type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Registration Number</label>
                <input required type="text" value={editFormData.registrationNumber} onChange={e => setEditFormData({...editFormData, registrationNumber: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Roll Number</label>
                <input required type="text" value={editFormData.rollNumber} onChange={e => setEditFormData({...editFormData, rollNumber: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Course</label>
                  <input required type="text" value={editFormData.course} onChange={e => setEditFormData({...editFormData, course: e.target.value})}
                         className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Semester</label>
                  <input required type="text" value={editFormData.semester} onChange={e => setEditFormData({...editFormData, semester: e.target.value})}
                         className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Password (Leave blank to keep current)</label>
                <input type="text" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})}
                       className="w-full bg-[#f1f5f9] rounded-xl px-4 py-2 text-slate-700 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={closeEditModal}
                        className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] hover:scale-[1.02] transition-transform">
                  Cancel
                </button>
                <button disabled={isEditing} type="submit" 
                        className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] hover:scale-[1.02] transition-transform flex justify-center items-center">
                  {isEditing ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;

