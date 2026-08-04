import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import AuthLayout from "../components/layout/AuthLayout";

export default function Login() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in"
      subtitle="Enter your email and password to continue."
    >
      <LoginForm />
      <p className="mt-8 text-sm text-slate">
        New here?{" "}
        <Link to="/signup" className="text-ink underline underline-offset-2">
          Open an account
        </Link>
      </p>
    </AuthLayout>
  );
}