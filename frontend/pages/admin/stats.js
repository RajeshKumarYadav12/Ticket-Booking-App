import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { ticketsAPI, usersAPI } from "../../services/api";
import {
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import { formatDateTime } from "../../utils/formatDate";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, ticketsRes] = await Promise.all([
        ticketsAPI.getStats(),
        usersAPI.getAll(),
        ticketsAPI.getAll({ limit: 100 }),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setTickets(ticketsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (!tickets.length) return null;

    const priorityCounts = {
      low: tickets.filter((t) => t.priority === "low").length,
      medium: tickets.filter((t) => t.priority === "medium").length,
      high: tickets.filter((t) => t.priority === "high").length,
      urgent: tickets.filter((t) => t.priority === "urgent").length,
    };

    const userCounts = {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      agents: users.filter((u) => u.role === "agent").length,
      users: users.filter((u) => u.role === "user").length,
    };

    const resolvedTickets = tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    );
    const resolutionRate = tickets.length
      ? ((resolvedTickets.length / tickets.length) * 100).toFixed(1)
      : 0;

    const openTickets = tickets.filter((t) => t.status === "open");
    const inProgressTickets = tickets.filter((t) => t.status === "in-progress");

    return {
      priorityCounts,
      userCounts,
      resolutionRate,
      openTickets: openTickets.length,
      inProgressTickets: inProgressTickets.length,
    };
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

  const metrics = calculateMetrics();

  return (
    <Layout allowedRoles={["admin"]}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            System Statistics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of system performance and metrics
          </p>
        </div>

        {/* Overall Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Total Tickets
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <FiFileText className="text-4xl text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">
                    Open Tickets
                  </p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {stats.open}
                  </p>
                </div>
                <FiAlertCircle className="text-4xl text-yellow-600 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {stats.inProgress}
                  </p>
                </div>
                <FiClock className="text-4xl text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {stats.resolved}
                  </p>
                </div>
                <FiCheckCircle className="text-4xl text-green-600 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* User Statistics */}
        {metrics && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* User Breakdown */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiUsers className="text-primary-600" />
                  User Distribution
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Administrators
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      {metrics.userCounts.admins}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Support Agents
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {metrics.userCounts.agents}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Regular Users
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {metrics.userCounts.users}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <span className="font-bold text-gray-800">Total Users</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics.userCounts.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-primary-600" />
                  Ticket Priorities
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-700">Urgent</span>
                    <span className="text-2xl font-bold text-red-600">
                      {metrics.priorityCounts.urgent}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      High Priority
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      {metrics.priorityCounts.high}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Medium Priority
                    </span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {metrics.priorityCounts.medium}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Low Priority
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {metrics.priorityCounts.low}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="card mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiActivity className="text-primary-600" />
                Performance Metrics
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <p className="text-green-600 font-medium mb-2">
                    Resolution Rate
                  </p>
                  <p className="text-4xl font-bold text-green-700">
                    {metrics.resolutionRate}%
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Tickets Resolved/Closed
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                  <p className="text-yellow-600 font-medium mb-2">
                    Pending Tickets
                  </p>
                  <p className="text-4xl font-bold text-yellow-700">
                    {metrics.openTickets}
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    Awaiting Assignment
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-blue-600 font-medium mb-2">Active Work</p>
                  <p className="text-4xl font-bold text-blue-700">
                    {metrics.inProgressTickets}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    Currently Being Handled
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Subject</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 10).map((ticket) => (
                      <tr
                        key={ticket._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{ticket.subject}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              ticket.status === "open"
                                ? "bg-yellow-100 text-yellow-800"
                                : ticket.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : ticket.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              ticket.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : ticket.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : ticket.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDateTime(ticket.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
