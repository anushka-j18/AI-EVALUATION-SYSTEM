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
    <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 h-20 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden mr-4 p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white hidden sm:block">
          {title || "Dashboard"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white">{teacher?.name}</p>
          <p className="text-xs text-gray-400">{teacher?.department || "Evaluator"}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-900">
            <span className="text-xs font-bold text-white">
              {getInitials(teacher?.name)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
