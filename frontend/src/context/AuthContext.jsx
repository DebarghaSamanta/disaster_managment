import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem("department");
    const token = localStorage.getItem("token");
    return role && token ? { role, token } : null;
  });

  const login = ({ token, department }) => {
    setUser({ role: department, token });
    localStorage.setItem("token", token);
    localStorage.setItem("department", department);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
