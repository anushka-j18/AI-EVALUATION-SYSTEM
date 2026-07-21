import { useStudentAuth } from "../../context/StudentContext";
import { GraduationCap, Hash, Book, MapPin } from "lucide-react";

const StudentDashboard = () => {
  const { student } = useStudentAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-800">
          Welcome back, {student?.name?.split(' ')[0]}!
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#f1f5f9] rounded-3xl p-8 shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] border border-white/60">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)]">
            <GraduationCap size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Student Profile</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Hash size={18}/> Registration No</span>
              <span className="font-mono font-bold text-slate-800">{student?.registrationNumber}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Hash size={18}/> Roll No</span>
              <span className="font-bold text-slate-800">{student?.rollNumber}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Book size={18}/> Course</span>
              <span className="font-bold text-slate-800">{student?.course}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white">
              <span className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={18}/> Semester</span>
              <span className="font-bold text-slate-800">{student?.semester}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-[10px_10px_20px_#cbd5e1] border border-blue-400/30 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-2xl font-black mb-2">Exam Portal</h3>
               <p className="text-blue-100 mb-6">Register for upcoming exams, download admit cards, and view your results here.</p>
             </div>
             <div className="absolute -bottom-10 -right-10 opacity-20">
               <GraduationCap size={150} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
