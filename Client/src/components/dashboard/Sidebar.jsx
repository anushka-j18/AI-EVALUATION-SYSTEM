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
  BarChart2,
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
    { name: "Results & Analytics", path: "/dashboard/results", icon: <BarChart2 size={20} /> },
    { name: "Profile", path: "/dashboard/profile", icon: <User size={20} /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-[#f1f5f9] border-r border-white/60 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[10px_0_20px_#cbd5e150] ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-white/60 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] mr-3 text-blue-600">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-none">DES</h1>
          <p className="text-xs text-blue-500 font-medium mt-1">Evaluation System</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="flex items-center px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed opacity-50"
              >
                {item.icon}
                <span className="ml-3 font-bold">{item.name}</span>
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
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                  isActive
                    ? "bg-[#f1f5f9] text-blue-600 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-[#f1f5f9] hover:shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]"
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/60 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-red-500 font-bold rounded-xl transition-all hover:bg-[#f1f5f9] hover:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
        >
          <LogOut size={20} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
