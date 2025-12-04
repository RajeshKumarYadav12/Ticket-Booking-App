import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import TicketList from "../../components/tickets/TicketList";
import TicketFilters from "../../components/tickets/TicketFilters";
import { ticketsAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getAll(filters);
      setTickets(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ticketsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-600 mt-1">Manage your support tickets</p>
          </div>
          <Link
            href="/dashboard/tickets/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus /> New Ticket
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-blue-50">
              <p className="text-blue-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="card bg-yellow-50">
              <p className="text-yellow-600 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.open}</p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-purple-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-purple-900">
                {stats.inProgress}
              </p>
            </div>
            <div className="card bg-green-50">
              <p className="text-green-600 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.resolved}
              </p>
            </div>
          </div>
        )}

        <TicketFilters onFilterChange={setFilters} />

        <TicketList
          tickets={tickets}
          loading={loading}
          emptyMessage="You haven't created any tickets yet. Click 'New Ticket' to get started."
        />
      </div>
    </Layout>
  );
}
