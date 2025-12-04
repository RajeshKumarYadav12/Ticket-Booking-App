const Ticket = require("../models/Ticket.model");

// Authorize by role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// Check if user is agent or admin
const isAgentOrAdmin = (req, res, next) => {
  if (!["agent", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Agent or Admin access required",
    });
  }
  next();
};

// Check if user owns the ticket or is admin/assigned agent
const canAccessTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isOwner = ticket.owner.toString() === req.user._id.toString();
    const isAssignee =
      ticket.assignee && ticket.assignee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isAgent = req.user.role === "agent";

    if (!isOwner && !isAssignee && !isAdmin && !isAgent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this ticket",
      });
    }

    req.ticket = ticket;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking ticket access",
    });
  }
};

// Check if user can modify the ticket
const canModifyTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const isOwner = ticket.owner.toString() === req.user._id.toString();
    const isAssignee =
      ticket.assignee && ticket.assignee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // Owner can only modify open tickets they created
    if (isOwner && ticket.status === "open") {
      req.ticket = ticket;
      return next();
    }

    // Assignee and admin can modify assigned tickets
    if ((isAssignee || isAdmin) && ticket.status !== "closed") {
      req.ticket = ticket;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized to modify this ticket",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking ticket modification rights",
    });
  }
};

module.exports = {
  authorize,
  isAdmin,
  isAgentOrAdmin,
  canAccessTicket,
  canModifyTicket,
};
