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
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setTeacher(res.data.teacher);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTeacher(null);
  };

  return (
    <AuthContext.Provider
      value={{ teacher, loading, token, login, register, logout, setTeacher }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
