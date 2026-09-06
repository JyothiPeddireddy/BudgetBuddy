import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getPasswordRequirements, isPasswordStrong } from "../../utils/passwordValidation";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const requirements = getPasswordRequirements(password);
  const passwordValid = isPasswordStrong(password);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Safely extracts a plain string message from a backend error response.
  // FastAPI/Pydantic validation errors send `detail` as an ARRAY of objects
  // like { type, loc, msg, input, ctx }, not a plain string. Rendering that
  // array directly in JSX crashes React ("Objects are not valid as a React
  // child"). Custom backend errors (e.g. duplicate email) send `detail` as
  // a plain string. This function handles both shapes safely.
  const extractErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      // Pydantic validation error array — use the first error's message.
      return detail[0].msg || fallback;
    }

    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordValid) {
      setError("Password does not meet the requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup(username, email, password);
      navigate("/verify-otp", { state: { email: res.email || email } });
    } catch (err) {
      setError(extractErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
        <input
          type="text" required value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"} required value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setTouched(true)}
            placeholder="Create a password"
            className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-colors"
          />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {touched && (
          <ul className="mt-2.5 space-y-1 text-xs">
            {requirements.map((req) => (
              <li key={req.label} className={`flex items-center gap-1.5 ${req.valid ? "text-emerald" : "text-slate/60"}`}>
                <span>{req.valid ? "✓" : "·"}</span>
                {req.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"} required value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-brick border-l-2 border-brick pl-3">{error}</p>
      )}

      <button
        type="submit" disabled={submitting}
        className="w-full bg-emerald text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Creating account…" : "Sign Up"}
      </button>
    </form>
  );
}