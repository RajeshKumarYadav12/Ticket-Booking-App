import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import { FiLogOut, FiUser } from "react-icons/fi";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href={user?.role === "admin" ? "/admin" : "/dashboard"}
            className="text-2xl font-bold text-primary-600"
          >
            Ticketing System
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiUser className="text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
