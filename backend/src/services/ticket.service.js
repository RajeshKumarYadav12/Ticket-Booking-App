const Ticket = require("../models/Ticket.model");
const Comment = require("../models/Comment.model");
const { VALID_STATUS_TRANSITIONS } = require("../utils/enums");

class TicketService {
  // Create new ticket
  async createTicket(ticketData, userId) {
    const ticket = await Ticket.create({
      ...ticketData,
      owner: userId,
    });

    return await ticket.populate("owner", "name email");
  }

  // Get all tickets with filters
  async getTickets(filters, options) {
    const { page, limit, skip } = options;
    const query = {};

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.owner) {
      query.owner = filters.owner;
    }

    if (filters.assignee) {
      query.assignee = filters.assignee;
    }

    if (filters.search) {
      query.$or = [
        { subject: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Get tickets
    const tickets = await Ticket.find(query)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Ticket.countDocuments(query);

    return { tickets, total };
  }

  // Get ticket by ID
  async getTicketById(ticketId) {
    const ticket = await Ticket.findById(ticketId)
      .populate("owner", "name email role")
      .populate("assignee", "name email role")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name email role" },
        options: { sort: { createdAt: 1 } },
      })
      .populate("attachments.uploadedBy", "name email");

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
  }

  // Update ticket
  async updateTicket(ticketId, updates, userId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Validate status transition
    if (updates.status && updates.status !== ticket.status) {
      const allowedTransitions = VALID_STATUS_TRANSITIONS[ticket.status];

      if (!allowedTransitions.includes(updates.status)) {
        throw new Error(
          `Cannot transition from ${ticket.status} to ${updates.status}`
        );
      }

      ticket._statusChangedBy = userId;
    }

    // Apply updates
    Object.assign(ticket, updates);
    await ticket.save();

    return await this.getTicketById(ticketId);
  }

  // Assign ticket to agent
  async assignTicket(ticketId, assigneeId, userId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.assignee = assigneeId;

    // Auto-change status to in-progress if it's open
    if (ticket.status === "open") {
      ticket.status = "in-progress";
      ticket._statusChangedBy = userId;
    }

    await ticket.save();

    return await this.getTicketById(ticketId);
  }

  // Add attachment to ticket
  async addAttachment(ticketId, fileData, userId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.attachments.push({
      ...fileData,
      uploadedBy: userId,
    });

    await ticket.save();

    return ticket;
  }

  // Rate ticket
  async rateTicket(ticketId, ratingData, userId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Only owner can rate and only if resolved or closed
    if (ticket.owner.toString() !== userId.toString()) {
      throw new Error("Only ticket owner can rate");
    }

    if (!["resolved", "closed"].includes(ticket.status)) {
      throw new Error("Can only rate resolved or closed tickets");
    }

    ticket.rating = {
      ...ratingData,
      ratedAt: new Date(),
    };

    await ticket.save();

    return ticket;
  }

  // Delete ticket
  async deleteTicket(ticketId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Delete associated comments
    await Comment.deleteMany({ ticket: ticketId });

    await ticket.deleteOne();

    return { message: "Ticket deleted successfully" };
  }

  // Get ticket statistics
  async getStatistics(userId = null, role = "user") {
    const matchStage = userId && role === "user" ? { owner: userId } : {};

    const stats = await Ticket.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
        },
      },
    ]);

    return (
      stats[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
        high: 0,
      }
    );
  }
}

module.exports = new TicketService();
