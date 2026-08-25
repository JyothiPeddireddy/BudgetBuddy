// import { Link } from "react-router-dom";
// import LoginForm from "../components/auth/LoginForm";
// import AuthLayout from "../components/layout/AuthLayout";

// export default function Login() {
//   return (
//     <AuthLayout
//       eyebrow="Welcome back"
//       title="Log in"
//       subtitle="Enter your email and password to continue."
//     >
//       <LoginForm />
//       <p className="auth-footer">
//         New here? <Link to="/signup">Open an account</Link>
//       </p>
//     </AuthLayout>
//   );
// }



import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import AuthLayout from "../components/layout/AuthLayout";

export default function Login() {
  return (
    <AuthLayout variant="login" title="Welcome Back! 👋" subtitle="Login to continue managing your finances.">
      <LoginForm />
      <p className="text-center text-sm text-slate mt-6">
        Don't have an account? <Link to="/signup" className="text-emerald font-medium hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}