import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("This verification link is missing its token.");
        return;
      }
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.detail || "This link is invalid or has expired.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center max-w-sm">
        {status === "verifying" && (
          <p className="font-mono text-sm text-slate">Checking your entry…</p>
        )}

        {status === "success" && (
          <>
            <div className="stamp inline-block border-[3px] border-gold text-gold px-6 py-3 rotate-[-7deg] mb-6">
              <span className="font-display text-2xl tracking-widest">VERIFIED</span>
            </div>
            <p className="text-ink mb-6">{message}</p>
            <Link to="/login" className="text-sm text-ink underline underline-offset-2">
              Continue to sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-brick font-medium mb-2">Couldn't verify that entry.</p>
            <p className="text-sm text-slate mb-6">{message}</p>
            <Link to="/signup" className="text-sm text-ink underline underline-offset-2">
              Back to signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}