import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import { ticketsAPI, commentsAPI, usersAPI } from "../../../services/api";
import { useAuth } from "../../../hooks/useAuth";
import {
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  capitalizeFirst,
} from "../../../utils/formatDate";
import { toast } from "react-toastify";
import { FiPaperclip, FiStar, FiUser, FiRefreshCw } from "react-icons/fi";

export default function TicketDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState({ score: 5, feedback: "" });
  const [showRating, setShowRating] = useState(false);
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");

  useEffect(() => {
    if (id) {
      fetchTicket();
      if (user && ["admin", "agent"].includes(user.role)) {
        fetchAgents();
      }
    }
  }, [id, user]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getById(id);
      setTicket(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch ticket");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await usersAPI.getAgents();
      setAgents(response.data.data);
    } catch (error) {
      console.error("Failed to fetch agents");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.create(id, { text: commentText });
      setCommentText("");
      await fetchTicket();
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ticketsAPI.rate(id, rating);
      await fetchTicket();
      setShowRating(false);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rate ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketsAPI.update(id, { status: newStatus });
      await fetchTicket();
      toast.success("Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleReassign = async () => {
    if (!selectedAgent) {
      toast.error("Please select an agent");
      return;
    }

    try {
      setSubmitting(true);
      await ticketsAPI.assign(id, selectedAgent);
      await fetchTicket();
      setShowAssignModal(false);
      setSelectedAgent("");
      toast.success("Ticket reassigned successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reassign ticket");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return <Layout>Ticket not found</Layout>;
  }

  const isOwner = ticket.owner._id === user?._id;
  const isAssignee = ticket.assignee && ticket.assignee._id === user?._id;
  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";
  const canRate =
    isOwner && ["resolved", "closed"].includes(ticket.status) && !ticket.rating;
  const canReassign = (isAdmin || isAgent) && ticket.status !== "closed";
  const canChangeStatus = (isAssignee || isAdmin) && ticket.status !== "closed";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to tickets
          </button>

          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {ticket.subject}
                </h1>
                <div className="flex gap-2 mb-4">
                  <span className={`badge ${getStatusColor(ticket.status)}`}>
                    {capitalizeFirst(ticket.status)}
                  </span>
                  <span
                    className={`badge ${getPriorityColor(ticket.priority)}`}
                  >
                    {capitalizeFirst(ticket.priority)}
                  </span>
                </div>
              </div>

              {/* Action buttons for agents/admin */}
              {canReassign && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="btn btn-secondary flex items-center gap-2 ml-2"
                >
                  <FiRefreshCw /> Reassign
                </button>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Created by:</p>
                <p className="font-medium">{ticket.owner.name}</p>
                <p className="text-gray-500">
                  {formatDateTime(ticket.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Assigned to:</p>
                {ticket.assignee ? (
                  <p className="font-medium flex items-center gap-2">
                    <FiUser className="text-primary-600" />
                    {ticket.assignee.name}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Not assigned yet</p>
                )}
              </div>
            </div>

            {/* Status Change Buttons for Agents/Admin */}
            {canChangeStatus && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Change Status:
                </p>
                <div className="flex flex-wrap gap-2">
                  {ticket.status === "open" && (
                    <button
                      onClick={() => handleStatusChange("in-progress")}
                      className="btn btn-primary text-sm"
                    >
                      Mark as In Progress
                    </button>
                  )}
                  {ticket.status === "in-progress" && (
                    <>
                      <button
                        onClick={() => handleStatusChange("resolved")}
                        className="btn btn-primary text-sm"
                      >
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => handleStatusChange("open")}
                        className="btn btn-secondary text-sm"
                      >
                        Reopen
                      </button>
                    </>
                  )}
                  {ticket.status === "resolved" && (
                    <>
                      <button
                        onClick={() => handleStatusChange("closed")}
                        className="btn btn-primary text-sm"
                      >
                        Close Ticket
                      </button>
                      <button
                        onClick={() => handleStatusChange("in-progress")}
                        className="btn btn-secondary text-sm"
                      >
                        Reopen
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Ticket History */}
            {ticket.statusHistory && ticket.statusHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Status History:
                </p>
                <div className="space-y-2">
                  {ticket.statusHistory.map((history, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 flex justify-between"
                    >
                      <span>
                        Changed to{" "}
                        <span
                          className={`badge ${getStatusColor(
                            history.status
                          )} text-xs`}
                        >
                          {capitalizeFirst(history.status)}
                        </span>
                      </span>
                      <span className="text-xs">
                        {formatDateTime(history.changedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Attachments:</p>
                {ticket.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-primary-600"
                  >
                    <FiPaperclip />
                    <span>{att.originalName}</span>
                  </div>
                ))}
              </div>
            )}

            {ticket.rating && (
              <div className="mt-4 pt-4 border-t bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Customer Rating:</p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={
                        i < ticket.rating.score
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({ticket.rating.score}/5)
                  </span>
                </div>
                {ticket.rating.feedback && (
                  <p className="text-sm text-gray-700">
                    {ticket.rating.feedback}
                  </p>
                )}
              </div>
            )}

            {canRate && (
              <div className="mt-4 pt-4 border-t">
                {!showRating ? (
                  <button
                    onClick={() => setShowRating(true)}
                    className="btn btn-primary"
                  >
                    Rate This Ticket
                  </button>
                ) : (
                  <form onSubmit={handleRateTicket} className="space-y-4">
                    <div>
                      <label className="label">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setRating({ ...rating, score })}
                            className="text-2xl"
                          >
                            <FiStar
                              className={
                                score <= rating.score
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Feedback (Optional)</label>
                      <textarea
                        value={rating.feedback}
                        onChange={(e) =>
                          setRating({ ...rating, feedback: e.target.value })
                        }
                        className="input"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                      >
                        Submit Rating
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRating(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            Comments ({ticket.comments?.length || 0})
          </h2>

          <div className="space-y-4 mb-6">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.author.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {comment.author.role}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </div>

          {ticket.status !== "closed" && (
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <label className="label">Add Comment</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Type your comment here..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "Sending..." : "Add Comment"}
              </button>
            </form>
          )}
        </div>

        {/* Reassignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Reassign Ticket</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Select Agent</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="input"
                  >
                    <option value="">Choose an agent...</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email}) - {agent.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReassign}
                    disabled={submitting || !selectedAgent}
                    className="btn btn-primary"
                  >
                    {submitting ? "Reassigning..." : "Reassign"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedAgent("");
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
