import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-colors"
          />
          <button
            type="button" onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link to="/forgot-password" className="text-sm text-emerald font-medium hover:underline">
          Forgot Password?
        </Link>
      </div>

      {error && (
        <div className="text-sm text-coral">
          <p>{error}</p>
          {error.toLowerCase().includes("verify your email") && (
            <button
              type="button"
              onClick={() => navigate("/verify-otp", { state: { email } })}
              className="text-emerald font-medium hover:underline mt-1"
            >
              Resend verification code
            </button>
          )}
        </div>
      )}

      <button
        type="submit" disabled={submitting}
        className="w-full bg-emerald text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}