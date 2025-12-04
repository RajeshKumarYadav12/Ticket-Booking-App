import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import { ticketsAPI } from "../../../services/api";
import { toast } from "react-toastify";

export default function NewTicket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ticketsAPI.create(formData);
      const ticketId = response.data.data._id;

      // Upload file if provided
      if (file) {
        await ticketsAPI.uploadAttachment(ticketId, file);
      }

      toast.success("Ticket created successfully!");
      router.push(`/dashboard/tickets/${ticketId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Ticket
          </h1>
          <p className="text-gray-600 mt-1">Tell us about your issue</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label htmlFor="subject" className="label">
              Subject *
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              className="input"
              placeholder="Brief description of your issue"
              required
              minLength={5}
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[150px]"
              placeholder="Provide detailed information about your issue"
              required
              minLength={10}
            />
          </div>

          <div>
            <label htmlFor="priority" className="label">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="file" className="label">
              Attachment (Optional)
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="input"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <p className="text-sm text-gray-500 mt-1">
              Accepted: Images, PDF, DOC, DOCX, TXT (Max 5MB)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
