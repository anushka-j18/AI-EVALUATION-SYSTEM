import { FileText, Calendar, Hash, ArrowRight } from "lucide-react";

const ScriptCard = ({ script, actionLabel, onAction, showStatus, actionIcon }) => {
  const statusColors = {
    available: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10",
    assigned: "text-orange-400 border-orange-400/20 bg-orange-400/10",
    pending: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    evaluated: "text-green-400 border-green-400/20 bg-green-400/10",
  };

  const statusClass = statusColors[script.status] || statusColors.available;

  return (
    <div className="bg-[#f1f5f9] border border-white/80 rounded-3xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] hover:shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] hover:-translate-y-1 transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center shrink-0 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
          <FileText className="text-blue-500" size={24} />
        </div>
        {showStatus && (
          <div
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f1f5f9] shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] ${statusClass.split(' ')[0]}`}
          >
            {script.status}
          </div>
        )}
      </div>

      <div className="flex-1 mb-6">
        <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-1">
          {script.studentName}
        </h3>
        <p className="text-blue-600 font-bold text-sm mb-4">
          Roll No: {script.rollNumber}
        </p>

        <div className="space-y-3 text-sm text-slate-500 font-medium">
          {script.questionPaper && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
                  <Hash size={14} className="text-slate-500" />
                </div>
                <span className="truncate">
                  {script.questionPaper.subjectCode} - {script.questionPaper.subject}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
                  <Calendar size={14} className="text-slate-500" />
                </div>
                <span className="truncate">
                  {script.questionPaper.examName} ({script.questionPaper.session})
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {actionLabel && (
        <button
          onClick={() => onAction(script)}
          className="w-full py-4 rounded-2xl bg-[#f1f5f9] text-blue-600 font-black hover:text-white hover:bg-blue-500 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center gap-2"
        >
          {actionLabel}
          {actionIcon || <ArrowRight size={18} />}
        </button>
      )}
    </div>
  );
};

export default ScriptCard;
