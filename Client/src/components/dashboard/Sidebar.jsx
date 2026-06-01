import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  PenTool,
  ClipboardList,
  FileStack,
  Clock,
  CheckCircle,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, exact: true },
    { name: "AI Evaluation", path: "/dashboard/ai-evaluation", icon: <Brain size={20} /> },
    { name: "Digital Evaluation", path: "/dashboard/digital-evaluation/disabled", icon: <PenTool size={20} />, disabled: true },
    { name: "Assigned Evaluations", path: "/dashboard/assigned", icon: <ClipboardList size={20} /> },
    { name: "Available Scripts", path: "/dashboard/available-scripts", icon: <FileStack size={20} /> },
    { name: "Pending Scripts", path: "/dashboard/pending", icon: <Clock size={20} /> },
    { name: "Evaluated Scripts", path: "/dashboard/evaluated", icon: <CheckCircle size={20} /> },
    { name: "Profile", path: "/dashboard/profile", icon: <User size={20} /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mr-3">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white leading-none">DES</h1>
          <p className="text-xs text-cyan-400 font-medium">Evaluation System</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="flex items-center px-4 py-3 rounded-xl text-gray-600 cursor-not-allowed opacity-50"
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.name}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                }`
              }
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
