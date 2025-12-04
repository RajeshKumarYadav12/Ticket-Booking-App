const express = require("express");
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  assignTicket,
  uploadAttachment,
  rateTicket,
  deleteTicket,
  getTicketStats,
} = require("../controllers/ticket.controller");
const { protect } = require("../middlewares/auth.middleware");
const {
  canAccessTicket,
  canModifyTicket,
  isAdmin,
  isAgentOrAdmin,
} = require("../middlewares/roles.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  validate,
  createTicketSchema,
  updateTicketSchema,
  rateTicketSchema,
} = require("../utils/validators");

router.use(protect);

// Stats route
router.get("/stats", getTicketStats);

// Ticket CRUD
router
  .route("/")
  .get(getTickets)
  .post(validate(createTicketSchema), createTicket);

router
  .route("/:id")
  .get(canAccessTicket, getTicket)
  .put(canModifyTicket, validate(updateTicketSchema), updateTicket)
  .delete(isAdmin, deleteTicket);

// Assignment
router.put("/:id/assign", isAgentOrAdmin, assignTicket);

// Attachments
router.post(
  "/:id/attachments",
  canAccessTicket,
  upload.single("file"),
  uploadAttachment
);

// Rating
router.post(
  "/:id/rate",
  canAccessTicket,
  validate(rateTicketSchema),
  rateTicket
);

module.exports = router;
