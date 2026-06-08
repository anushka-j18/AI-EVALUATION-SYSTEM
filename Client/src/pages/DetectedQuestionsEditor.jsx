import { useState, useEffect } from "react";
import axios from "axios";
import { ClipboardList, Trash2, PlusCircle, Save, Loader2, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DetectedQuestionsEditor({ paperId, initialQuestions, expectedTotalMarks }) {
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    } else if (paperId && (!initialQuestions || initialQuestions.length === 0)) {
      // Fetch from DB if no initial questions provided (standalone edit mode)
      const fetchQuestions = async () => {
        try {
          const res = await axios.get(`http://localhost:5001/api/questions/paper/${paperId}`);
          setQuestions(res.data.questions || []);
        } catch (error) {
          console.error(error);
        }
      };
      fetchQuestions();
    }
  }, [initialQuestions, paperId]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { section: "", qNo: `${questions.length + 1}`, question: "", maxMarks: 0, requiredAttempts: null, isOptional: false, groupId: "" },
    ]);
  };

  const deleteQuestion = async (questionId, index) => {
    try {
      // If it has an ID, it means it was previously saved to DB
      if (questionId) {
        await axios.delete(`http://localhost:5001/api/questions/${questionId}`);
      }
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  const saveQuestions = async () => {
    try {
      setSaving(true);
      await axios.put(`http://localhost:5001/api/questions/update-all/${paperId}`, {
        questions,
      });
      alert("Questions Saved Successfully!");
      navigate("/view-question-papers");
    } catch (error) {
      console.log(error);
      alert("Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  // Calculate current total based on Best N attempts with OR logic
  const calculateTotal = (qs) => {
    const groups = {};
    let total = 0;

    qs.forEach((q, idx) => {
      let key;
      if (q.groupId) {
        key = `group_${q.groupId}`;
      } else if (q.requiredAttempts && q.section) {
        key = `section_${q.section}`;
      } else {
        key = `ungrouped_${idx}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });

    Object.values(groups).forEach(groupQs => {
      const reqAttempts = groupQs.find(q => q.requiredAttempts)?.requiredAttempts || groupQs.length;
      const sorted = [...groupQs].sort((a, b) => (Number(b.maxMarks) || 0) - (Number(a.maxMarks) || 0));
      const topN = sorted.slice(0, reqAttempts);
      total += topN.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
    });

    return total;
  };

  const calculatedTotal = calculateTotal(questions);
  const isTotalMatching = calculatedTotal === Number(expectedTotalMarks);

  return (
    <div className="mt-10 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl p-8 shadow-2xl relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <ClipboardList className="text-green-400" size={30} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white">Review & Edit Questions</h2>
            <p className="text-gray-400 mt-2">Please verify OCR results before saving to Database</p>
          </div>
        </div>

        <button
          onClick={saveQuestions}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 px-8 py-4 rounded-2xl font-bold transition disabled:opacity-50 text-white shadow-lg shadow-cyan-500/20"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Final Questions
        </button>
      </div>

      {/* TOTAL MARKS VALIDATION */}
      <div className={`mb-10 p-6 rounded-3xl border-2 flex items-center gap-4 ${isTotalMatching ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTotalMatching ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
          <Calculator size={24} />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isTotalMatching ? 'text-green-400' : 'text-orange-400'}`}>
            Total Marks Validation
          </h3>
          <p className="text-gray-300">
            Calculated: <span className="font-bold">{calculatedTotal}</span> / Expected: <span className="font-bold">{expectedTotalMarks}</span>
          </p>
        </div>
        {!isTotalMatching && (
          <div className="ml-auto text-orange-400 font-bold bg-orange-500/20 px-4 py-2 rounded-xl text-sm">
            Marks do not match! Please review.
          </div>
        )}
      </div>

      {/* EMPTY */}
      {questions.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-gray-300">No Questions Found</h3>
        </div>
      )}

      {/* QUESTIONS */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q._id || index} className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative group">
            
            <div className={`p-4 rounded-3xl mb-5 border ${q.isOptional ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5 bg-slate-900/40'}`}>
              <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4">
                {/* SECTION */}
                <div>
                  <label className="text-xs text-gray-400 font-bold">Section</label>
                  <input
                    type="text"
                    value={q.section || ""}
                    onChange={(e) => handleQuestionChange(index, "section", e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none text-sm"
                  />
                </div>

                {/* GROUP ID */}
                <div>
                  <label className="text-xs text-gray-400 font-bold" title="Must be same for 'OR' questions">Group ID</label>
                  <input
                    type="text"
                    placeholder="e.g. Q1_OR_Q2"
                    value={q.groupId || ""}
                    onChange={(e) => handleQuestionChange(index, "groupId", e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none text-sm"
                  />
                </div>

                {/* IS OPTIONAL */}
                <div className="flex flex-col justify-center items-center">
                  <label className="text-xs text-gray-400 font-bold">Optional?</label>
                  <input
                    type="checkbox"
                    checked={q.isOptional || false}
                    onChange={(e) => handleQuestionChange(index, "isOptional", e.target.checked)}
                    className="w-5 h-5 mt-2 rounded bg-slate-800 border border-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
                  />
                </div>

                {/* REQUIRED ATTEMPTS */}
                <div>
                  <label className="text-xs text-gray-400 font-bold">Req. Attempts</label>
                  <input
                    type="number"
                    placeholder="All"
                    value={q.requiredAttempts || ""}
                    onChange={(e) => handleQuestionChange(index, "requiredAttempts", e.target.value ? Number(e.target.value) : null)}
                    className="w-full mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none text-sm"
                  />
                </div>

                {/* QNO */}
                <div>
                  <label className="text-xs text-gray-400 font-bold">Q. No</label>
                  <input
                    type="text"
                    value={q.qNo || ""}
                    onChange={(e) => handleQuestionChange(index, "qNo", e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none text-sm"
                  />
                </div>

                {/* MARKS */}
                <div>
                  <label className="text-xs text-gray-400 font-bold">Max Marks</label>
                  <input
                    type="number"
                    value={q.maxMarks || 0}
                    onChange={(e) => handleQuestionChange(index, "maxMarks", e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none text-sm"
                  />
                </div>

                {/* DELETE */}
                <div className="flex items-end">
                  <button
                    onClick={() => deleteQuestion(q._id, index)}
                    className="w-full flex items-center justify-center gap-1 bg-red-500/20 text-red-400 p-3 rounded-xl font-bold hover:bg-red-500/30 transition text-sm"
                  >
                    <Trash2 size={16} /> Del
                  </button>
                </div>
              </div>
            </div>

            {/* QUESTION TEXT */}
            <textarea
              rows={5}
              value={q.question || ""}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-2xl p-5 text-white resize-none leading-7 focus:border-cyan-500 outline-none"
              placeholder="Question content..."
            />
          </div>
        ))}

        {/* ADD */}
        <button
          onClick={addQuestion}
          className="w-full py-5 rounded-3xl border-2 border-dashed border-cyan-500/30 text-cyan-400 font-bold text-lg hover:bg-cyan-500/10 transition flex items-center justify-center gap-3"
        >
          <PlusCircle size={22} /> Add Missing Question
        </button>
      </div>
    </div>
  );
}

export default DetectedQuestionsEditor;