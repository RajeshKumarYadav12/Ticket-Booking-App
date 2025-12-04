import Link from "next/link";
import {
  formatRelative,
  getStatusColor,
  getPriorityColor,
  capitalizeFirst,
} from "../../utils/formatDate";

export default function TicketCard({ ticket }) {
  return (
    <Link href={`/dashboard/tickets/${ticket._id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {ticket.subject}
          </h3>
          <span className={`badge ${getPriorityColor(ticket.priority)} ml-2`}>
            {capitalizeFirst(ticket.priority)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between">
          <span className={`badge ${getStatusColor(ticket.status)}`}>
            {capitalizeFirst(ticket.status)}
          </span>

          <div className="text-sm text-gray-500">
            {formatRelative(ticket.createdAt)}
          </div>
        </div>

        {ticket.assignee && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
            Assigned to:{" "}
            <span className="font-medium">{ticket.assignee.name}</span>
          </div>
        )}

        {ticket.comments && ticket.comments.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            💬 {ticket.comments.length}{" "}
            {ticket.comments.length === 1 ? "comment" : "comments"}
          </div>
        )}
      </div>
    </Link>
  );
}
