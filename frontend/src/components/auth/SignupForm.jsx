// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { getPasswordRequirements, isPasswordStrong } from "../../utils/passwordValidation";

// export default function SignupForm() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [touched, setTouched] = useState(false);

//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const requirements = getPasswordRequirements(password);
//   const passwordValid = isPasswordStrong(password);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccessMsg("");

//     if (!passwordValid) {
//       setError("Password does not meet the requirements below.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const res = await signup(username, email, password);
//       setSuccessMsg(res.message || "Check your email to verify your account.");
//     } catch (err) {
//       setError(err.response?.data?.detail || "Signup failed. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (successMsg) {
//     return (
//       <div className="border-l-2 border-gold pl-4 py-2">
//         <p className="text-ink font-medium mb-1">Account created</p>
//         <p className="text-sm text-slate mb-4">{successMsg}</p>
//         <button
//           onClick={() => navigate("/login")}
//           className="text-sm text-ink underline underline-offset-2"
//         >
//           Go to sign in
//         </button>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <label className="eyebrow !text-slate">Username</label>
//         <input
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//           className="ledger-input"
//           placeholder="jane_doe"
//         />
//       </div>
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
//           onFocus={() => setTouched(true)}
//           required
//           className="ledger-input"
//           placeholder="••••••••"
//         />
//         {touched && (
//           <ul className="mt-3 space-y-1.5 font-mono text-xs">
//             {requirements.map((req) => (
//               <li
//                 key={req.label}
//                 className={`flex items-center gap-2 ${
//                   req.valid ? "text-ink-soft" : "text-slate/60"
//                 }`}
//               >
//                 <span>{req.valid ? "✓" : "·"}</span>
//                 {req.label}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {error && (
//         <p className="text-sm text-brick border-l-2 border-brick pl-3">{error}</p>
//       )}

//       <button
//         type="submit"
//         disabled={submitting || !passwordValid}
//         className="w-full bg-ink text-paper py-3 font-medium tracking-wide hover:bg-ink-soft transition-colors disabled:opacity-50"
//       >
//         {submitting ? "Creating account…" : "Create account"}
//       </button>
//     </form>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPasswordRequirements, isPasswordStrong } from "../../utils/passwordValidation";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const requirements = getPasswordRequirements(password);
  const passwordValid = isPasswordStrong(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!passwordValid) {
      setError("Password does not meet the requirements below.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup(username, email, password);
      setSuccessMsg(res.message || "Check your email to verify your account.");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="border-l-2 border-gold pl-4 py-2">
        <p className="text-ink font-semibold mb-1">Account created</p>
        <p className="text-sm text-slate mb-4">{successMsg}</p>
        <button onClick={() => navigate("/login")} className="text-sm text-ink underline underline-offset-2 font-medium">
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="auth-label">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="auth-field"
          placeholder="jane_doe"
        />
      </div>
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
          onFocus={() => setTouched(true)}
          required
          className="auth-field"
          placeholder="••••••••"
        />
        {touched && (
          <ul className="mt-3 space-y-1.5 font-mono text-xs">
            {requirements.map((req) => (
              <li
                key={req.label}
                className={`flex items-center gap-2 ${req.valid ? "text-ink-soft" : "text-slate/60"}`}
              >
                <span>{req.valid ? "✓" : "·"}</span>
                {req.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-sm text-brick border-l-2 border-brick pl-3">{error}</p>
      )}

      <button type="submit" disabled={submitting || !passwordValid} className="auth-button">
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}