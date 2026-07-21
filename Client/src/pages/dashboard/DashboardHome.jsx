import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import StatsCard from "../../components/dashboard/StatsCard";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Brain,
  UploadCloud,
  FileSearch,
  PenTool,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardHome = () => {
  const { teacher } = useAuth();
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingCount: 0,
    completedCount: 0,
    aiEvaluationsCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/recent-activities"),
        ]);

        setStats(statsRes.data.stats);
        setRecentActivities(activitiesRes.data.activities);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-10 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] relative overflow-hidden flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-[#f1f5f9] flex items-center justify-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] text-amber-500 shrink-0">
          <span className="text-4xl">👋</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Welcome back, {teacher?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            You have <span className="font-bold text-blue-600">{stats.pendingCount}</span> pending scripts to evaluate. Let's make today productive.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assigned"
          value={stats.totalAssigned}
          icon={<ClipboardList size={28} />}
          color="cyan"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCount}
          icon={<Clock size={28} />}
          color="orange"
        />
        <StatsCard
          title="Completed"
          value={stats.completedCount}
          icon={<CheckCircle size={28} />}
          color="green"
        />
        <StatsCard
          title="AI Evaluated"
          value={stats.aiEvaluationsCount}
          icon={<Brain size={28} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-[#f1f5f9] border border-white/80 rounded-[3rem] p-8 md:p-10 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
            <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-blue-600">
                <Clock size={20} />
              </div>
              Recent Activities
            </h2>

            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-center justify-between p-5 rounded-3xl bg-[#f1f5f9] shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {activity.studentName}
                      </h4>
                      <p className="text-sm font-medium text-slate-500">
                        Roll: {activity.rollNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.status === "submitted" ? (
                        <>
                          <div className="text-emerald-500 text-sm font-bold mb-1">
                            Evaluated
                          </div>
                          <div className="text-xl font-black text-slate-800">
                            {activity.totalMarks}
                          </div>
                        </>
                      ) : (
                        <div className="text-amber-500 text-sm font-bold">
                          Draft Saved
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#f1f5f9] shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] rounded-[2rem]">
                <p className="text-slate-500 font-medium">No recent evaluation activities.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 mb-2 pl-2">Quick Actions</h2>
          
          <Link
            to="/dashboard/available-scripts"
            className="flex items-center gap-5 p-6 rounded-[2rem] bg-[#f1f5f9] shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center text-blue-600 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] group-hover:scale-110 transition-transform">
              <FileSearch size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">Find Scripts</h3>
              <p className="text-sm font-medium text-slate-500">Claim available sheets</p>
            </div>
          </Link>

          <Link
            to="/dashboard/pending"
            className="flex items-center gap-5 p-6 rounded-[2rem] bg-[#f1f5f9] shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center text-amber-500 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] group-hover:scale-110 transition-transform">
              <PenTool size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 group-hover:text-amber-500 transition-colors">Resume Work</h3>
              <p className="text-sm font-medium text-slate-500">Continue evaluations</p>
            </div>
          </Link>

          <Link
            to="/upload-question-paper"
            className="flex items-center gap-5 p-6 rounded-[2rem] bg-[#f1f5f9] shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center text-purple-500 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 group-hover:text-purple-500 transition-colors">Upload Paper</h3>
              <p className="text-sm font-medium text-slate-500">Add a new question paper</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
