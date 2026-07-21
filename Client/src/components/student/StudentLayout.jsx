import { useState } from "react";
import { Outlet, NavLink, Navigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, Edit3, FileBadge, Award } from "lucide-react";
import { useStudentAuth } from "../../context/StudentContext";

const StudentLayout = () => {
  const { student, loading, logout } = useStudentAuth();

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">Loading Student Portal...</div>;
  if (!student) return <Navigate to="/login?role=student" />;

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
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <nav className="bg-[#f1f5f9]/70 backdrop-blur-xl border border-white/60 rounded-[3rem] p-2 flex items-center justify-between shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] overflow-x-auto no-scrollbar">
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="w-14 h-14 bg-[#f1f5f9] rounded-full flex items-center justify-center shrink-0 ml-1"
                 style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}>
              <GraduationCap className="text-blue-500" size={28} />
            </div>
            
            <div className="flex items-center gap-1 lg:gap-2 text-[14px] lg:text-[15px] font-medium whitespace-nowrap">
              <NavLink to="/student/dashboard" className={({isActive}) => isActive ? "text-blue-600 bg-[#f1f5f9] px-4 py-2 rounded-full font-bold shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] transition-all" : "text-slate-500 hover:text-blue-500 px-4 py-2 rounded-full transition-all"}>
                <span className="flex items-center gap-2"><LayoutDashboard size={18}/> Home</span>
              </NavLink>
              <NavLink to="/student/exam-registration" className={({isActive}) => isActive ? "text-blue-600 bg-[#f1f5f9] px-4 py-2 rounded-full font-bold shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] transition-all" : "text-slate-500 hover:text-blue-500 px-4 py-2 rounded-full transition-all"}>
                <span className="flex items-center gap-2"><Edit3 size={18}/> Register</span>
              </NavLink>
              <NavLink to="/student/admit-card" className={({isActive}) => isActive ? "text-blue-600 bg-[#f1f5f9] px-4 py-2 rounded-full font-bold shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] transition-all" : "text-slate-500 hover:text-blue-500 px-4 py-2 rounded-full transition-all"}>
                <span className="flex items-center gap-2"><FileBadge size={18}/> Admit Card</span>
              </NavLink>
              <NavLink to="/student/results" className={({isActive}) => isActive ? "text-blue-600 bg-[#f1f5f9] px-4 py-2 rounded-full font-bold shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff] transition-all" : "text-slate-500 hover:text-blue-500 px-4 py-2 rounded-full transition-all"}>
                <span className="flex items-center gap-2"><Award size={18}/> Results</span>
              </NavLink>
            </div>
          </div>

          <button onClick={logout} 
            className="bg-[#f1f5f9] text-blue-600 px-6 lg:px-8 py-3 lg:py-4 rounded-[2.5rem] font-bold text-[14px] lg:text-[15px] flex items-center gap-2 transition-all shrink-0 mr-1"
            style={{ boxShadow: "6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff" }}
            onMouseDown={(e) => e.currentTarget.style.boxShadow = "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff"}
            onMouseUp={(e) => e.currentTarget.style.boxShadow = "6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "6px 6px 12px #cbd5e1, -6px -6px 12px #ffffff"}
          >
            {student?.name || "Logout"}
          </button>

        </nav>
      </div>

      {/* Main Content */}
      <main className="pt-40 pb-8 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
