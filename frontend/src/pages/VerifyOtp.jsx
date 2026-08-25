import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email || "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) {
    return (
      <AuthLayout title="Verify your email" subtitle="Missing signup details.">
        <p className="text-sm text-slate">
          Please <Link to="/signup" className="text-emerald font-medium hover:underline">sign up</Link> again to receive a verification code.
        </p>
      </AuthLayout>
    );
  }

  const handleChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyOtp(email, otp);
      setSuccess(res.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      await resendOtp(email);
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit code sent to ${email}`}>
      {success ? (
        <p className="text-sm text-emerald font-medium">{success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2.5 justify-between" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-13 text-center text-lg font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
              />
            ))}
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit" disabled={submitting}
            className="w-full bg-emerald text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Verifying…" : "Verify"}
          </button>

          <p className="text-center text-sm text-slate">
            Didn't get a code?{" "}
            <button
              type="button" onClick={handleResend} disabled={resending || cooldown > 0}
              className="text-emerald font-medium hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}