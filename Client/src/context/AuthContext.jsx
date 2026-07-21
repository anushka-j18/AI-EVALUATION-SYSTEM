import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setTeacher(res.data.teacher);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setTeacher(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setTeacher(res.data.teacher);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        notActive: error.response?.data?.notActive,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const verifyRegistration = async (email, otp) => {
    try {
      const res = await api.post("/auth/verify-registration", { email, otp });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setTeacher(res.data.teacher);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Verification failed",
      };
    }
  }

  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send reset OTP",
      };
    }
  }

  const verifyResetOtp = async (email, otp) => {
    try {
      const res = await api.post("/auth/verify-reset-otp", { email, otp });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid or expired OTP",
      };
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post("/auth/reset-password", { email, otp, newPassword });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
      };
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{ teacher, loading, token, login, register, verifyRegistration, forgotPassword, verifyResetOtp, resetPassword, logout, setTeacher }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
