import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiSettings,
  FiPlus,
  FiBarChart2,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const isActive = (path) => router.pathname === path;

  const userLinks = [
    { href: "/dashboard", icon: FiHome, label: "Dashboard" },
    { href: "/dashboard/tickets/new", icon: FiPlus, label: "New Ticket" },
  ];

  const adminLinks = [
    { href: "/admin", icon: FiHome, label: "Dashboard" },
    { href: "/admin/tickets", icon: FiFileText, label: "All Tickets" },
    { href: "/admin/users", icon: FiUsers, label: "Users" },
    { href: "/admin/stats", icon: FiBarChart2, label: "Statistics" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(link.href)
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
