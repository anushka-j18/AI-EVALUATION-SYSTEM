import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminContext";
import { Sparkles, Loader2, Mail, Lock, ArrowLeft, User, Building, Briefcase, Eye, EyeOff } from "lucide-react";
import api from "../api/axiosConfig";

const Login = () => {
  const [mode, setMode] = useState("login"); // "login", "signup", "verify-signup", "forgot-password", "reset-password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login: teacherLogin, register, verifyRegistration, forgotPassword, resetPassword } = useAuth();
  const { login: adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    // We intentionally keep email filled for smooth transitions, but clear others if needed
    if (newMode === 'login' || newMode === 'signup' || newMode === 'forgot-password') {
      setPassword("");
      setOtp("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        if (email === "admin@gmail.com") {
          const result = await adminLogin(email, password);
          if (result.success) navigate("/admin");
          else setError(result.message);
        } else {
          const result = await teacherLogin(email, password);
          if (result.success) {
            navigate("/dashboard");
          } else {
            setError(result.message);
            if (result.notActive) {
              setMode("verify-signup");
              // Try to resend OTP implicitly or just show verify screen
              setSuccessMsg("Your account is not active. Please enter the OTP sent to your email. If you need a new OTP, try signing up again or resetting password.");
            }
          }
        }
      } else if (mode === "signup") {
        const result = await register({ name, email, password, department, employeeId });
        if (result.success) {
          setSuccessMsg(result.message || "OTP sent to your email.");
          setMode("verify-signup");
        } else {
          setError(result.message);
        }
      } else if (mode === "verify-signup") {
        const result = await verifyRegistration(email, otp);
        if (result.success) {
          navigate("/dashboard");
        } else {
          setError(result.message);
        }
      } else if (mode === "forgot-password") {
        // Only teachers use this flow now, admin can use it if added
        const result = await forgotPassword(email);
        if (result.success) {
          setSuccessMsg(result.message || "OTP sent to your email.");
          setMode("reset-password");
        } else {
          // If teacher reset fails, try admin fallback (legacy behavior, though Admin OTP isn't implemented fully in backend)
          try {
            await api.post("/admin/auth/reset-password", { email, newPassword: password });
            setSuccessMsg("Admin password reset successfully (Legacy).");
          } catch (err) {
            setError(result.message || "Failed to send reset OTP.");
          }
        }
      } else if (mode === "reset-password") {
        const result = await resetPassword(email, otp, password); // password field holds newPassword
        if (result.success) {
          setSuccessMsg("Password reset successfully. You can now log in.");
          handleModeChange("login");
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white text-center">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {(mode === "verify-signup" || mode === "reset-password") && "Verify OTP"}
            {mode === "forgot-password" && "Reset Password"}
          </h1>
          <p className="text-gray-400 mt-2 text-center text-sm">
            {mode === "login" && "Sign in to continue to the Digital Evaluation System"}
            {mode === "signup" && "Register to join as an Evaluator"}
            {mode === "verify-signup" && `Enter the 6-digit code sent to ${email}`}
            {mode === "forgot-password" && "Enter your email to receive an OTP"}
            {mode === "reset-password" && "Enter your OTP and a new password"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm mb-6 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field - Used in almost all modes except verify-signup/reset-password if we already have it (but we show it disabled to be clear) */}
          <div className={mode === "verify-signup" || mode === "reset-password" ? "hidden" : "block"}>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-gray-500" /></div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={mode === 'verify-signup' || mode === 'reset-password'} className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-600 disabled:opacity-50" placeholder="teacher@institute.edu" />
            </div>
          </div>

          {/* Signup Specific Fields */}
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-gray-500" /></div>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-600" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Building size={18} className="text-gray-500" /></div>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-600" placeholder="Computer Science" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Briefcase size={18} className="text-gray-500" /></div>
                  <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-600" placeholder="FAC-12345" />
                </div>
              </div>
            </>
          )}

          {/* OTP Field */}
          {(mode === "verify-signup" || mode === "reset-password") && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">6-Digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-gray-500" /></div>
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-600 tracking-widest font-mono text-center" placeholder="123456" />
              </div>
            </div>
          )}

          {/* Password Field */}
          {(mode === "login" || mode === "signup" || mode === "reset-password") && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-400">
                  {mode === "reset-password" ? "New Password" : "Password"}
                </label>
                {mode === "login" && (
                  <button type="button" onClick={() => handleModeChange("forgot-password")} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-gray-500" /></div>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-600" placeholder="••••••••" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/25 flex items-center justify-center mt-4 disabled:opacity-70 disabled:hover:scale-100">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
              mode === "login" ? "Sign In" :
              mode === "signup" ? "Create Account" :
              mode === "verify-signup" ? "Verify & Activate" :
              mode === "forgot-password" ? "Send Reset OTP" :
              "Update Password"
            )}
          </button>
        </form>

        {/* Mode Toggles */}
        <div className="mt-6 flex flex-col gap-3">
          {mode !== "login" && (
            <button type="button" onClick={() => handleModeChange("login")} className="w-full text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
