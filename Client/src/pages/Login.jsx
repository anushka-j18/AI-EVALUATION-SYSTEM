import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminContext";
import { useStudentAuth } from "../context/StudentContext";
import { Sparkles, Loader2, Mail, Lock, ArrowLeft, User, Building, Briefcase, Eye, EyeOff, Hash } from "lucide-react";
import api from "../api/axiosConfig";

const Login = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "teacher"; // "teacher", "student", or "admin"

  const [mode, setMode] = useState("login"); // "login", "signup", "verify-signup", "forgot-password", "reset-password"
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login: teacherLogin, register, verifyRegistration, forgotPassword, verifyResetOtp, resetPassword } = useAuth();
  const { login: adminLogin } = useAdminAuth();
  const { login: studentLogin } = useStudentAuth();
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
        if (role === "admin") {
          const result = await adminLogin(email, password);
          if (result.success) navigate("/admin");
          else setError(result.message || "Admin login failed.");
        } else if (role === "student") {
          const result = await studentLogin(registrationNumber, password);
          if (result.success) navigate("/student/dashboard");
          else setError(result.message || "Student login failed.");
        } else {
          const result = await teacherLogin(email, password);
          if (result.success) {
            navigate("/dashboard");
          } else {
            setError(result.message);
            if (result.notActive) {
              setMode("verify-signup");
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
          setMode("verify-reset-otp");
        } else {
          // If teacher reset fails, try admin fallback (legacy behavior, though Admin OTP isn't implemented fully in backend)
          try {
            await api.post("/admin/auth/reset-password", { email, newPassword: password });
            setSuccessMsg("Admin password reset successfully (Legacy).");
          } catch (err) {
            setError(result.message || "Failed to send reset OTP.");
          }
        }
      } else if (mode === "verify-reset-otp") {
        const result = await verifyResetOtp(email, otp);
        if (result.success) {
          setSuccessMsg("OTP verified! Please enter your new password.");
          setMode("reset-password");
        } else {
          setError(result.message);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
      backgroundColor: '#f8fafc',
      backgroundImage: `
        radial-gradient(at 0% 0%, hsla(210, 100%, 94%, 1) 0px, transparent 50%),
        radial-gradient(at 100% 0%, hsla(190, 100%, 92%, 1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, hsla(220, 100%, 95%, 1) 0px, transparent 50%),
        radial-gradient(at 0% 100%, hsla(250, 100%, 96%, 1) 0px, transparent 50%),
        radial-gradient(at 50% 50%, hsla(200, 100%, 93%, 1) 0px, transparent 50%)
      `
    }}>
      <div className="w-full max-w-md bg-[#f1f5f9] border border-white/80 rounded-[2.5rem] p-8 z-10 relative"
           style={{
             boxShadow: "20px 20px 40px #cbd5e1, -20px -20px 40px #ffffff",
           }}>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mb-4"
               style={{ boxShadow: "8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff" }}>
            <Sparkles size={32} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 text-center tracking-tight">
            {mode === "login" && role === "teacher" && "Teacher Login"}
            {mode === "login" && role === "student" && "Student Login"}
            {mode === "login" && role === "admin" && "Admin Login"}
            {mode === "signup" && "Create Account"}
            {(mode === "verify-signup" || mode === "verify-reset-otp") && "Verify OTP"}
            {mode === "forgot-password" && "Reset Password"}
            {mode === "reset-password" && "Change Password"}
          </h1>
          <p className="text-slate-500 mt-2 text-center text-sm font-medium">
            {mode === "login" && role === "teacher" && "Sign in to access your teaching dashboard"}
            {mode === "login" && role === "student" && "Sign in to view your academic results"}
            {mode === "login" && role === "admin" && "Sign in to manage the Digital Evaluation System"}
            {mode === "signup" && "Register to join as an Evaluator"}
            {(mode === "verify-signup" || mode === "verify-reset-otp") && `Enter the 6-digit code sent to ${email}`}
            {mode === "forgot-password" && "Enter your email to receive an OTP"}
            {mode === "reset-password" && "Enter your new password"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 text-center shadow-inner border border-red-100">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-500 p-4 rounded-xl text-sm mb-6 text-center shadow-inner border border-green-100">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email/Registration Field */}
          <div className={mode === "verify-signup" || mode === "verify-reset-otp" || mode === "reset-password" ? "hidden" : "block"}>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              {role === "student" && mode === "login" ? "Registration Number" : "Email Address"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {role === "student" && mode === "login" ? <Hash size={18} className="text-slate-400" /> : <Mail size={18} className="text-slate-400" />}
              </div>
              {role === "student" && mode === "login" ? (
                <input type="text" required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                       className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none transition-all placeholder-slate-400" 
                       style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                       placeholder="REG-12345" />
              ) : (
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={mode === 'verify-signup' || mode === 'verify-reset-otp' || mode === 'reset-password'} 
                       className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none transition-all placeholder-slate-400 disabled:opacity-50" 
                       style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                       placeholder="name@institute.edu" />
              )}
            </div>
          </div>

          {/* Signup Specific Fields */}
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-slate-400" /></div>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                         className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none transition-all placeholder-slate-400" 
                         style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                         placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Building size={18} className="text-slate-400" /></div>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} 
                         className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none transition-all placeholder-slate-400" 
                         style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                         placeholder="Computer Science" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Briefcase size={18} className="text-slate-400" /></div>
                  <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} 
                         className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none transition-all placeholder-slate-400" 
                         style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                         placeholder="FAC-12345" />
                </div>
              </div>
            </>
          )}

          {/* OTP Field */}
          {(mode === "verify-signup" || mode === "verify-reset-otp") && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">6-Digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} 
                       className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none transition-all placeholder-slate-400 tracking-widest font-mono text-center" 
                       style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                       placeholder="123456" />
              </div>
            </div>
          )}

          {/* Password Field */}
          {(mode === "login" || mode === "signup" || mode === "reset-password") && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-600">
                  {mode === "reset-password" ? "New Password" : "Password"}
                </label>
                {mode === "login" && (
                  <button type="button" onClick={() => handleModeChange("forgot-password")} className="text-xs text-blue-500 hover:text-blue-600 font-bold transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} 
                       className="w-full bg-[#f1f5f9] rounded-xl py-3 pl-11 pr-10 text-slate-800 focus:outline-none transition-all placeholder-slate-400" 
                       style={{ boxShadow: "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff" }}
                       placeholder="••••••••" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} 
            className="w-full py-4 rounded-xl bg-[#f1f5f9] text-blue-600 font-black transition-all flex items-center justify-center mt-8 disabled:opacity-70 disabled:hover:scale-100"
            style={{
              boxShadow: "8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff"
            }}
            onMouseDown={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff")}
            onMouseUp={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = "8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff")}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.boxShadow = "8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff")}
          >
            {isSubmitting ? <Loader2 className="animate-spin text-blue-500" size={24} /> : (
              mode === "login" ? "Sign In" :
              mode === "signup" ? "Create Account" :
              mode === "verify-signup" ? "Verify & Activate" :
              mode === "forgot-password" ? "Send Reset OTP" :
              mode === "verify-reset-otp" ? "Verify OTP" :
              "Update Password"
            )}
          </button>
        </form>

        {/* Mode Toggles */}
        <div className="mt-6 flex flex-col gap-3">
          {mode !== "login" && (
            <button type="button" onClick={() => handleModeChange("login")} className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
