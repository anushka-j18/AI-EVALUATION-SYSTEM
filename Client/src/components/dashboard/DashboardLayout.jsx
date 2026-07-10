import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { teacher, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">Loading Dashboard...</div>;
  if (!teacher) return <Navigate to="/login" />;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path.includes("ai-evaluation")) return "AI Evaluation";
    if (path.includes("digital-evaluation")) return "Digital Evaluation";
    if (path.includes("assigned")) return "Assigned Evaluations";
    if (path.includes("available-scripts")) return "Available Scripts";
    if (path.includes("pending")) return "Pending Scripts";
    if (path.includes("evaluated")) return "Evaluated Scripts";
    if (path.includes("profile")) return "Teacher Profile";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <TopNavbar toggleSidebar={toggleSidebar} title={getPageTitle()} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
