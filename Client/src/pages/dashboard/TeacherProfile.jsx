/* eslint-disable react-hooks/set-state-in-effect */
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
        <h1 className="text-3xl font-black text-slate-800">Teacher Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your personal information</p>
      </div>

      <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-8 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          
          {/* Avatar Col */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-32 h-32 rounded-[2.5rem] bg-[#f1f5f9] p-2 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] mb-6">
              <div className="w-full h-full bg-[#f1f5f9] rounded-3xl flex items-center justify-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                <span className="text-4xl font-black text-blue-600">
                  {getInitials(teacher.name)}
                </span>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f1f5f9] text-blue-600 hover:text-blue-700 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all font-bold"
              >
                <Edit2 size={18} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all font-bold disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f1f5f9] text-slate-500 hover:text-slate-800 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Details Col */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="bg-[#f1f5f9] p-5 rounded-[2rem] shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff]">
              <label className="text-xs text-slate-400 uppercase font-black tracking-wider mb-2 block">Full Name</label>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f1f5f9] rounded-xl text-blue-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                  <User size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b-2 border-blue-400 text-slate-800 font-bold focus:outline-none focus:border-blue-600 pb-1"
                  />
                ) : (
                  <div className="font-black text-slate-800 text-lg">{teacher.name}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="bg-[#f1f5f9] p-5 rounded-[2rem] shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff] opacity-70">
              <label className="text-xs text-slate-400 uppercase font-black tracking-wider mb-2 block">Email (Cannot be changed)</label>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f1f5f9] rounded-xl text-slate-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                  <Mail size={20} />
                </div>
                <div className="font-black text-slate-600 text-sm truncate">{teacher.email}</div>
              </div>
            </div>

            {/* Department */}
            <div className="bg-[#f1f5f9] p-5 rounded-[2rem] shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff]">
              <label className="text-xs text-slate-400 uppercase font-black tracking-wider mb-2 block">Department</label>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f1f5f9] rounded-xl text-blue-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                  <Briefcase size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b-2 border-blue-400 text-slate-800 font-bold focus:outline-none focus:border-blue-600 pb-1"
                    placeholder="e.g., Computer Science"
                  />
                ) : (
                  <div className="font-black text-slate-800">{teacher.department || "Not specified"}</div>
                )}
              </div>
            </div>

            {/* Employee ID */}
            <div className="bg-[#f1f5f9] p-5 rounded-[2rem] shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff]">
              <label className="text-xs text-slate-400 uppercase font-black tracking-wider mb-2 block">Employee ID</label>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f1f5f9] rounded-xl text-blue-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                  <Hash size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b-2 border-blue-400 text-slate-800 font-bold focus:outline-none focus:border-blue-600 pb-1"
                    placeholder="e.g., EMP-12345"
                  />
                ) : (
                  <div className="font-black text-slate-800">{teacher.employeeId || "Not specified"}</div>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-[#f1f5f9] p-5 rounded-[2rem] shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff] sm:col-span-2">
              <label className="text-xs text-slate-400 uppercase font-black tracking-wider mb-2 block">Phone Number</label>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f1f5f9] rounded-xl text-blue-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                  <Phone size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 max-w-sm bg-transparent border-b-2 border-blue-400 text-slate-800 font-bold focus:outline-none focus:border-blue-600 pb-1"
                    placeholder="e.g., +1 234 567 8900"
                  />
                ) : (
                  <div className="font-black text-slate-800">{teacher.phone || "Not specified"}</div>
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
