import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Loader2, ArrowLeft, Users, TrendingUp, Award, Activity } from "lucide-react";

const AdminSubjectResultDetails = () => {
  const { questionPaperId } = useParams();
  const [evaluations, setEvaluations] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchDetails = async () => {
    try {
      const res = await api.get(`/admin/subject-results/${questionPaperId}`);
      const evals = res.data.evaluations || [];
      setEvaluations(evals);
      if (evals.length > 0 && evals[0].answerSheet?.questionPaper) {
        setSubject(evals[0].answerSheet.questionPaper);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load result details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [questionPaperId]);

  

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalStudents = evaluations.length;
  const maxMarks = subject ? subject.totalMarks : 100;
  
  let totalScoreSum = 0;
  let highestScore = 0;
  let passCount = 0;
  const passingScore = maxMarks * 0.4; // Assuming 40% is passing

  evaluations.forEach(ev => {
    const score = Number(ev.totalMarks || 0);
    totalScoreSum += score;
    if (score > highestScore) highestScore = score;
    if (score >= passingScore) passCount++;
  });

  const averageScore = totalStudents > 0 ? (totalScoreSum / totalStudents).toFixed(1) : 0;
  const passPercentage = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Link to="/admin/results" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors shrink-0 self-start md:self-auto">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">{subject ? subject.subject : "Subject Results"}</h1>
          <p className="text-gray-400 mt-1">{subject ? `${subject.examName} | ${subject.session}` : "Global class performance breakdown"}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Students</p>
            <p className="text-2xl font-black text-white">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Average Score</p>
            <p className="text-2xl font-black text-white">{averageScore} <span className="text-sm text-gray-500">/ {maxMarks}</span></p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Highest Score</p>
            <p className="text-2xl font-black text-white">{highestScore}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Pass Percentage</p>
            <p className="text-2xl font-black text-white">{passPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Global Student Roster</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="p-4 font-semibold text-gray-400 text-sm">Roll Number</th>
                <th className="p-4 font-semibold text-gray-400 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-400 text-sm">Score</th>
                <th className="p-4 font-semibold text-gray-400 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-400 text-sm">Evaluator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {evaluations.map(ev => {
                const score = Number(ev.totalMarks || 0);
                const isPass = score >= passingScore;
                
                return (
                  <tr key={ev._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-cyan-400">{ev.rollNumber || ev.answerSheet?.rollNumber}</td>
                    <td className="p-4 font-medium text-white">{ev.studentName || ev.answerSheet?.studentName}</td>
                    <td className="p-4 font-bold text-white">{score} <span className="text-gray-500 font-normal text-xs">/ {maxMarks}</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${isPass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {ev.teacher ? ev.teacher.name : "Unknown"}
                    </td>
                  </tr>
                );
              })}
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubjectResultDetails;
