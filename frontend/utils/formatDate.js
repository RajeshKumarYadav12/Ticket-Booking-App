import { format, formatDistance } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy HH:mm");
};

export const formatRelative = (date) => {
  if (!date) return "";
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const getStatusColor = (status) => {
  const colors = {
    open: "badge-open",
    "in-progress": "badge-in-progress",
    resolved: "badge-resolved",
    closed: "badge-closed",
  };
  return colors[status] || "badge-open";
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: "badge-low",
    medium: "badge-medium",
    high: "badge-high",
    urgent: "badge-urgent",
  };
  return colors[priority] || "badge-medium";
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
