import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Ticketing System
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Streamline your IT support and customer service with our
            comprehensive ticketing solution
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">
                Easy Ticket Management
              </h3>
              <p className="text-gray-600">
                Create, track, and resolve tickets efficiently
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Admin, Agent, and User roles with specific permissions
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Get notified about ticket status changes instantly
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <Link href="/login" className="btn btn-primary text-lg px-8 py-3">
              Login
            </Link>
            <Link
              href="/register"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Register
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border-2 border-primary-200">
            <h3 className="text-2xl font-bold mb-2 text-primary-600">
              🔐 Demo Login Credentials
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Use these credentials to test different user roles
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <p className="font-bold text-lg text-purple-700 mb-3 flex items-center gap-2">
                  👑 Admin
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Email:
                    </p>
                    <p className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded">
                      admin@ticketing.com
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Password:
                    </p>
                    <p className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded">
                      Admin@123
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="font-bold text-lg text-blue-700 mb-3 flex items-center gap-2">
                  🎧 Support Agent
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Email:
                    </p>
                    <p className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded">
                      agent1@ticketing.com
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Password:
                    </p>
                    <p className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded">
                      Agent@123
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="font-bold text-lg text-green-700 mb-3 flex items-center gap-2">
                  👤 Regular User
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Email:
                    </p>
                    <p className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded">
                      john@example.com
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Password:
                    </p>
                    <p className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded">
                      User@123
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-300 mb-2">
              © 2025 Ticketing System. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Streamline your IT support and customer service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
