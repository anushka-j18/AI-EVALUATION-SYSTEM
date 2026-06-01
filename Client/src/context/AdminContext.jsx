import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // We must manually attach the token here for the initial fetch if axios interceptor uses localStorage.getItem("token")
          // But our axiosConfig only checks "token", not "adminToken". 
          // So let's temporarily set it in headers just for this request:
          const res = await api.get("/admin/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdmin(res.data.admin);
        } catch (error) {
          console.error("Admin Auth check failed:", error);
          localStorage.removeItem("adminToken");
          setToken(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/admin/auth/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      
      // We also need to set the standard token so axios automatically sends it
      // Alternatively, update axios config, but this is simpler for dual-role setups
      localStorage.setItem("token", res.data.token); 
      
      setToken(res.data.token);
      setAdmin(res.data.admin);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider
      value={{ admin, loading, token, login, logout, setAdmin }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminContext);
