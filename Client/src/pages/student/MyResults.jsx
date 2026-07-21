import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import { Loader2, Award, Download, AlertTriangle, FileText } from "lucide-react";

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await api.get("/student/portal/my-results");
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const downloadPDF = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32}/></div>;
  }

  return (
    <div className="space-y-8 print:space-y-0 print:m-0 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="text-blue-500" /> My Results
        </h1>
      </div>

      {results.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 flex flex-col items-center text-center print:hidden">
          <FileText size={48} className="text-blue-400 mb-4" />
          <h2 className="text-xl font-bold text-blue-800 mb-2">No Results Available</h2>
          <p className="text-blue-700">
            You currently have no published results. Results will appear here once they are evaluated and published by the administration.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map((result) => (
            <div key={result._id} className="bg-white rounded-3xl p-8 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-slate-100 max-w-4xl mx-auto print:shadow-none print:border-none print:w-full print:p-0">
              
              {/* Result Header */}
              <div className="text-center border-b-2 border-slate-200 pb-6 mb-8">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest">Academic Result</h2>
                <h3 className="text-xl font-bold text-blue-600 mt-2">{result.exam?.name}</h3>
                <p className="text-slate-500 mt-1">{new Date(result.exam?.date).toLocaleDateString()}</p>
              </div>

              {/* Student Details */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Student Name</div>
                    <div className="font-bold text-slate-800">{result.student?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Registration No</div>
                    <div className="font-bold text-slate-800">{result.student?.registrationNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Roll No</div>
                    <div className="font-bold text-slate-800">{result.student?.rollNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Course</div>
                    <div className="font-bold text-slate-800">{result.student?.course} - {result.student?.semester}</div>
                  </div>
                </div>
              </div>

              {/* Marks Table */}
              <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-4 px-6 font-bold text-slate-700">Subject</th>
                      <th className="py-4 px-6 font-bold text-slate-700 text-center">Max Marks</th>
                      <th className="py-4 px-6 font-bold text-slate-700 text-center">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subjects.map((sub, i) => (
                      <tr key={i} className="border-t border-slate-200">
                        <td className="py-4 px-6 font-medium text-slate-800">{sub.subjectName}</td>
                        <td className="py-4 px-6 text-center text-slate-600">{sub.maxMarks}</td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800">{sub.marksObtained}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                    <tr>
                      <td className="py-4 px-6 font-black text-slate-800 text-right">TOTAL</td>
                      <td className="py-4 px-6 font-black text-slate-800 text-center">{result.totalMaxMarks}</td>
                      <td className="py-4 px-6 font-black text-blue-600 text-center">{result.totalMarksObtained}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                  <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Percentage</div>
                  <div className="text-3xl font-black text-blue-800">{result.percentage}%</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
                  <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Grade</div>
                  <div className="text-3xl font-black text-indigo-800">{result.grade}</div>
                </div>
                <div className={`${result.passStatus === 'Pass' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} rounded-2xl p-6 text-center`}>
                  <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${result.passStatus === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>Status</div>
                  <div className="text-3xl font-black">{result.passStatus}</div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-8 flex justify-center print:hidden">
                <button onClick={downloadPDF} className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-900 transition-colors flex items-center gap-2">
                  <Download size={20} /> Download Marksheet
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResults;
