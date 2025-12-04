const Comment = require("../models/Comment.model");
const Ticket = require("../models/Ticket.model");
const User = require("../models/User.model");
const mailService = require("../services/mail.service");

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text, isInternal } = req.body;
    const ticketId = req.params.id;

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Create comment
    const comment = await Comment.create({
      text,
      author: req.user._id,
      ticket: ticketId,
      isInternal: isInternal || false,
    });

    // Add comment to ticket
    ticket.comments.push(comment._id);
    await ticket.save();

    // Populate comment
    await comment.populate("author", "name email role");

    // Send email notifications (skip internal comments for customers)
    if (!isInternal) {
      // Notify ticket owner if comment is from agent/admin
      if (req.user._id.toString() !== ticket.owner.toString()) {
        const owner = await User.findById(ticket.owner);
        if (owner) {
          await mailService.sendTicketCommentEmail(ticket, comment, owner);
        }
      }

      // Notify assignee if comment is from owner
      if (
        ticket.assignee &&
        req.user._id.toString() !== ticket.assignee.toString()
      ) {
        const assignee = await User.findById(ticket.assignee);
        if (assignee) {
          await mailService.sendTicketCommentEmail(ticket, comment, assignee);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments for a ticket
// @route   GET /api/tickets/:id/comments
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    // Verify ticket exists and user has access
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Build query
    const query = { ticket: ticketId };

    // Hide internal comments from regular users
    if (req.user.role === "user") {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate("author", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only author or admin can update
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    comment.text = req.body.text || comment.text;
    await comment.save();

    await comment.populate("author", "name email role");

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only author or admin can delete
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Remove comment from ticket
    await Ticket.findByIdAndUpdate(comment.ticket, {
      $pull: { comments: comment._id },
    });

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment,
};
