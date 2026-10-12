import React, { useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [searchTerm, setSearchTerm] = useState("");

  const login = (newUser, newToken) => {
    if (newToken) localStorage.setItem("token", newToken);
    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken || null);
    setUser(newUser || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setSearchTerm("");
  };

  const value = useMemo(
    () => ({ token, user, login, logout, searchTerm, setSearchTerm }),
    [token, user, searchTerm]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
