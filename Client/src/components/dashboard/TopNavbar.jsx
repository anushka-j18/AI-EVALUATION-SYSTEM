import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const TopNavbar = ({ toggleSidebar, title }) => {
  const { teacher } = useAuth();

  const getInitials = (name) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f1f5f9]/80 backdrop-blur-xl border-b border-white/60 h-20 px-6 flex items-center justify-between shadow-[0_4px_10px_#cbd5e150]">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden mr-4 w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-slate-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-2xl font-black text-slate-800 hidden sm:block">
          {title || "Dashboard"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800">{teacher?.name}</p>
          <p className="text-xs text-slate-500 font-medium">{teacher?.department || "Evaluator"}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
          <span className="text-sm font-black text-blue-600">
            {getInitials(teacher?.name)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
