import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Loader2, BookOpen, ChevronRight, BarChart2 } from "lucide-react";

const AdminSubjectResultsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchSubjects = async () => {
    try {
      const res = await api.get("/admin/subject-results");
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
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white">Class Results</h1>
        <p className="text-gray-400 mt-1">Select a subject to view global performance metrics across all teachers.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <BarChart2 size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Results Available</h3>
          <p className="text-gray-400">No evaluations have been submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link 
              key={subject.id} 
              to={`/admin/results/${subject.id}`}
              className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/10 backdrop-blur-xl flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {subject.subject}
              </h3>
              <p className="text-gray-400 text-sm mb-4">Code: {subject.subjectCode}</p>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Evaluated</p>
                  <p className="text-white font-black">{subject.totalEvaluated} <span className="text-gray-400 font-medium text-sm">scripts</span></p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSubjectResultsList;
