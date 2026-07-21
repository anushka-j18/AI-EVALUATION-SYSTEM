import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Loader2, Users, ArrowLeft, CheckCircle, Clock } from "lucide-react";

const AdminExamRegistrations = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get(`/admin/exams/${id}/registrations`);
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  const toggleFeeStatus = async (regId, currentStatus) => {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
    try {
      await api.put(`/admin/exams/registration/${regId}/fee`, { feeStatus: newStatus });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/exams" className="p-2 bg-[#f1f5f9] rounded-full text-slate-500 hover:text-slate-800 transition-colors shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-blue-500" /> Exam Registrations
        </h1>
      </div>

      <div className="bg-[#f1f5f9] rounded-2xl p-6 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/60">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : registrations.length === 0 ? (
          <div className="text-center p-8 text-slate-500">No registrations found for this exam.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-3 px-4 font-bold text-slate-600">Student Name</th>
                  <th className="py-3 px-4 font-bold text-slate-600">Reg No</th>
                  <th className="py-3 px-4 font-bold text-slate-600">Roll No</th>
                  <th className="py-3 px-4 font-bold text-slate-600">Fee Status</th>
                  <th className="py-3 px-4 font-bold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{reg.student.name}</td>
                    <td className="py-3 px-4 font-mono text-sm">{reg.student.registrationNumber}</td>
                    <td className="py-3 px-4">{reg.student.rollNumber}</td>
                    <td className="py-3 px-4">
                      {reg.feeStatus === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => toggleFeeStatus(reg._id, reg.feeStatus)}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
                        Mark {reg.feeStatus === "Paid" ? "Pending" : "Paid"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExamRegistrations;
