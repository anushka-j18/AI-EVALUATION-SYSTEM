import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import { Loader2, User, Mail, Briefcase, Hash, Phone, Edit2, Save, X } from "lucide-react";

const TeacherProfile = () => {
  const { teacher, setTeacher } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    employeeId: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || "",
        department: teacher.department || "",
        employeeId: teacher.employeeId || "",
        phone: teacher.phone || "",
      });
    }
  }, [teacher]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", formData);
      setTeacher(res.data.teacher);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "T";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Teacher Profile</h1>
        <p className="text-gray-400 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          
          {/* Avatar Col */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-1 shadow-2xl shadow-cyan-500/20 mb-4">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900">
                <span className="text-4xl font-black text-white">
                  {getInitials(teacher.name)}
                </span>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Edit2 size={16} />
                <span className="text-sm font-semibold">Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span className="text-sm font-bold">Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Details Col */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Full Name</label>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  <User size={18} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b border-cyan-500 text-white focus:outline-none"
                  />
                ) : (
                  <div className="font-semibold text-white">{teacher.name}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 opacity-80">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Email (Cannot be changed)</label>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  <Mail size={18} />
                </div>
                <div className="font-semibold text-gray-300">{teacher.email}</div>
              </div>
            </div>

            {/* Department */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Department</label>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  <Briefcase size={18} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b border-cyan-500 text-white focus:outline-none"
                    placeholder="e.g., Computer Science"
                  />
                ) : (
                  <div className="font-semibold text-white">{teacher.department || "Not specified"}</div>
                )}
              </div>
            </div>

            {/* Employee ID */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Employee ID</label>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  <Hash size={18} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b border-cyan-500 text-white focus:outline-none"
                    placeholder="e.g., EMP-12345"
                  />
                ) : (
                  <div className="font-semibold text-white">{teacher.employeeId || "Not specified"}</div>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 sm:col-span-2">
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Phone Number</label>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                  <Phone size={18} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 max-w-sm bg-transparent border-b border-cyan-500 text-white focus:outline-none"
                    placeholder="e.g., +1 234 567 8900"
                  />
                ) : (
                  <div className="font-semibold text-white">{teacher.phone || "Not specified"}</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
