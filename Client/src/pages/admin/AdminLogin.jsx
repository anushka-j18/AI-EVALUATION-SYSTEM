import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminContext";
import { ShieldCheck, Loader2, Mail, Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows for Admin (Red/Orange) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Admin Portal</h1>
          <p className="text-gray-400 mt-2 text-center text-sm">
            Sign in to manage the Digital Evaluation System
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-gray-600"
                placeholder="admin@des.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-red-500/25 flex items-center justify-center mt-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              "Secure Login"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Return to Teacher Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
