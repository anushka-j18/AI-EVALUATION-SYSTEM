const StatsCard = ({ title, value, icon, color = "cyan" }) => {
  const colorMap = {
    cyan: "text-blue-500",
    green: "text-emerald-500",
    purple: "text-purple-500",
    orange: "text-amber-500",
  };

  const selectedColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] flex items-center justify-between hover:shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] hover:-translate-y-1 transition-all">
      <div>
        <p className="text-slate-500 font-bold text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      </div>
      <div
        className={`w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shrink-0 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] ${selectedColor}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
