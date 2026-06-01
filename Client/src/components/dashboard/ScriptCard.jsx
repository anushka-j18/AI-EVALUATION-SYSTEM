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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
          <FileText className="text-gray-400" size={24} />
        </div>
        {showStatus && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${statusClass}`}
          >
            {script.status}
          </div>
        )}
      </div>

      <div className="flex-1 mb-6">
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
          {script.studentName}
        </h3>
        <p className="text-cyan-400 font-medium text-sm mb-4">
          Roll No: {script.rollNumber}
        </p>

        <div className="space-y-2 text-sm text-gray-400">
          {script.questionPaper && (
            <>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-gray-500" />
                <span className="truncate">
                  {script.questionPaper.subjectCode} - {script.questionPaper.subject}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
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
          className="w-full py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
        >
          {actionLabel}
          {actionIcon || <ArrowRight size={18} />}
        </button>
      )}
    </div>
  );
};

export default ScriptCard;
