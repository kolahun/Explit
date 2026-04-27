import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("expenseSplitterToken")));

  useEffect(() => {
    const token = localStorage.getItem("expenseSplitterToken");
    if (!token) return;

    apiRequest("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("expenseSplitterToken"))
      .finally(() => setLoading(false));
  }, []);

  async function loginWithGoogle(credential) {
    const data = await apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential })
    });
    localStorage.setItem("expenseSplitterToken", data.token);
    setUser(data.user);
  }

  async function loginWithPassword(email, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("expenseSplitterToken", data.token);
    setUser(data.user);
  }

  async function registerWithPassword(name, email, password) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem("expenseSplitterToken", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("expenseSplitterToken");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, loginWithGoogle, loginWithPassword, registerWithPassword, logout }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
