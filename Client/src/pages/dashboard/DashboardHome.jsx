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
      <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome back, {teacher?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-cyan-100 max-w-xl text-lg">
            You have {stats.pendingCount} pending scripts to evaluate. Let's make today productive.
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
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Clock className="mr-3 text-cyan-400" size={20} />
              Recent Activities
            </h2>

            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-white">
                        {activity.studentName}
                      </h4>
                      <p className="text-sm text-gray-400">
                        Roll: {activity.rollNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.status === "submitted" ? (
                        <>
                          <div className="text-green-400 text-sm font-semibold mb-1">
                            Evaluated
                          </div>
                          <div className="text-xl font-black text-white">
                            {activity.totalMarks}
                          </div>
                        </>
                      ) : (
                        <div className="text-orange-400 text-sm font-semibold">
                          Draft Saved
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-slate-900/30 rounded-2xl border border-dashed border-white/10">
                <p>No recent evaluation activities.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          
          <Link
            to="/dashboard/available-scripts"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 hover:from-cyan-600/30 hover:to-blue-600/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileSearch size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-cyan-100">Find Scripts</h3>
              <p className="text-sm text-gray-400">Claim available sheets</p>
            </div>
          </Link>

          <Link
            to="/dashboard/pending"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/20 hover:from-orange-600/30 hover:to-red-600/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <PenTool size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-orange-100">Resume Work</h3>
              <p className="text-sm text-gray-400">Continue evaluations</p>
            </div>
          </Link>

          <Link
            to="/upload-question-paper"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border border-purple-500/20 hover:from-purple-600/30 hover:to-fuchsia-600/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-purple-100">Upload Paper</h3>
              <p className="text-sm text-gray-400">Add a new question paper</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
