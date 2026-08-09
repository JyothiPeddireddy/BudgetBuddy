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
      <p className="auth-footer">
        New here? <Link to="/signup">Open an account</Link>
      </p>
    </AuthLayout>
  );
}