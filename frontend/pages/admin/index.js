import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { ticketsAPI, usersAPI } from "../../services/api";
import Link from "next/link";
import {
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes] = await Promise.all([
        ticketsAPI.getStats(),
        ticketsAPI.getAll({ limit: 5 }),
      ]);
      setStats(statsRes.data.data);
      setRecentTickets(ticketsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout allowedRoles={["admin"]}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout allowedRoles={["admin"]}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of all tickets and system statistics
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <FiFileText className="w-8 h-8 mb-2" />
              <p className="text-sm opacity-90">Total Tickets</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <FiAlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm opacity-90">Open</p>
              <p className="text-3xl font-bold">{stats.open}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <FiUsers className="w-8 h-8 mb-2" />
              <p className="text-sm opacity-90">In Progress</p>
              <p className="text-3xl font-bold">{stats.inProgress}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <FiCheckCircle className="w-8 h-8 mb-2" />
              <p className="text-sm opacity-90">Resolved</p>
              <p className="text-3xl font-bold">{stats.resolved}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Priority Distribution</h2>
            {stats && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="badge badge-urgent">Urgent</span>
                  <span className="font-bold text-lg">{stats.urgent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="badge badge-high">High</span>
                  <span className="font-bold text-lg">{stats.high}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/admin/tickets"
                className="block p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-primary-700">View All Tickets</p>
              </Link>
              <Link
                href="/admin/users"
                className="block p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-primary-700">Manage Users</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Tickets</h2>
            <Link
              href="/admin/tickets"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/tickets/${ticket._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.owner?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge badge-${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge badge-${ticket.status}`}>
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
