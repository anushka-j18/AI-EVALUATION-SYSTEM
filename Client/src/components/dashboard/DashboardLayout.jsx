import { useState } from "react";
import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, X } from "lucide-react";

const DashboardLayout = () => {
  const { teacher, loading, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (loading) return <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex items-center justify-center p-4 font-bold">Loading Dashboard...</div>;
  if (!teacher) return <Navigate to="/login" />;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", exact: true },
    { name: "AI Evaluation", path: "/dashboard/ai-evaluation" },
    { name: "Assigned", path: "/dashboard/assigned" },
    { name: "Available", path: "/dashboard/available-scripts" },
    { name: "Pending", path: "/dashboard/pending" },
    { name: "Evaluated", path: "/dashboard/evaluated" },
    { name: "Results", path: "/dashboard/results" },
    { name: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden relative flex flex-col" style={{ 
      backgroundColor: '#f8fafc',
      backgroundImage: `
        radial-gradient(at 0% 0%, hsla(210, 100%, 94%, 1) 0px, transparent 50%),
        radial-gradient(at 100% 0%, hsla(190, 100%, 92%, 1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, hsla(220, 100%, 95%, 1) 0px, transparent 50%),
        radial-gradient(at 0% 100%, hsla(250, 100%, 96%, 1) 0px, transparent 50%),
        radial-gradient(at 50% 50%, hsla(200, 100%, 93%, 1) 0px, transparent 50%)
      `
    }}>
      {/* Floating Pill Navbar */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <nav className="bg-[#f1f5f9]/70 backdrop-blur-xl border border-white/60 rounded-[3rem] p-2 flex items-center justify-between shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] overflow-x-auto no-scrollbar">
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="w-14 h-14 bg-[#f1f5f9] rounded-full flex items-center justify-center shrink-0 ml-1"
                 style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}>
              <span className="text-xl font-black text-blue-600">DES</span>
            </div>
            
            <div className="flex items-center gap-1 lg:gap-2 text-[14px] lg:text-[15px] font-medium whitespace-nowrap">
              {navItems.map((item) => {
                if (item.disabled) {
                  return (
                    <span key={item.name} className="text-slate-400 opacity-50 px-4 py-2 rounded-full cursor-not-allowed">
                      {item.name}
                    </span>
                  );
                }
                return (
                  <NavLink 
                    key={item.name}
                    to={item.path} 
                    end={item.exact} 
                    className={({isActive}) => isActive ? "text-blue-600 bg-[#f1f5f9] px-4 py-2 rounded-full font-bold shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] transition-all" : "text-slate-500 hover:text-blue-500 px-4 py-2 rounded-full transition-all"}
                  >
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="flex items-center shrink-0 mr-1 gap-2">
            <button
              className="bg-[#f1f5f9] text-blue-600 px-6 lg:px-8 py-3 lg:py-4 rounded-[2.5rem] font-bold text-[14px] lg:text-[15px] flex items-center gap-2 transition-all pointer-events-none"
              style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
            >
              {teacher?.name || "Evaluator"}
            </button>
            <button onClick={() => setShowLogoutConfirm(true)} 
              className="bg-[#f1f5f9] text-slate-500 hover:text-red-500 px-4 lg:px-6 py-3 lg:py-4 rounded-[2.5rem] font-bold text-[14px] lg:text-[15px] flex items-center gap-2 transition-all"
              style={{ boxShadow: "6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff" }}
              onMouseDown={(e) => e.currentTarget.style.boxShadow = "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff"}
              onMouseUp={(e) => e.currentTarget.style.boxShadow = "6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff"}
            >
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-[#f1f5f9] rounded-[3rem] p-8 max-w-sm w-full shadow-[20px_20px_40px_#cbd5e1,-20px_-20px_40px_#ffffff] border border-white/60 relative flex flex-col items-center text-center">
            
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-[inset_4px_4px_8px_#fca5a5,inset_-4px_-4px_8px_#fee2e2]">
              <LogOut size={32} />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-2">Sign Out?</h2>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to log out of the Digital Evaluation System?
            </p>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-[#f1f5f9] text-slate-600 font-bold shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:bg-red-600 active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
