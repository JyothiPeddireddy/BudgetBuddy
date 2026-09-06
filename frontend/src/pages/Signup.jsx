import { Link } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";
import AuthLayout from "../components/layout/AuthLayout";

export default function Signup() {
  return (
    <AuthLayout variant="signup" title="Create Your Account " subtitle="Start your journey to financial freedom.">
      <SignupForm />
      <p className="text-center text-sm text-slate mt-6">
        Already have an account? <Link to="/login" className="text-emerald font-medium hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
}