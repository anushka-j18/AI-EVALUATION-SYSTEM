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
      setAllScripts(scriptsRes.data.scripts);
      setTeachers(teachersRes.data.teachers);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">{currentSubjectData.subjectCode}</h1>
            <p className="text-gray-400 mt-1">{currentSubjectData.subjectName}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Scripts</p>
              <h2 className="text-3xl font-bold text-white">{currentSubjectData.total.toLocaleString()}</h2>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400"><BookOpen size={32} /></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Assigned Scripts</p>
              <h2 className="text-3xl font-bold text-emerald-400">{currentSubjectData.assigned.toLocaleString()}</h2>
            </div>
            <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400"><UserCheck size={32} /></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Unassigned Scripts</p>
              <h2 className="text-3xl font-bold text-amber-400">{currentSubjectData.unassigned.toLocaleString()}</h2>
            </div>
            <div className="bg-amber-500/20 p-4 rounded-xl text-amber-400"><Inbox size={32} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bulk Assignment Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Bulk Assignment</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Quick Select Quantity</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {[10, 25, 50, 100, 500].map(qty => (
                    <button
                      key={qty}
                      onClick={() => setAssignmentQuantity(qty.toString())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${assignmentQuantity === qty.toString() ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="" disabled>Choose a teacher...</option>
                  {filteredTeachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                  ))}
                </select>
                {filteredTeachers.length === 0 && (
                  <p className="text-red-400 text-xs mt-2">No teachers found matching this Subject Code.</p>
                )}
              </div>

              <button
                onClick={handleBulkAssign}
                disabled={isAssigning || !assignmentQuantity || !selectedTeacherId || currentSubjectData.unassigned === 0}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? <Loader2 className="animate-spin" /> : <Check />}
                Assign {assignmentQuantity ? `${assignmentQuantity} Scripts` : 'Scripts'}
              </button>
              
              {currentSubjectData.unassigned === 0 && (
                <p className="text-center text-amber-400 text-sm">All scripts for this subject have been assigned.</p>
              )}
            </div>
          </div>

          {/* Teacher-wise Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Assignment Summary</h3>
            {Object.keys(currentSubjectData.teacherDist).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(currentSubjectData.teacherDist).map(([tId, data]) => (
                  <div key={tId} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded-lg text-gray-300">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{data.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">{data.count.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Scripts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No scripts have been assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 1: Main Subject Cards View ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Assign Scripts</h1>
          <p className="text-gray-400 mt-1">Grouped by Subject Code. Select a subject to bulk assign.</p>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
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
              className="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-red-500/10 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">{subject.subjectCode}</h2>
                  <p className="text-sm text-gray-400 line-clamp-1">{subject.subjectName}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl text-gray-400 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors">
                  <BookOpen size={24} />
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Scripts</span>
                  <span className="font-medium text-white">{subject.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full w-full"></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-gray-400">Assigned</span>
                  <span className="font-medium text-emerald-400">{subject.assigned.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${subject.total ? (subject.assigned / subject.total) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-gray-400">Unassigned</span>
                  <span className="font-medium text-amber-400">{subject.unassigned.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full" 
                    style={{ width: `${subject.total ? (subject.unassigned / subject.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileX size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Subjects Found</h3>
          <p className="text-gray-400">No answer scripts match your search or exist in the system.</p>
        </div>
      )}
    </div>
  );
};

export default AssignScripts;
