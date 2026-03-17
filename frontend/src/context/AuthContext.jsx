// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('cc_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('cc_user', JSON.stringify(user));
    else localStorage.removeItem('cc_user');
  }, [user]);

  const login = (userObj, token) => {
    setUser({ ...userObj, token });
    if (token) localStorage.setItem('cc_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);