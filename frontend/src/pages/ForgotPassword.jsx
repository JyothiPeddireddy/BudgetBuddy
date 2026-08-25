import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <p className="text-sm text-emerald font-medium">
          If an account exists for that email, a reset link has been sent. Check your inbox.
        </p>
      ) : (
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
          {error && <p className="text-sm text-coral">{error}</p>}
          <button
            type="submit" disabled={submitting}
            className="w-full bg-emerald text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="text-center text-sm text-slate mt-6">
        Remembered it? <Link to="/login" className="text-emerald font-medium hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}