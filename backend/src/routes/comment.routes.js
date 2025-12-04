const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { protect } = require("../middlewares/auth.middleware");
const { canAccessTicket } = require("../middlewares/roles.middleware");
const { validate, createCommentSchema } = require("../utils/validators");

router.use(protect);

// Comments on tickets
router
  .route("/")
  .get(canAccessTicket, getComments)
  .post(canAccessTicket, validate(createCommentSchema), addComment);

// Individual comments
router
  .route("/:commentId")
  .put(validate(createCommentSchema), updateComment)
  .delete(deleteComment);

module.exports = router;
