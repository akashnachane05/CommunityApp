import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectByRole = (role) => {
    if (role === "Admin") navigate("/admin");
    else if (role === "Student") navigate("/student");
    else if (role === "Alumni") navigate("/alumni");
    else navigate("/login");
  };

  const login = async (email, password) => {
    try {
      setLoading(true); setError("");
      const res = await api.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      redirectByRole(res.data.user.role);
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
      throw e;
    } finally { setLoading(false); }
  };

  const register = async (payload) => {
    try {
      setLoading(true); setError("");
      const res = await api.post("/users/register", payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      redirectByRole(res.data.user.role);
    } catch (e) {
      setError(e?.response?.data?.message || "Registration failed");
      throw e;
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Eject on 401/403
  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        if ([401, 403].includes(err?.response?.status)) logout();
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  const value = useMemo(() => ({ user, token, loading, error, login, register, logout }), [user, token, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
