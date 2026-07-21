import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // If token exists, try to get student profile
          // But wait, what if the token is a teacher's or admin's? 
          // The backend /api/student/auth/me will return 401 if it's not a student token.
          // This might be tricky if multiple roles share the same 'token' key in localStorage.
          // For now, let's keep it isolated or handle errors silently.
          const res = await api.get("/student/auth/me");
          if (res.data.student) {
            setStudent(res.data.student);
          }
        } catch (error) {
          console.error("Student auth check failed:", error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            // It might be a teacher/admin token, don't necessarily clear it unless on student route
            // But if we want to be safe, we just setStudent(null)
            setStudent(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (registrationNumber, password) => {
    try {
      const res = await api.post("/student/auth/login", { registrationNumber, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setStudent(res.data.student);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setStudent(null);
  };

  return (
    <StudentContext.Provider
      value={{ student, loading, token, login, logout, setStudent }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentAuth = () => useContext(StudentContext);
