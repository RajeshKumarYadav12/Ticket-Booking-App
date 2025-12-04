import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import TicketList from "../../components/tickets/TicketList";
import TicketFilters from "../../components/tickets/TicketFilters";
import { ticketsAPI } from "../../services/api";
import { toast } from "react-toastify";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchTickets();
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

  return (
    <Layout allowedRoles={["admin", "agent"]}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Tickets</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all support tickets
          </p>
        </div>

        <TicketFilters onFilterChange={setFilters} />

        <TicketList
          tickets={tickets}
          loading={loading}
          emptyMessage="No tickets found matching the filters"
        />
      </div>
    </Layout>
  );
}
