import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
