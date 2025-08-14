// src/contexts/AuthContext.jsx  (или твой путь)
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // ← ДОБАВИЛИ

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);                     // ← ВАЖНО
      return;
    }
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data.user ?? data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);                   // ← ВАЖНО
      }
    })();
  }, []);

  const login = async ({ usernameOrEmail, password }) => {
    const { data } = await api.post("/auth/login", { usernameOrEmail, password });
    if (data?.token) localStorage.setItem("token", data.token);
    setUser(data.user ?? data);
    setIsAuthenticated(true);
    setAuthChecked(true);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, authChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
