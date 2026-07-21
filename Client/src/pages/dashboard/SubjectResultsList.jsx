import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Loader2, BookOpen, ChevronRight, BarChart2 } from "lucide-react";

const SubjectResultsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchSubjects = async () => {
    try {
      const res = await api.get("/dashboard/subject-results");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Results & Analytics</h1>
        <p className="text-slate-500 font-medium mt-1">Select a subject to view detailed performance metrics of the scripts you evaluated.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-12 text-center shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
          <div className="w-24 h-24 bg-[#f1f5f9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
            <BarChart2 size={40} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">No Results Available</h3>
          <p className="text-slate-500 font-medium">You haven't evaluated any scripts yet to generate results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <Link 
              key={subject.id} 
              to={`/dashboard/results/${subject.id}`}
              className="group bg-[#f1f5f9] border border-white/80 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] transition-all flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mb-6 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] group-hover:shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff] transition-all">
                <BookOpen className="text-blue-500" size={26} />
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                {subject.subject}
              </h3>
              <p className="text-slate-500 font-bold text-sm mb-4">Code: {subject.subjectCode}</p>
              
              <div className="mt-auto pt-5 border-t border-white/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Evaluated</p>
                  <p className="text-slate-800 font-black text-lg">{subject.totalEvaluated} <span className="text-slate-500 font-medium text-sm">scripts</span></p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-slate-400 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] group-hover:text-blue-600 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectResultsList;
