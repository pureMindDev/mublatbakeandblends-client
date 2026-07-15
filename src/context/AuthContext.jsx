import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const navigate = useNavigate();

  const [admin, setAdmin] = useState(
    () => {
      const stored = localStorage.getItem("mublat_admin");
      return stored ? JSON.parse(stored) : null;
    }
  );

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("mublat_token")
  );

  const [authLoading, setAuthLoading] = useState(true);

  /* On mount: verify stored token is still valid */
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("mublat_token");
      if (!token) { setAuthLoading(false); return; }
      try {
        const { data } = await api.get("/auth/me");
        setAdmin(data.admin);
        setIsAuthenticated(true);
        localStorage.setItem("mublat_admin", JSON.stringify(data.admin));
      } catch {
        clearAuth();
      } finally {
        setAuthLoading(false);
      }
    };
    verifyToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Login — calls real API, returns error string or null */
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("mublat_token",     data.token);
      localStorage.setItem("mublat_admin",     JSON.stringify(data.admin));
      localStorage.setItem("mublat_admin_auth","true");
      setAdmin(data.admin);
      setIsAuthenticated(true);
      navigate("/admin/dashboard");
      return null;
    } catch (err) {
      return err.response?.data?.message || "Invalid email or password.";
    }
  };

  const logout = () => { clearAuth(); navigate("/admin"); };

  const clearAuth = () => {
    localStorage.removeItem("mublat_token");
    localStorage.removeItem("mublat_admin");
    localStorage.removeItem("mublat_admin_auth");
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
