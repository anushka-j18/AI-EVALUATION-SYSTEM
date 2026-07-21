import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Users, FileStack, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminContext";

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: "text-blue-500",
    red: "text-red-500",
    green: "text-emerald-500",
    purple: "text-purple-500",
    cyan: "text-cyan-500",
    orange: "text-orange-500",
  };

  const textClass = colorMap[color];

  return (
    <div className="bg-[#f1f5f9] border border-white/80 rounded-[2rem] p-6 flex items-center gap-6 group hover:scale-[1.02] transition-transform duration-300"
         style={{ boxShadow: "10px 10px 20px #cbd5e1, -10px -10px 20px #ffffff" }}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-[#f1f5f9]`}
           style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}>
        <div className={textClass}>{icon}</div>
      </div>
      <div>
        <p className="text-slate-500 font-bold text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalScripts: 0,
    availableScripts: 0,
    assignedScripts: 0,
    pendingScripts: 0,
    evaluatedScripts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes (since backend might not be connected to DB)
    // We try fetching stats, if it fails, fallback to 0.
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.stats);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-8 relative overflow-hidden mb-8"
           style={{ boxShadow: "10px 10px 20px #cbd5e1, -10px -10px 20px #ffffff" }}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-400/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
            Welcome, {admin?.name}! 🛡️
          </h1>
          <p className="text-slate-500 font-medium max-w-xl text-lg">
            System overview and quick statistics for the Digital Evaluation System.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={<Users size={28} />} color="blue" />
        <StatCard title="Total Scripts" value={stats.totalScripts} icon={<FileStack size={28} />} color="purple" />
        <StatCard title="Available Scripts" value={stats.availableScripts} icon={<FileStack size={28} />} color="cyan" />
        <StatCard title="Assigned Scripts" value={stats.assignedScripts} icon={<FileStack size={28} />} color="orange" />
        <StatCard title="Pending Evaluation" value={stats.pendingScripts} icon={<Clock size={28} />} color="red" />
        <StatCard title="Completed Scripts" value={stats.evaluatedScripts} icon={<CheckCircle size={28} />} color="green" />
      </div>
    </div>
  );
};

export default AdminHome;
