// import { createContext, useContext, useState, useEffect } from "react";
// import api from "../api/axios";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const bootstrap = async () => {
//       if (token) {
//         try {
//           const res = await api.get("/auth/me");
//           setUser(res.data);
//         } catch (err) {
//           localStorage.removeItem("token");
//           setToken(null);
//           setUser(null);
//         }
//       }
//       setLoading(false);
//     };
//     bootstrap();
//   }, [token]);

//   // No longer auto-logs in — backend requires email verification first
//   const signup = async (username, email, password) => {
//     const res = await api.post("/auth/signup", { username, email, password });
//     return res.data; // { message: "..." }
//   };

//   const login = async (email, password) => {
//     const formData = new URLSearchParams();
//     formData.append("username", email);
//     formData.append("password", password);

//     const res = await api.post("/auth/login", formData, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });

//     const accessToken = res.data.access_token;
//     localStorage.setItem("token", accessToken);
//     setToken(accessToken);

//     try {
//       const meRes = await api.get("/auth/me");
//       setUser(meRes.data);
//     } catch (err) {
//       // ignore
//     }

//     return res.data;
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
//   return ctx;
// }





import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, [token]);

  const signup = async (username, email, password) => {
    const res = await api.post("/auth/signup", { username, email, password });
    return res.data; // { message, email }
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post("/auth/resend-otp", { email });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await api.post("/auth/reset-password", { token, new_password: newPassword });
    return res.data;
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = res.data.access_token;
    localStorage.setItem("token", accessToken);
    setToken(accessToken);

    try {
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
    } catch (err) {
      // ignore
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signup, verifyOtp, resendOtp, forgotPassword, resetPassword, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}