import { useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthState";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem("stockify-session");
    return saved ? JSON.parse(saved) : null;
  });

  const saveSession = (data) => {
    localStorage.setItem("stockify-session", JSON.stringify(data));
    setSession(data);
  };

  const logout = () => {
    localStorage.removeItem("stockify-session");
    setSession(null);
  };

  const token = session?.token;
  const api = useMemo(() => {
    const client = axios.create({ baseURL: API_BASE, timeout: 8000 });

    client.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return client;
  }, [token]);

  const value = useMemo(
    () => ({ api, session, saveSession, logout }),
    [api, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
