const ticketService = require("../services/ticket.service");
const mailService = require("../services/mail.service");
const { paginate, getPaginationMeta } = require("../utils/pagination");
const User = require("../models/User.model");

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user._id);

    // Send email notification
    await mailService.sendTicketCreatedEmail(ticket, req.user);

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      assignee,
    } = req.query;
    const paginationOptions = paginate({}, page, limit);

    const filters = {
      status,
      priority,
      search,
      assignee,
    };

    // Users can only see their own tickets
    if (req.user.role === "user") {
      filters.owner = req.user._id;
    }

    // Agents can see assigned tickets or all if admin
    if (req.user.role === "agent" && !assignee) {
      filters.assignee = req.user._id;
    }

    const { tickets, total } = await ticketService.getTickets(
      filters,
      paginationOptions
    );
    const meta = getPaginationMeta(
      total,
      paginationOptions.page,
      paginationOptions.limit
    );

    res.status(200).json({
      success: true,
      data: tickets,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res, next) => {
  try {
    const oldStatus = req.ticket.status;
    const ticket = await ticketService.updateTicket(
      req.params.id,
      req.body,
      req.user._id
    );

    // Send email if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      const owner = await User.findById(ticket.owner._id);
      await mailService.sendTicketStatusChangedEmail(ticket, owner);

      if (req.body.status === "resolved") {
        await mailService.sendTicketResolvedEmail(ticket, owner);
      }
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Assign ticket to agent
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin/Agent
const assignTicket = async (req, res, next) => {
  try {
    const { assigneeId } = req.body;

    if (!assigneeId) {
      return res.status(400).json({
        success: false,
        message: "Assignee ID is required",
      });
    }

    const assignee = await User.findById(assigneeId);

    if (!assignee || !["agent", "admin"].includes(assignee.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignee. Must be an agent or admin",
      });
    }

    const ticket = await ticketService.assignTicket(
      req.params.id,
      assigneeId,
      req.user._id
    );

    // Send email notifications
    const owner = await User.findById(ticket.owner._id);
    await mailService.sendTicketAssignedEmail(ticket, assignee, owner);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload attachment to ticket
// @route   POST /api/tickets/:id/attachments
// @access  Private
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    const ticket = await ticketService.addAttachment(
      req.params.id,
      fileData,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: ticket.attachments[ticket.attachments.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate ticket
// @route   POST /api/tickets/:id/rate
// @access  Private
const rateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.rateTicket(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: ticket.rating,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
const deleteTicket = async (req, res, next) => {
  try {
    await ticketService.deleteTicket(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private
const getTicketStats = async (req, res, next) => {
  try {
    const userId = req.user.role === "user" ? req.user._id : null;
    const stats = await ticketService.getStatistics(userId, req.user.role);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  assignTicket,
  uploadAttachment,
  rateTicket,
  deleteTicket,
  getTicketStats,
};
