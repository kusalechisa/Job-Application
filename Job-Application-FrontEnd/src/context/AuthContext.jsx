import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../../api/axiosInstance.jsx";
import { logout as LogoutAPI } from "../../api/Endpoints/Auth.jsx";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      await LogoutAPI();
    } catch (error) {
      console.error("Logout API error:", error);
    }
    setUser(null);
    setToken(null);
    localStorage.clear();
    setAuthToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
