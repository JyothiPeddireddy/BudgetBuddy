// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// export default function LoginForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSubmitting(true);
//     try {
//       await login(email, password);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.detail || "Invalid email or password.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <label className="eyebrow !text-slate">Email</label>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           className="ledger-input"
//           placeholder="you@example.com"
//         />
//       </div>
//       <div>
//         <label className="eyebrow !text-slate">Password</label>
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           className="ledger-input"
//           placeholder="••••••••"
//         />
//       </div>

//       {error && (
//         <p className="text-sm text-brick border-l-2 border-brick pl-3">{error}</p>
//       )}

//       <button
//         type="submit"
//         disabled={submitting}
//         className="w-full bg-ink text-paper py-3 font-medium tracking-wide hover:bg-ink-soft transition-colors disabled:opacity-50"
//       >
//         {submitting ? "Signing in…" : "Sign in"}
//       </button>
//     </form>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="auth-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-field"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="auth-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-field"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-brick border-l-2 border-brick pl-3">{error}</p>
      )}

      <button type="submit" disabled={submitting} className="auth-button">
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}