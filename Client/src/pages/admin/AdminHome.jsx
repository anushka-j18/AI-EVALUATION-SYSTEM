import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Users, FileStack, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminContext";

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: "from-blue-500 to-indigo-500 text-blue-400 bg-blue-500/10",
    red: "from-red-500 to-orange-500 text-red-400 bg-red-500/10",
    green: "from-green-500 to-emerald-500 text-green-400 bg-green-500/10",
    purple: "from-purple-500 to-fuchsia-500 text-purple-400 bg-purple-500/10",
    cyan: "from-cyan-500 to-blue-500 text-cyan-400 bg-cyan-500/10",
    orange: "from-orange-500 to-amber-500 text-orange-400 bg-orange-500/10",
  };

  const sel = colorMap[color];
  const textClass = sel.split(" ")[2];
  const bgClass = sel.split(" ")[3];

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-6 hover:bg-white/10 transition-colors">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${bgClass}`}>
        <div className={textClass}>{icon}</div>
      </div>
      <div>
        <p className="text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
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
      <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome, {admin?.name}! 🛡️
          </h1>
          <p className="text-red-100 max-w-xl text-lg">
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
