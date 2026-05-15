import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../../api/axiosInstance.jsx";
import { logout as logoutAPI, refreshToken } from "../../api/Endpoints/Auth.jsx";
import { getMe } from "../../api/Endpoints/Users.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setAuthToken(nextToken);
  }, []);

  const login = useCallback((data) => {
    persistSession(data.token, data.user);
  }, [persistSession]);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        updateUser(res.data.data);
      } catch {
        try {
          const res = await refreshToken();
          const { token: newToken, user: refreshedUser } = res.data.data;
          persistSession(newToken, refreshedUser);
        } catch {
          setUser(null);
          setToken(null);
          localStorage.clear();
          setAuthToken(null);
        }
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  const logout = async () => {
    try {
      await logoutAPI();
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
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);





