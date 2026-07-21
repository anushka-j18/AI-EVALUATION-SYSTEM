import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Calendar, Edit3, CheckCircle, Clock } from "lucide-react";

const StudentExamRegistration = () => {
  const [availableExams, setAvailableExams] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringFor, setRegisteringFor] = useState(null);
  const [payingFor, setPayingFor] = useState(null);

  const fetchData = async () => {
    try {
      const [examsRes, regRes] = await Promise.all([
        api.get("/student/portal/available-exams"),
        api.get("/student/portal/my-registrations")
      ]);
      setAvailableExams(examsRes.data);
      setMyRegistrations(regRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (examId) => {
    setRegisteringFor(examId);
    try {
      const res = await api.post(`/student/portal/register/${examId}`);
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register.");
    } finally {
      setRegisteringFor(null);
    }
  };

  const handlePayFee = async (regId) => {
    setPayingFor(regId);
    try {
      const res = await api.put(`/student/portal/pay-fee/${regId}`);
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Failed to pay fee.");
    } finally {
      setPayingFor(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32}/></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Edit3 className="text-blue-500" /> Exam Registration
        </h1>

        <div className="bg-[#f1f5f9] rounded-3xl p-8 shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] border border-white/60">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Available Exams</h2>
          {availableExams.length === 0 ? (
            <div className="text-slate-500">No upcoming exams available for registration.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {availableExams.map(exam => (
                <div key={exam._id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 transition-colors shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg">{exam.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 mb-4">
                    <Calendar size={14} /> {new Date(exam.date).toLocaleDateString()}
                  </div>
                  <button onClick={() => handleRegister(exam._id)} disabled={registeringFor === exam._id}
                          className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex justify-center items-center gap-2">
                    {registeringFor === exam._id ? <Loader2 size={16} className="animate-spin" /> : "Register Now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">My Registrations</h2>
        <div className="bg-[#f1f5f9] rounded-3xl p-8 shadow-[15px_15px_30px_#cbd5e1,-15px_-15px_30px_#ffffff] border border-white/60">
          {myRegistrations.length === 0 ? (
            <div className="text-slate-500">You haven't registered for any exams yet.</div>
          ) : (
            <div className="space-y-4">
              {myRegistrations.map(reg => (
                <div key={reg._id} className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{reg.exam?.name}</h3>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <Calendar size={14} /> {new Date(reg.exam?.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider text-right">Fee Status</div>
                      {reg.feeStatus === "Paid" ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
                          <CheckCircle size={16} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold border border-amber-200">
                          <Clock size={16} /> Pending
                        </span>
                      )}
                    </div>
                    {reg.feeStatus !== "Paid" && (
                      <button onClick={() => handlePayFee(reg._id)} disabled={payingFor === reg._id}
                              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2 h-full mt-5">
                        {payingFor === reg._id ? <Loader2 size={16} className="animate-spin" /> : "Pay Fee"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExamRegistration;
