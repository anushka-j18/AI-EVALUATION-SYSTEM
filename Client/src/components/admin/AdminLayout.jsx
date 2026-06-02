import { useState } from "react";
import { Outlet, useLocation, NavLink, Navigate } from "react-router-dom";
import { ShieldCheck, LayoutDashboard, Users, FileStack, LogOut, Menu, UploadCloud, BarChart2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminContext";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { admin, loading, logout } = useAdminAuth();

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">Loading Admin Portal...</div>;
  if (!admin) return <Navigate to="/login" />;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: "Admin Dashboard", path: "/admin", icon: <LayoutDashboard size={20} />, exact: true },
    { name: "Manage Teachers", path: "/admin/teachers", icon: <Users size={20} /> },
    { name: "Assign Scripts", path: "/admin/assign", icon: <FileStack size={20} /> },
    { name: "Upload Q. Paper", path: "/upload-question-paper", icon: <UploadCloud size={20} /> },
    { name: "Upload Ans. Sheet", path: "/admin/upload-answer-sheet", icon: <UploadCloud size={20} /> },
    { name: "Class Results", path: "/admin/results", icon: <BarChart2 size={20} /> },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Admin Overview";
    if (path.includes("teachers")) return "Manage Teachers";
    if (path.includes("assign")) return "Assign Scripts";
    return "Admin Portal";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-950/80 backdrop-blur-xl border-r border-red-500/20 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20 mr-3">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none">DES Admin</h1>
            <p className="text-xs text-red-400 font-medium">Control Panel</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Management
          </p>
          {navItems.map((item) => (
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
                    ? "bg-red-500/10 text-red-400 border-l-4 border-red-500"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                }`
              }
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3 font-medium">Logout Admin</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-red-500/10 h-20 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden mr-4 p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{admin?.name}</p>
              <p className="text-xs text-red-400">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-900">
                <span className="text-xs font-bold text-white">AD</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
