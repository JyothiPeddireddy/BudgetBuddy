import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";
import { getPasswordRequirements, isPasswordStrong } from "../utils/passwordValidation";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requirements = getPasswordRequirements(password);
  const passwordValid = isPasswordStrong(password);

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing its token.">
        <Link to="/forgot-password" className="text-sm text-emerald font-medium hover:underline">
          Request a new reset link
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      const res = await resetPassword(token, password);
      setSuccess(res.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "This link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a new password for your account.">
      {success ? (
        <p className="text-sm text-emerald font-medium">{success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setTouched(true)}
                placeholder="Create a new password"
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
            <label className="block text-sm font-medium text-ink mb-1.5">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"} required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-colors"
            />
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit" disabled={submitting}
            className="w-full bg-emerald text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}