const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in-progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const USER_ROLES = {
  USER: "user",
  AGENT: "agent",
  ADMIN: "admin",
};

const VALID_STATUS_TRANSITIONS = {
  open: ["in-progress", "closed"],
  "in-progress": ["resolved", "open"],
  resolved: ["closed", "in-progress"],
  closed: [],
};

module.exports = {
  TICKET_STATUS,
  TICKET_PRIORITY,
  USER_ROLES,
  VALID_STATUS_TRANSITIONS,
};
