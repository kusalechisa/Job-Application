import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);

const [token, setToken] = useState(
  localStorage.getItem("token") || null
);
const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
};
const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
};
return (
<AuthContext.Provider value={{ user, token, login, logout }}>
{children}
</AuthContext.Provider>
);
};
export const useAuth = () => useContext(AuthContext);
