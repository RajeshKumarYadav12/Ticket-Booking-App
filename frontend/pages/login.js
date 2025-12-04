import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center mb-4">
              Quick Login:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  setEmail("admin@ticketing.com");
                  setPassword("Admin@123");
                }}
                className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setEmail("agent1@ticketing.com");
                  setPassword("Agent@123");
                }}
                className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Agent
              </button>
              <button
                onClick={() => {
                  setEmail("john@example.com");
                  setPassword("User@123");
                }}
                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                User
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
