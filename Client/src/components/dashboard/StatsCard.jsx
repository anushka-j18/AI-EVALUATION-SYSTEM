const StatsCard = ({ title, value, icon, color = "cyan" }) => {
  const colorMap = {
    cyan: "from-cyan-500 to-blue-500 text-cyan-400 shadow-cyan-500/20 bg-cyan-500/10",
    green: "from-green-500 to-emerald-500 text-green-400 shadow-green-500/20 bg-green-500/10",
    purple: "from-purple-500 to-fuchsia-500 text-purple-400 shadow-purple-500/20 bg-purple-500/10",
    orange: "from-orange-500 to-red-500 text-orange-400 shadow-orange-500/20 bg-orange-500/10",
  };

  const selectedColor = colorMap[color] || colorMap.cyan;
  const gradientClass = selectedColor.split(" ").slice(0, 2).join(" ");
  const textClass = selectedColor.split(" ")[2];
  const shadowClass = selectedColor.split(" ")[3];
  const bgClass = selectedColor.split(" ")[4];

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-6 hover:bg-white/10 transition-colors">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${bgClass}`}
      >
        <div className={textClass}>{icon}</div>
      </div>
      <div>
        <p className="text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
