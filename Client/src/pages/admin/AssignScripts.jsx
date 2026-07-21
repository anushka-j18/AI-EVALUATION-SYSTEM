import { useState, useEffect, useMemo } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Search, FileX, Check, Users, ArrowLeft, BookOpen, UserCheck, Inbox } from "lucide-react";

const AssignScripts = () => {
  const [allScripts, setAllScripts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View state
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search, setSearch] = useState("");
  
  // Bulk Assignment State
  const [assignmentQuantity, setAssignmentQuantity] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

const fetchData = async () => {
    setLoading(true);
    try {
      const [scriptsRes, teachersRes] = await Promise.all([
        api.get("/admin/answer-sheets"),
        api.get("/admin/teachers")
      ]);
      setAllScripts(scriptsRes.data.scripts);
      setTeachers(teachersRes.data.teachers);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  

  // Group scripts by Subject Code
  const subjectsData = useMemo(() => {
    const groups = {};
    allScripts.forEach(script => {
      const subjectCode = script.questionPaper?.subjectCode || "UNKNOWN";
      if (!groups[subjectCode]) {
        groups[subjectCode] = {
          subjectCode,
          subjectName: script.questionPaper?.subject || "Unknown Subject",
          total: 0,
          assigned: 0,
          unassigned: 0,
          teacherDist: {}, // teacherId -> count
          unassignedScripts: [], // list of scripts that can be assigned
        };
      }
      
      groups[subjectCode].total += 1;
      
      if (script.status === "available") {
        groups[subjectCode].unassigned += 1;
        groups[subjectCode].unassignedScripts.push(script);
      } else {
        groups[subjectCode].assigned += 1;
        if (script.teacherId) {
          const tId = script.teacherId._id || script.teacherId.id; // handle populated object
          if (!groups[subjectCode].teacherDist[tId]) {
            groups[subjectCode].teacherDist[tId] = {
              name: script.teacherId.name,
              count: 0
            };
          }
          groups[subjectCode].teacherDist[tId].count += 1;
        }
      }
    });
    return Object.values(groups);
  }, [allScripts]);

  const currentSubjectData = useMemo(() => {
    return subjectsData.find(s => s.subjectCode === selectedSubject);
  }, [subjectsData, selectedSubject]);

  const filteredTeachers = useMemo(() => {
    if (!selectedSubject) return [];
    return teachers.filter(t => {
      if (!t.subjectCode) return false;
      const teacherCodes = t.subjectCode.split(',').map(s => s.trim().toLowerCase());
      return teacherCodes.includes(selectedSubject.trim().toLowerCase());
    });
  }, [teachers, selectedSubject]);

  const handleBulkAssign = async () => {
    if (!selectedSubject) return;
    
    const qty = parseInt(assignmentQuantity);
    if (isNaN(qty) || qty <= 0) {
      return alert("Please enter a valid positive quantity.");
    }
    if (!selectedTeacherId) {
      return alert("Please select a teacher.");
    }

    if (!currentSubjectData || currentSubjectData.unassignedScripts.length < qty) {
      return alert(`Not enough unassigned scripts. Available: ${currentSubjectData?.unassignedScripts.length || 0}`);
    }

    const scriptsToAssign = currentSubjectData.unassignedScripts.slice(0, qty);
    const scriptIds = scriptsToAssign.map(s => s._id);

    setIsAssigning(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await api.post("/admin/assign-scripts-bulk", { scriptIds, teacherId: selectedTeacherId }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      alert(res.data.message || `Successfully assigned ${qty} scripts!`);
      // Reset form
      setAssignmentQuantity("");
      setSelectedTeacherId("");
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Bulk assign error:", error);
      alert(error.response?.data?.message || "Failed to assign scripts.");
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredSubjects = subjectsData.filter(
    (s) =>
      s.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
      s.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  // --- VIEW 2: Subject-wise Details & Bulk Assignment ---
  if (selectedSubject && currentSubjectData) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 md:px-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-slate-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{currentSubjectData.subjectCode}</h1>
            <p className="text-slate-500 font-medium mt-1">{currentSubjectData.subjectName}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f1f5f9] border border-white/80 rounded-[2rem] p-6 flex items-center justify-between shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1">Total Scripts</p>
              <h2 className="text-3xl font-black text-slate-800">{currentSubjectData.total.toLocaleString()}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-blue-600"><BookOpen size={28} /></div>
          </div>
          <div className="bg-[#f1f5f9] border border-white/80 rounded-[2rem] p-6 flex items-center justify-between shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1">Assigned Scripts</p>
              <h2 className="text-3xl font-black text-emerald-600">{currentSubjectData.assigned.toLocaleString()}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-emerald-600"><UserCheck size={28} /></div>
          </div>
          <div className="bg-[#f1f5f9] border border-white/80 rounded-[2rem] p-6 flex items-center justify-between shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1">Unassigned Scripts</p>
              <h2 className="text-3xl font-black text-amber-500">{currentSubjectData.unassigned.toLocaleString()}</h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-amber-500"><Inbox size={28} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bulk Assignment Panel */}
          <div className="bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
            <h3 className="text-xl font-black text-slate-800 mb-6">Bulk Assignment</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-3">Quick Select Quantity</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {[10, 25, 50, 100, 500].map(qty => (
                    <button
                      key={qty}
                      onClick={() => setAssignmentQuantity(qty.toString())}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] ${assignmentQuantity === qty.toString() ? 'bg-blue-600 text-white shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]' : 'bg-[#f1f5f9] text-slate-600'}`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom Quantity"
                  value={assignmentQuantity}
                  onChange={(e) => setAssignmentQuantity(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] py-4 px-6 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-3">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-white/60 rounded-[1.5rem] py-4 px-6 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
                >
                  <option value="" disabled>Choose a teacher...</option>
                  {filteredTeachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                  ))}
                </select>
                {filteredTeachers.length === 0 && (
                  <p className="text-red-500 font-medium text-xs mt-3">No teachers found matching this Subject Code.</p>
                )}
              </div>

              <button
                onClick={handleBulkAssign}
                disabled={isAssigning || !assignmentQuantity || !selectedTeacherId || currentSubjectData.unassigned === 0}
                className="w-full bg-[#f1f5f9] text-blue-600 font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? <Loader2 className="animate-spin" /> : <Check />}
                Assign {assignmentQuantity ? `${assignmentQuantity} Scripts` : 'Scripts'}
              </button>
              
              {currentSubjectData.unassigned === 0 && (
                <p className="text-center font-medium text-amber-500 text-sm">All scripts for this subject have been assigned.</p>
              )}
            </div>
          </div>

          {/* Teacher-wise Distribution */}
          <div className="bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
            <h3 className="text-xl font-black text-slate-800 mb-6">Assignment Summary</h3>
            {Object.keys(currentSubjectData.teacherDist).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(currentSubjectData.teacherDist).map(([tId, data]) => (
                  <div key={tId} className="bg-[#f1f5f9] border border-white/60 rounded-2xl p-5 flex items-center justify-between shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-blue-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{data.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">{data.count.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Scripts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 font-medium">No scripts have been assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 1: Main Subject Cards View ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Assign Scripts</h1>
          <p className="text-slate-500 font-medium mt-1">Grouped by Subject Code. Select a subject to bulk assign.</p>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full bg-[#f1f5f9] border border-white/60 rounded-full py-3 pl-12 pr-4 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
      </div>

      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map(subject => (
            <div 
              key={subject.subjectCode}
              onClick={() => {
                setSelectedSubject(subject.subjectCode);
                setAssignmentQuantity("");
                setSelectedTeacherId("");
              }}
              className="bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-6 cursor-pointer transition-all shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] hover:shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] hover:-translate-y-1 group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{subject.subjectCode}</h2>
                  <p className="text-sm font-medium text-slate-500 line-clamp-1">{subject.subjectName}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                  <BookOpen size={24} />
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Total Scripts</span>
                  <span className="text-slate-800">{subject.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[#f1f5f9] shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                </div>

                <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <span className="text-slate-500">Assigned</span>
                  <span className="text-emerald-500">{subject.assigned.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[#f1f5f9] shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full shadow-[2px_0_5px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${subject.total ? (subject.assigned / subject.total) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <span className="text-slate-500">Unassigned</span>
                  <span className="text-amber-500">{subject.unassigned.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[#f1f5f9] shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full shadow-[2px_0_5px_rgba(245,158,11,0.5)]" 
                    style={{ width: `${subject.total ? (subject.unassigned / subject.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-12 text-center shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
          <div className="w-20 h-20 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
            <FileX size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Subjects Found</h3>
          <p className="text-slate-500 font-medium">No answer scripts match your search or exist in the system.</p>
        </div>
      )}
    </div>
  );
};

export default AssignScripts;
