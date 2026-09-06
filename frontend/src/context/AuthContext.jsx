import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      // Remove old tokens from the previous localStorage setup
      localStorage.removeItem("token");

      const savedToken = sessionStorage.getItem("token");

      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error(
          "Session expired or invalid:",
          err.response?.status,
          err.response?.data
        );

        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signup = async (username, email, password) => {
    const res = await api.post("/auth/signup", {
      username,
      email,
      password,
    });

    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post("/auth/resend-otp", {
      email,
    });

    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", {
      email,
    });

    return res.data;
  };

  const resetPassword = async (resetToken, newPassword) => {
    const res = await api.post("/auth/reset-password", {
      token: resetToken,
      new_password: newPassword,
    });

    return res.data;
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    const res = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = res.data.access_token;

    // Clear old storage
    localStorage.removeItem("token");

    // Store the new token
    sessionStorage.setItem("token", accessToken);
    setToken(accessToken);

    // Get logged-in user
    const meRes = await api.get("/auth/me");
    setUser(meRes.data);

    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}