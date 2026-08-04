import { Link } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";
import AuthLayout from "../components/layout/AuthLayout";

export default function Signup() {
  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Takes less than a minute."
    >
      <SignupForm />
      <p className="mt-8 text-sm text-slate">
        Already have an account?{" "}
        <Link to="/login" className="text-ink underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}